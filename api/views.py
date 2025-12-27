from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from django.db.models import Q
from django.db import transaction
from drf_spectacular.utils import extend_schema
from .serializers import (
    MessageSerializer, RegisterSerializer, LoginSerializer, MemberSerializer,
    BoardSerializer, BoardCreateSerializer, BoardInviteSerializer,
    ColumnSerializer, ColumnCreateSerializer, ColumnReorderSerializer,
    CardSerializer, CardCreateSerializer, CardMoveSerializer
)
from .models import Member, Board, BoardMember, Column, Card


class HelloView(APIView):
    """
    A simple API endpoint that returns a greeting message.
    """

    @extend_schema(
        responses={200: MessageSerializer}, description="Get a hello world message"
    )
    def get(self, request):
        data = {"message": "Hello!", "timestamp": timezone.now()}
        serializer = MessageSerializer(data)
        return Response(serializer.data)


class RegisterView(APIView):
    """
    API endpoint for user registration
    """

    @extend_schema(
        request=RegisterSerializer,
        responses={201: MemberSerializer},
        description="Register a new user"
    )
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            member = serializer.save()
            member_serializer = MemberSerializer(member)
            return Response(member_serializer.data, status=status.HTTP_201_CREATED)
        return Response({'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    """
    API endpoint for user login
    """

    @extend_schema(
        request=LoginSerializer,
        responses={200: MemberSerializer},
        description="Authenticate user and create session"
    )
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            password = serializer.validated_data['password']

            try:
                member = Member.objects.get(email=email)
                if member.check_password(password):
                    # Set session cookie
                    request.session['member_id'] = member.id
                    request.session.save()

                    member_serializer = MemberSerializer(member)
                    return Response(member_serializer.data, status=status.HTTP_200_OK)
                else:
                    return Response(
                        {'detail': 'Invalid email or password'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
            except Member.DoesNotExist:
                return Response(
                    {'detail': 'Invalid email or password'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        return Response({'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)


class LogoutView(APIView):
    """
    API endpoint for user logout
    """

    @extend_schema(
        responses={200: dict},
        description="End user session and clear authentication cookie"
    )
    def post(self, request):
        member_id = request.session.get('member_id')
        if not member_id:
            return Response(
                {'detail': 'Authentication required'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        request.session.flush()
        return Response(
            {'detail': 'Successfully logged out'},
            status=status.HTTP_200_OK
        )


class MeView(APIView):
    """
    API endpoint to get current authenticated user
    """

    @extend_schema(
        responses={200: MemberSerializer},
        description="Retrieve information about the currently authenticated user"
    )
    def get(self, request):
        member_id = request.session.get('member_id')
        if not member_id:
            return Response(
                {'detail': 'Authentication required'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        try:
            member = Member.objects.get(id=member_id)
            serializer = MemberSerializer(member)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Member.DoesNotExist:
            return Response(
                {'detail': 'Authentication required'},
                status=status.HTTP_401_UNAUTHORIZED
            )


class BoardListCreateView(APIView):
    """
    API endpoint for listing and creating boards
    """

    @extend_schema(
        responses={200: BoardSerializer(many=True)},
        description="Get list of boards where user is owner or member"
    )
    def get(self, request):
        member_id = request.session.get('member_id')
        if not member_id:
            return Response(
                {'detail': 'Authentication required'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        try:
            member = Member.objects.get(id=member_id)
        except Member.DoesNotExist:
            return Response(
                {'detail': 'Authentication required'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        # Get boards where user is owner or member
        board_memberships = BoardMember.objects.filter(member=member).values_list('board_id', flat=True)
        boards = Board.objects.filter(
            Q(owner=member) | Q(id__in=board_memberships)
        ).distinct()

        serializer = BoardSerializer(boards, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @extend_schema(
        request=BoardCreateSerializer,
        responses={201: BoardSerializer},
        description="Create a new board with authenticated user as owner"
    )
    def post(self, request):
        member_id = request.session.get('member_id')
        if not member_id:
            return Response(
                {'detail': 'Authentication required'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        try:
            member = Member.objects.get(id=member_id)
        except Member.DoesNotExist:
            return Response(
                {'detail': 'Authentication required'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        serializer = BoardCreateSerializer(data=request.data)
        if serializer.is_valid():
            board = serializer.save(owner=member)
            # Create BoardMember entry for owner
            BoardMember.objects.create(board=board, member=member, role='owner')
            response_serializer = BoardSerializer(board)
            return Response(response_serializer.data, status=status.HTTP_201_CREATED)
        return Response({'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)


class BoardDetailView(APIView):
    """
    API endpoint for retrieving, updating, and deleting a specific board
    """

    def _get_member(self, request):
        """Helper method to get authenticated member"""
        member_id = request.session.get('member_id')
        if not member_id:
            return None
        try:
            return Member.objects.get(id=member_id)
        except Member.DoesNotExist:
            return None

    def _has_board_access(self, board, member):
        """Check if member has access to board"""
        return board.owner == member or BoardMember.objects.filter(board=board, member=member).exists()

    def _is_board_owner(self, board, member):
        """Check if member is board owner"""
        return board.owner == member

    @extend_schema(
        responses={200: BoardSerializer},
        description="Retrieve detailed information about a specific board"
    )
    def get(self, request, id):
        member = self._get_member(request)
        if not member:
            return Response(
                {'detail': 'Authentication required'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        try:
            board = Board.objects.get(id=id)
        except Board.DoesNotExist:
            return Response(
                {'detail': 'Board not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        if not self._has_board_access(board, member):
            return Response(
                {'detail': 'Access forbidden'},
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = BoardSerializer(board)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @extend_schema(
        request=BoardCreateSerializer,
        responses={200: BoardSerializer},
        description="Update board information (only owner can update)"
    )
    def patch(self, request, id):
        member = self._get_member(request)
        if not member:
            return Response(
                {'detail': 'Authentication required'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        try:
            board = Board.objects.get(id=id)
        except Board.DoesNotExist:
            return Response(
                {'detail': 'Board not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        if not self._is_board_owner(board, member):
            return Response(
                {'detail': 'Access forbidden'},
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = BoardCreateSerializer(board, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            response_serializer = BoardSerializer(board)
            return Response(response_serializer.data, status=status.HTTP_200_OK)
        return Response({'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

    @extend_schema(
        responses={204: None},
        description="Delete board (only owner can delete)"
    )
    def delete(self, request, id):
        member = self._get_member(request)
        if not member:
            return Response(
                {'detail': 'Authentication required'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        try:
            board = Board.objects.get(id=id)
        except Board.DoesNotExist:
            return Response(
                {'detail': 'Board not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        if not self._is_board_owner(board, member):
            return Response(
                {'detail': 'Access forbidden'},
                status=status.HTTP_403_FORBIDDEN
            )

        board.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class BoardInviteView(APIView):
    """
    API endpoint for inviting members to a board
    """

    @extend_schema(
        request=BoardInviteSerializer,
        responses={200: BoardSerializer},
        description="Add a member to board (only owner can invite)"
    )
    def post(self, request, id):
        member_id = request.session.get('member_id')
        if not member_id:
            return Response(
                {'detail': 'Authentication required'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        try:
            member = Member.objects.get(id=member_id)
        except Member.DoesNotExist:
            return Response(
                {'detail': 'Authentication required'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        try:
            board = Board.objects.get(id=id)
        except Board.DoesNotExist:
            return Response(
                {'detail': 'Board not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        if board.owner != member:
            return Response(
                {'detail': 'Access forbidden'},
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = BoardInviteSerializer(data=request.data)
        if serializer.is_valid():
            invited_member_id = serializer.validated_data['member_id']
            
            try:
                invited_member = Member.objects.get(id=invited_member_id)
            except Member.DoesNotExist:
                return Response(
                    {'detail': 'Member not found'},
                    status=status.HTTP_404_NOT_FOUND
                )

            # Check if member is already in board
            if BoardMember.objects.filter(board=board, member=invited_member).exists():
                return Response(
                    {'detail': 'Member already added to this board'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Add member to board
            BoardMember.objects.create(board=board, member=invited_member, role='member')
            
            response_serializer = BoardSerializer(board)
            return Response(response_serializer.data, status=status.HTTP_200_OK)
        return Response({'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)


class ColumnListCreateView(APIView):
    """
    API endpoint for listing and creating columns
    """

    def _get_member(self, request):
        """Helper method to get authenticated member"""
        member_id = request.session.get('member_id')
        if not member_id:
            return None
        try:
            return Member.objects.get(id=member_id)
        except Member.DoesNotExist:
            return None

    def _has_board_access(self, board, member):
        """Check if member has access to board"""
        return board.owner == member or BoardMember.objects.filter(board=board, member=member).exists()

    @extend_schema(
        responses={200: ColumnSerializer(many=True)},
        description="Retrieve all columns for a specific board"
    )
    def get(self, request):
        member = self._get_member(request)
        if not member:
            return Response(
                {'detail': 'Authentication required'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        board_id = request.query_params.get('board_id')
        if not board_id:
            return Response(
                {'detail': 'board_id parameter is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            board = Board.objects.get(id=board_id)
        except Board.DoesNotExist:
            return Response(
                {'detail': 'Board not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        if not self._has_board_access(board, member):
            return Response(
                {'detail': 'Access forbidden'},
                status=status.HTTP_403_FORBIDDEN
            )

        columns = Column.objects.filter(board=board)
        serializer = ColumnSerializer(columns, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @extend_schema(
        request=ColumnCreateSerializer,
        responses={201: ColumnSerializer},
        description="Create a new column in a board"
    )
    def post(self, request):
        member = self._get_member(request)
        if not member:
            return Response(
                {'detail': 'Authentication required'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        serializer = ColumnCreateSerializer(data=request.data)
        if serializer.is_valid():
            board = serializer.validated_data['board']
            
            if not self._has_board_access(board, member):
                return Response(
                    {'detail': 'Access forbidden'},
                    status=status.HTTP_403_FORBIDDEN
                )

            column = serializer.save()
            response_serializer = ColumnSerializer(column)
            return Response(response_serializer.data, status=status.HTTP_201_CREATED)
        return Response({'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)


class ColumnDetailView(APIView):
    """
    API endpoint for updating and deleting a specific column
    """

    def _get_member(self, request):
        """Helper method to get authenticated member"""
        member_id = request.session.get('member_id')
        if not member_id:
            return None
        try:
            return Member.objects.get(id=member_id)
        except Member.DoesNotExist:
            return None

    def _has_board_access(self, board, member):
        """Check if member has access to board"""
        return board.owner == member or BoardMember.objects.filter(board=board, member=member).exists()

    @extend_schema(
        request=ColumnSerializer,
        responses={200: ColumnSerializer},
        description="Update column information"
    )
    def patch(self, request, id):
        member = self._get_member(request)
        if not member:
            return Response(
                {'detail': 'Authentication required'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        try:
            column = Column.objects.get(id=id)
        except Column.DoesNotExist:
            return Response(
                {'detail': 'Column not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        if not self._has_board_access(column.board, member):
            return Response(
                {'detail': 'Access forbidden'},
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = ColumnSerializer(column, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response({'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

    @extend_schema(
        responses={204: None},
        description="Delete column and all its cards"
    )
    def delete(self, request, id):
        member = self._get_member(request)
        if not member:
            return Response(
                {'detail': 'Authentication required'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        try:
            column = Column.objects.get(id=id)
        except Column.DoesNotExist:
            return Response(
                {'detail': 'Column not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        if not self._has_board_access(column.board, member):
            return Response(
                {'detail': 'Access forbidden'},
                status=status.HTTP_403_FORBIDDEN
            )

        column.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class ColumnReorderView(APIView):
    """
    API endpoint for reordering columns
    """

    def _get_member(self, request):
        """Helper method to get authenticated member"""
        member_id = request.session.get('member_id')
        if not member_id:
            return None
        try:
            return Member.objects.get(id=member_id)
        except Member.DoesNotExist:
            return None

    def _has_board_access(self, board, member):
        """Check if member has access to board"""
        return board.owner == member or BoardMember.objects.filter(board=board, member=member).exists()

    @extend_schema(
        request=ColumnReorderSerializer,
        responses={200: dict},
        description="Change the order of columns in a board"
    )
    def post(self, request):
        member = self._get_member(request)
        if not member:
            return Response(
                {'detail': 'Authentication required'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        serializer = ColumnReorderSerializer(data=request.data)
        if serializer.is_valid():
            board_id = serializer.validated_data['board']
            column_orders = serializer.validated_data['column_orders']

            try:
                board = Board.objects.get(id=board_id)
            except Board.DoesNotExist:
                return Response(
                    {'detail': 'Board not found'},
                    status=status.HTTP_404_NOT_FOUND
                )

            if not self._has_board_access(board, member):
                return Response(
                    {'detail': 'Access forbidden'},
                    status=status.HTTP_403_FORBIDDEN
                )

            # Update column positions
            for order_item in column_orders:
                column_id = order_item['id']
                position = order_item['position']
                try:
                    column = Column.objects.get(id=column_id, board=board)
                    column.position = position
                    column.save()
                except Column.DoesNotExist:
                    return Response(
                        {'detail': f'Column with id {column_id} not found in this board'},
                        status=status.HTTP_400_BAD_REQUEST
                    )

            return Response(
                {'detail': 'Columns reordered successfully'},
                status=status.HTTP_200_OK
            )
        return Response({'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)


class CardListCreateView(APIView):
    """
    API endpoint for listing and creating cards
    """

    def _get_member(self, request):
        """Helper method to get authenticated member"""
        member_id = request.session.get('member_id')
        if not member_id:
            return None
        try:
            return Member.objects.get(id=member_id)
        except Member.DoesNotExist:
            return None

    def _has_board_access(self, board, member):
        """Check if member has access to board"""
        return board.owner == member or BoardMember.objects.filter(board=board, member=member).exists()

    @extend_schema(
        responses={200: CardSerializer(many=True)},
        description="Retrieve all cards for a specific column"
    )
    def get(self, request):
        member = self._get_member(request)
        if not member:
            return Response(
                {'detail': 'Authentication required'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        column_id = request.query_params.get('column_id')
        if not column_id:
            return Response(
                {'detail': 'column_id parameter is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            column = Column.objects.select_related('board').get(id=column_id)
        except Column.DoesNotExist:
            return Response(
                {'detail': 'Column not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        if not self._has_board_access(column.board, member):
            return Response(
                {'detail': 'Access forbidden'},
                status=status.HTTP_403_FORBIDDEN
            )

        cards = Card.objects.filter(column=column).prefetch_related('checklists', 'comments', 'card_labels__label')
        serializer = CardSerializer(cards, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @extend_schema(
        request=CardCreateSerializer,
        responses={201: CardSerializer},
        description="Create a new card in a column"
    )
    def post(self, request):
        member = self._get_member(request)
        if not member:
            return Response(
                {'detail': 'Authentication required'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        serializer = CardCreateSerializer(data=request.data)
        if serializer.is_valid():
            column = serializer.validated_data['column']
            board = column.board
            
            if not self._has_board_access(board, member):
                return Response(
                    {'detail': 'Access forbidden'},
                    status=status.HTTP_403_FORBIDDEN
                )

            card = serializer.save()
            response_serializer = CardSerializer(card)
            return Response(response_serializer.data, status=status.HTTP_201_CREATED)
        return Response({'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)


class CardDetailView(APIView):
    """
    API endpoint for retrieving, updating, and deleting a specific card
    """

    def _get_member(self, request):
        """Helper method to get authenticated member"""
        member_id = request.session.get('member_id')
        if not member_id:
            return None
        try:
            return Member.objects.get(id=member_id)
        except Member.DoesNotExist:
            return None

    def _has_board_access(self, board, member):
        """Check if member has access to board"""
        return board.owner == member or BoardMember.objects.filter(board=board, member=member).exists()

    @extend_schema(
        responses={200: CardSerializer},
        description="Retrieve detailed information about a specific card"
    )
    def get(self, request, id):
        member = self._get_member(request)
        if not member:
            return Response(
                {'detail': 'Authentication required'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        try:
            card = Card.objects.select_related('column__board').prefetch_related(
                'checklists__items', 'comments', 'card_labels__label'
            ).get(id=id)
        except Card.DoesNotExist:
            return Response(
                {'detail': 'Card not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        if not self._has_board_access(card.column.board, member):
            return Response(
                {'detail': 'Access forbidden'},
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = CardSerializer(card)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @extend_schema(
        request=CardSerializer,
        responses={200: CardSerializer},
        description="Update card information"
    )
    def patch(self, request, id):
        member = self._get_member(request)
        if not member:
            return Response(
                {'detail': 'Authentication required'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        try:
            card = Card.objects.select_related('column__board').get(id=id)
        except Card.DoesNotExist:
            return Response(
                {'detail': 'Card not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        if not self._has_board_access(card.column.board, member):
            return Response(
                {'detail': 'Access forbidden'},
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = CardSerializer(card, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            response_serializer = CardSerializer(card)
            return Response(response_serializer.data, status=status.HTTP_200_OK)
        return Response({'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

    @extend_schema(
        responses={204: None},
        description="Delete card"
    )
    def delete(self, request, id):
        member = self._get_member(request)
        if not member:
            return Response(
                {'detail': 'Authentication required'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        try:
            card = Card.objects.select_related('column__board').get(id=id)
        except Card.DoesNotExist:
            return Response(
                {'detail': 'Card not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        if not self._has_board_access(card.column.board, member):
            return Response(
                {'detail': 'Access forbidden'},
                status=status.HTTP_403_FORBIDDEN
            )

        card.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class CardMoveView(APIView):
    """
    API endpoint for moving cards (Drag & Drop)
    """

    def _get_member(self, request):
        """Helper method to get authenticated member"""
        member_id = request.session.get('member_id')
        if not member_id:
            return None
        try:
            return Member.objects.get(id=member_id)
        except Member.DoesNotExist:
            return None

    def _has_board_access(self, board, member):
        """Check if member has access to board"""
        return board.owner == member or BoardMember.objects.filter(board=board, member=member).exists()

    @extend_schema(
        request=CardMoveSerializer,
        responses={200: CardSerializer},
        description="Move card to another column or change position"
    )
    def post(self, request, id):
        member = self._get_member(request)
        if not member:
            return Response(
                {'detail': 'Authentication required'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        try:
            card = Card.objects.select_related('column__board').get(id=id)
        except Card.DoesNotExist:
            return Response(
                {'detail': 'Card not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        if not self._has_board_access(card.column.board, member):
            return Response(
                {'detail': 'Access forbidden'},
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = CardMoveSerializer(data=request.data)
        if serializer.is_valid():
            target_column_id = serializer.validated_data['column']
            new_position = serializer.validated_data['position']

            try:
                target_column = Column.objects.select_related('board').get(id=target_column_id)
            except Column.DoesNotExist:
                return Response(
                    {'detail': 'Target column not found'},
                    status=status.HTTP_404_NOT_FOUND
                )

            # Check if target column is in the same board
            if target_column.board != card.column.board:
                return Response(
                    {'detail': 'Cannot move card to a different board'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            with transaction.atomic():
                old_column = card.column
                old_position = card.position

                # If moving within the same column
                if old_column == target_column:
                    if new_position > old_position:
                        # Moving down: decrease position of cards between old and new position
                        Card.objects.filter(
                            column=old_column,
                            position__gt=old_position,
                            position__lte=new_position
                        ).update(position=Q(position=Q(position - 1)))
                    elif new_position < old_position:
                        # Moving up: increase position of cards between new and old position
                        Card.objects.filter(
                            column=old_column,
                            position__gte=new_position,
                            position__lt=old_position
                        ).update(position=Q(position=Q(position + 1)))
                else:
                    # Moving to different column
                    # Decrease position of cards after old position in old column
                    Card.objects.filter(
                        column=old_column,
                        position__gt=old_position
                    ).update(position=Q(position=Q(position - 1)))

                    # Increase position of cards at or after new position in target column
                    Card.objects.filter(
                        column=target_column,
                        position__gte=new_position
                    ).update(position=Q(position=Q(position + 1)))

                # Update card
                card.column = target_column
                card.position = new_position
                card.save()

            response_serializer = CardSerializer(card)
            return Response(response_serializer.data, status=status.HTTP_200_OK)
        return Response({'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)


class CardSearchView(APIView):
    """
    API endpoint for searching cards
    """

    def _get_member(self, request):
        """Helper method to get authenticated member"""
        member_id = request.session.get('member_id')
        if not member_id:
            return None
        try:
            return Member.objects.get(id=member_id)
        except Member.DoesNotExist:
            return None

    def _has_board_access(self, board, member):
        """Check if member has access to board"""
        return board.owner == member or BoardMember.objects.filter(board=board, member=member).exists()

    @extend_schema(
        responses={200: CardSerializer(many=True)},
        description="Search cards by title, description or labels within a board"
    )
    def get(self, request):
        member = self._get_member(request)
        if not member:
            return Response(
                {'detail': 'Authentication required'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        board_id = request.query_params.get('board_id')
        search_query = request.query_params.get('q')
        labels_filter = request.query_params.get('labels')

        if not board_id:
            return Response(
                {'detail': 'board_id parameter is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not search_query:
            return Response(
                {'detail': 'q parameter is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            board = Board.objects.get(id=board_id)
        except Board.DoesNotExist:
            return Response(
                {'detail': 'Board not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        if not self._has_board_access(board, member):
            return Response(
                {'detail': 'Access forbidden'},
                status=status.HTTP_403_FORBIDDEN
            )

        # Get all columns for this board
        columns = Column.objects.filter(board=board)
        
        # Search cards by title or description
        cards = Card.objects.filter(
            column__in=columns
        ).filter(
            Q(title__icontains=search_query) | Q(description__icontains=search_query)
        ).prefetch_related('checklists', 'comments', 'card_labels__label')

        # Filter by labels if provided
        if labels_filter:
            label_names = [name.strip() for name in labels_filter.split(',') if name.strip()]
            if label_names:
                from .models import Label, CardLabel
                labels = Label.objects.filter(board=board, name__in=label_names)
                card_ids = CardLabel.objects.filter(label__in=labels).values_list('card_id', flat=True)
                cards = cards.filter(id__in=card_ids)

        serializer = CardSerializer(cards.distinct(), many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
