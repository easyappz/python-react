from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.parsers import MultiPartParser, FormParser
from django.utils import timezone
from django.db.models import Q, F
from django.db import transaction
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from drf_spectacular.utils import extend_schema
from .serializers import (
    MessageSerializer, RegisterSerializer, LoginSerializer, MemberSerializer,
    BoardSerializer, BoardCreateSerializer, BoardInviteSerializer,
    ColumnSerializer, ColumnCreateSerializer, ColumnReorderSerializer,
    CardSerializer, CardCreateSerializer, CardMoveSerializer,
    ChecklistSerializer, ChecklistCreateSerializer, ChecklistItemSerializer,
    CommentSerializer, CommentCreateSerializer,
    LabelSerializer, LabelCreateSerializer,
    AttachmentSerializer,
    ProfileUpdateSerializer
)
from .models import Member, Board, BoardMember, Column, Card, Checklist, ChecklistItem, Comment, Label, Attachment
import os


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


@method_decorator(csrf_exempt, name='dispatch')
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


@method_decorator(csrf_exempt, name='dispatch')
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


class UserProfileView(APIView):
    """
    API endpoint for user profile management
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

    @extend_schema(
        responses={200: MemberSerializer},
        description="Retrieve current user profile information"
    )
    def get(self, request):
        member = self._get_member(request)
        if not member:
            return Response(
                {'detail': 'Authentication required'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        serializer = MemberSerializer(member)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @extend_schema(
        request=ProfileUpdateSerializer,
        responses={200: MemberSerializer},
        description="Update current user profile (username and/or avatar)"
    )
    def patch(self, request):
        member = self._get_member(request)
        if not member:
            return Response(
                {'detail': 'Authentication required'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        serializer = ProfileUpdateSerializer(member, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            response_serializer = MemberSerializer(member)
            return Response(response_serializer.data, status=status.HTTP_200_OK)
        return Response({'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)


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
                        ).update(position=F('position') - 1)
                    elif new_position < old_position:
                        # Moving up: increase position of cards between new and old position
                        Card.objects.filter(
                            column=old_column,
                            position__gte=new_position,
                            position__lt=old_position
                        ).update(position=F('position') + 1)
                else:
                    # Moving to different column
                    # Decrease position of cards after old position in old column
                    Card.objects.filter(
                        column=old_column,
                        position__gt=old_position
                    ).update(position=F('position') - 1)

                    # Increase position of cards at or after new position in target column
                    Card.objects.filter(
                        column=target_column,
                        position__gte=new_position
                    ).update(position=F('position') + 1)

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


class ChecklistListCreateView(APIView):
    """
    API endpoint for listing and creating checklists
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
        responses={200: ChecklistSerializer(many=True)},
        description="Retrieve all checklists for a specific card"
    )
    def get(self, request):
        member = self._get_member(request)
        if not member:
            return Response(
                {'detail': 'Authentication required'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        card_id = request.query_params.get('card')
        if not card_id:
            return Response(
                {'detail': 'card parameter is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            card = Card.objects.select_related('column__board').get(id=card_id)
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

        checklists = Checklist.objects.filter(card=card).prefetch_related('items')
        serializer = ChecklistSerializer(checklists, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @extend_schema(
        request=ChecklistCreateSerializer,
        responses={201: ChecklistSerializer},
        description="Create a new checklist for a card"
    )
    def post(self, request):
        member = self._get_member(request)
        if not member:
            return Response(
                {'detail': 'Authentication required'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        serializer = ChecklistCreateSerializer(data=request.data)
        if serializer.is_valid():
            card = serializer.validated_data['card']
            board = card.column.board
            
            if not self._has_board_access(board, member):
                return Response(
                    {'detail': 'Access forbidden'},
                    status=status.HTTP_403_FORBIDDEN
                )

            checklist = serializer.save()
            response_serializer = ChecklistSerializer(checklist)
            return Response(response_serializer.data, status=status.HTTP_201_CREATED)
        return Response({'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)


class ChecklistDetailView(APIView):
    """
    API endpoint for retrieving, updating, and deleting a specific checklist
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
        responses={200: ChecklistSerializer},
        description="Retrieve a specific checklist"
    )
    def get(self, request, id):
        member = self._get_member(request)
        if not member:
            return Response(
                {'detail': 'Authentication required'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        try:
            checklist = Checklist.objects.select_related('card__column__board').prefetch_related('items').get(id=id)
        except Checklist.DoesNotExist:
            return Response(
                {'detail': 'Checklist not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        if not self._has_board_access(checklist.card.column.board, member):
            return Response(
                {'detail': 'Access forbidden'},
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = ChecklistSerializer(checklist)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @extend_schema(
        request=ChecklistSerializer,
        responses={200: ChecklistSerializer},
        description="Update a specific checklist"
    )
    def patch(self, request, id):
        member = self._get_member(request)
        if not member:
            return Response(
                {'detail': 'Authentication required'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        try:
            checklist = Checklist.objects.select_related('card__column__board').get(id=id)
        except Checklist.DoesNotExist:
            return Response(
                {'detail': 'Checklist not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        if not self._has_board_access(checklist.card.column.board, member):
            return Response(
                {'detail': 'Access forbidden'},
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = ChecklistSerializer(checklist, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response({'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

    @extend_schema(
        responses={204: None},
        description="Delete a specific checklist"
    )
    def delete(self, request, id):
        member = self._get_member(request)
        if not member:
            return Response(
                {'detail': 'Authentication required'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        try:
            checklist = Checklist.objects.select_related('card__column__board').get(id=id)
        except Checklist.DoesNotExist:
            return Response(
                {'detail': 'Checklist not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        if not self._has_board_access(checklist.card.column.board, member):
            return Response(
                {'detail': 'Access forbidden'},
                status=status.HTTP_403_FORBIDDEN
            )

        checklist.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class ChecklistItemListCreateView(APIView):
    """
    API endpoint for listing, creating, updating, and deleting checklist items
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
        responses={200: ChecklistItemSerializer(many=True)},
        description="Retrieve all items for a specific checklist"
    )
    def get(self, request):
        member = self._get_member(request)
        if not member:
            return Response(
                {'detail': 'Authentication required'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        checklist_id = request.query_params.get('checklist')
        if not checklist_id:
            return Response(
                {'detail': 'checklist parameter is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            checklist = Checklist.objects.select_related('card__column__board').get(id=checklist_id)
        except Checklist.DoesNotExist:
            return Response(
                {'detail': 'Checklist not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        if not self._has_board_access(checklist.card.column.board, member):
            return Response(
                {'detail': 'Access forbidden'},
                status=status.HTTP_403_FORBIDDEN
            )

        items = ChecklistItem.objects.filter(checklist=checklist)
        serializer = ChecklistItemSerializer(items, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @extend_schema(
        request=ChecklistItemSerializer,
        responses={201: ChecklistItemSerializer},
        description="Create a new item in a checklist"
    )
    def post(self, request):
        member = self._get_member(request)
        if not member:
            return Response(
                {'detail': 'Authentication required'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        serializer = ChecklistItemSerializer(data=request.data)
        if serializer.is_valid():
            checklist = serializer.validated_data['checklist']
            board = checklist.card.column.board
            
            if not self._has_board_access(board, member):
                return Response(
                    {'detail': 'Access forbidden'},
                    status=status.HTTP_403_FORBIDDEN
                )

            item = serializer.save()
            return Response(ChecklistItemSerializer(item).data, status=status.HTTP_201_CREATED)
        return Response({'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

    @extend_schema(
        request=ChecklistItemSerializer,
        responses={200: ChecklistItemSerializer},
        description="Update a specific checklist item"
    )
    def patch(self, request):
        member = self._get_member(request)
        if not member:
            return Response(
                {'detail': 'Authentication required'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        item_id = request.query_params.get('id')
        if not item_id:
            return Response(
                {'detail': 'id parameter is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            item = ChecklistItem.objects.select_related('checklist__card__column__board').get(id=item_id)
        except ChecklistItem.DoesNotExist:
            return Response(
                {'detail': 'Checklist item not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        if not self._has_board_access(item.checklist.card.column.board, member):
            return Response(
                {'detail': 'Access forbidden'},
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = ChecklistItemSerializer(item, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response({'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

    @extend_schema(
        responses={204: None},
        description="Delete a specific checklist item"
    )
    def delete(self, request):
        member = self._get_member(request)
        if not member:
            return Response(
                {'detail': 'Authentication required'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        item_id = request.query_params.get('id')
        if not item_id:
            return Response(
                {'detail': 'id parameter is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            item = ChecklistItem.objects.select_related('checklist__card__column__board').get(id=item_id)
        except ChecklistItem.DoesNotExist:
            return Response(
                {'detail': 'Checklist item not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        if not self._has_board_access(item.checklist.card.column.board, member):
            return Response(
                {'detail': 'Access forbidden'},
                status=status.HTTP_403_FORBIDDEN
            )

        item.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class CommentListCreateView(APIView):
    """
    API endpoint for listing and creating comments
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
        responses={200: CommentSerializer(many=True)},
        description="Retrieve all comments for a specific card"
    )
    def get(self, request):
        member = self._get_member(request)
        if not member:
            return Response(
                {'detail': 'Authentication required'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        card_id = request.query_params.get('card')
        if not card_id:
            return Response(
                {'detail': 'card parameter is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            card = Card.objects.select_related('column__board').get(id=card_id)
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

        comments = Comment.objects.filter(card=card).select_related('author')
        serializer = CommentSerializer(comments, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @extend_schema(
        request=CommentCreateSerializer,
        responses={201: CommentSerializer},
        description="Create a new comment on a card"
    )
    def post(self, request):
        member = self._get_member(request)
        if not member:
            return Response(
                {'detail': 'Authentication required'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        serializer = CommentCreateSerializer(data=request.data)
        if serializer.is_valid():
            card = serializer.validated_data['card']
            board = card.column.board
            
            if not self._has_board_access(board, member):
                return Response(
                    {'detail': 'Access forbidden'},
                    status=status.HTTP_403_FORBIDDEN
                )

            comment = serializer.save(author=member)
            response_serializer = CommentSerializer(comment)
            return Response(response_serializer.data, status=status.HTTP_201_CREATED)
        return Response({'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)


class CommentDetailView(APIView):
    """
    API endpoint for retrieving, updating, and deleting a specific comment
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
        responses={200: CommentSerializer},
        description="Retrieve a specific comment"
    )
    def get(self, request, id):
        member = self._get_member(request)
        if not member:
            return Response(
                {'detail': 'Authentication required'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        try:
            comment = Comment.objects.select_related('card__column__board', 'author').get(id=id)
        except Comment.DoesNotExist:
            return Response(
                {'detail': 'Comment not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        if not self._has_board_access(comment.card.column.board, member):
            return Response(
                {'detail': 'Access forbidden'},
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = CommentSerializer(comment)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @extend_schema(
        request=CommentSerializer,
        responses={200: CommentSerializer},
        description="Update a specific comment"
    )
    def patch(self, request, id):
        member = self._get_member(request)
        if not member:
            return Response(
                {'detail': 'Authentication required'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        try:
            comment = Comment.objects.select_related('card__column__board').get(id=id)
        except Comment.DoesNotExist:
            return Response(
                {'detail': 'Comment not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        if not self._has_board_access(comment.card.column.board, member):
            return Response(
                {'detail': 'Access forbidden'},
                status=status.HTTP_403_FORBIDDEN
            )

        # Only comment author can update
        if comment.author != member:
            return Response(
                {'detail': 'Only comment author can update it'},
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = CommentSerializer(comment, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response({'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

    @extend_schema(
        responses={204: None},
        description="Delete a specific comment"
    )
    def delete(self, request, id):
        member = self._get_member(request)
        if not member:
            return Response(
                {'detail': 'Authentication required'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        try:
            comment = Comment.objects.select_related('card__column__board').get(id=id)
        except Comment.DoesNotExist:
            return Response(
                {'detail': 'Comment not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        if not self._has_board_access(comment.card.column.board, member):
            return Response(
                {'detail': 'Access forbidden'},
                status=status.HTTP_403_FORBIDDEN
            )

        # Only comment author can delete
        if comment.author != member:
            return Response(
                {'detail': 'Only comment author can delete it'},
                status=status.HTTP_403_FORBIDDEN
            )

        comment.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class LabelListCreateView(APIView):
    """
    API endpoint for listing and creating labels
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
        responses={200: LabelSerializer(many=True)},
        description="Retrieve all labels for a specific board"
    )
    def get(self, request):
        member = self._get_member(request)
        if not member:
            return Response(
                {'detail': 'Authentication required'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        board_id = request.query_params.get('board')
        if not board_id:
            return Response(
                {'detail': 'board parameter is required'},
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

        labels = Label.objects.filter(board=board)
        serializer = LabelSerializer(labels, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @extend_schema(
        request=LabelCreateSerializer,
        responses={201: LabelSerializer},
        description="Create a new label for a board"
    )
    def post(self, request):
        member = self._get_member(request)
        if not member:
            return Response(
                {'detail': 'Authentication required'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        serializer = LabelCreateSerializer(data=request.data)
        if serializer.is_valid():
            board = serializer.validated_data['board']
            
            if not self._has_board_access(board, member):
                return Response(
                    {'detail': 'Access forbidden'},
                    status=status.HTTP_403_FORBIDDEN
                )

            label = serializer.save()
            response_serializer = LabelSerializer(label)
            return Response(response_serializer.data, status=status.HTTP_201_CREATED)
        return Response({'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)


class LabelDetailView(APIView):
    """
    API endpoint for retrieving, updating, and deleting a specific label
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
        responses={200: LabelSerializer},
        description="Retrieve a specific label"
    )
    def get(self, request, id):
        member = self._get_member(request)
        if not member:
            return Response(
                {'detail': 'Authentication required'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        try:
            label = Label.objects.select_related('board').get(id=id)
        except Label.DoesNotExist:
            return Response(
                {'detail': 'Label not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        if not self._has_board_access(label.board, member):
            return Response(
                {'detail': 'Access forbidden'},
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = LabelSerializer(label)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @extend_schema(
        request=LabelSerializer,
        responses={200: LabelSerializer},
        description="Update a specific label"
    )
    def patch(self, request, id):
        member = self._get_member(request)
        if not member:
            return Response(
                {'detail': 'Authentication required'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        try:
            label = Label.objects.select_related('board').get(id=id)
        except Label.DoesNotExist:
            return Response(
                {'detail': 'Label not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        if not self._has_board_access(label.board, member):
            return Response(
                {'detail': 'Access forbidden'},
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = LabelSerializer(label, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response({'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

    @extend_schema(
        responses={204: None},
        description="Delete a specific label"
    )
    def delete(self, request, id):
        member = self._get_member(request)
        if not member:
            return Response(
                {'detail': 'Authentication required'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        try:
            label = Label.objects.select_related('board').get(id=id)
        except Label.DoesNotExist:
            return Response(
                {'detail': 'Label not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        if not self._has_board_access(label.board, member):
            return Response(
                {'detail': 'Access forbidden'},
                status=status.HTTP_403_FORBIDDEN
            )

        label.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class AttachmentListCreateView(APIView):
    """
    API endpoint for listing and uploading attachments
    """
    parser_classes = [MultiPartParser, FormParser]

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
        responses={200: AttachmentSerializer(many=True)},
        description="Retrieve all attachments for a specific card"
    )
    def get(self, request):
        member = self._get_member(request)
        if not member:
            return Response(
                {'detail': 'Authentication required'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        card_id = request.query_params.get('card')
        if not card_id:
            return Response(
                {'detail': 'card parameter is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            card = Card.objects.select_related('column__board').get(id=card_id)
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

        attachments = Attachment.objects.filter(card=card)
        serializer = AttachmentSerializer(attachments, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @extend_schema(
        request=AttachmentSerializer,
        responses={201: AttachmentSerializer},
        description="Upload a new file attachment to a card"
    )
    def post(self, request):
        member = self._get_member(request)
        if not member:
            return Response(
                {'detail': 'Authentication required'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        card_id = request.data.get('card')
        uploaded_file = request.FILES.get('file')
        filename = request.data.get('filename', uploaded_file.name if uploaded_file else '')

        if not card_id:
            return Response(
                {'detail': 'card field is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not uploaded_file:
            return Response(
                {'detail': 'file field is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            card = Card.objects.select_related('column__board').get(id=card_id)
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

        # Create attachment
        attachment = Attachment.objects.create(
            card=card,
            file=uploaded_file,
            filename=filename
        )

        serializer = AttachmentSerializer(attachment)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class AttachmentDetailView(APIView):
    """
    API endpoint for retrieving and deleting a specific attachment
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
        responses={200: AttachmentSerializer},
        description="Retrieve a specific attachment"
    )
    def get(self, request, id):
        member = self._get_member(request)
        if not member:
            return Response(
                {'detail': 'Authentication required'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        try:
            attachment = Attachment.objects.select_related('card__column__board').get(id=id)
        except Attachment.DoesNotExist:
            return Response(
                {'detail': 'Attachment not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        if not self._has_board_access(attachment.card.column.board, member):
            return Response(
                {'detail': 'Access forbidden'},
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = AttachmentSerializer(attachment)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @extend_schema(
        responses={204: None},
        description="Delete a specific attachment"
    )
    def delete(self, request, id):
        member = self._get_member(request)
        if not member:
            return Response(
                {'detail': 'Authentication required'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        try:
            attachment = Attachment.objects.select_related('card__column__board').get(id=id)
        except Attachment.DoesNotExist:
            return Response(
                {'detail': 'Attachment not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        if not self._has_board_access(attachment.card.column.board, member):
            return Response(
                {'detail': 'Access forbidden'},
                status=status.HTTP_403_FORBIDDEN
            )

        # Delete file from filesystem
        if attachment.file:
            if os.path.isfile(attachment.file.path):
                os.remove(attachment.file.path)

        attachment.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
