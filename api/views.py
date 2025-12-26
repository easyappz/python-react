from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q
from django.contrib.sessions.models import Session
from .models import Member, Dialog, Message
from .serializers import (
    MemberSerializer,
    MemberCreateSerializer,
    LoginSerializer,
    MemberUpdateSerializer,
    DialogSerializer,
    DialogDetailSerializer,
    DialogCreateSerializer,
    MessageSerializer,
    MessageCreateSerializer,
    DialogParticipantSerializer,
    AdminMessageSerializer
)
from .authentication import CookieAuthentication


class RegisterView(APIView):
    """
    Register a new member
    """
    authentication_classes = []
    permission_classes = []

    def post(self, request):
        serializer = MemberCreateSerializer(data=request.data)
        if serializer.is_valid():
            try:
                member = serializer.save()
                response_serializer = MemberSerializer(member)
                return Response(response_serializer.data, status=status.HTTP_201_CREATED)
            except Exception as e:
                return Response(
                    {'error': 'User with this email already exists'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    """
    Login with email and password
    """
    authentication_classes = []
    permission_classes = []

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            password = serializer.validated_data['password']
            
            try:
                member = Member.objects.get(email=email)
                if member.check_password(password):
                    request.session['member_id'] = member.id
                    response_data = MemberSerializer(member).data
                    return Response(response_data, status=status.HTTP_200_OK)
                else:
                    return Response(
                        {'error': 'Invalid credentials'},
                        status=status.HTTP_401_UNAUTHORIZED
                    )
            except Member.DoesNotExist:
                return Response(
                    {'error': 'Invalid credentials'},
                    status=status.HTTP_401_UNAUTHORIZED
                )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LogoutView(APIView):
    """
    Logout current user
    """
    authentication_classes = [CookieAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        request.session.flush()
        response = Response(
            {'message': 'Successfully logged out'},
            status=status.HTTP_200_OK
        )
        response.delete_cookie('sessionid')
        return response


class MeView(APIView):
    """
    Get current authenticated user
    """
    authentication_classes = [CookieAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = MemberSerializer(request.user)
        return Response(serializer.data, status=status.HTTP_200_OK)


class MemberListView(APIView):
    """
    Get list of members with optional search
    """
    authentication_classes = [CookieAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        search = request.query_params.get('search', '')
        members = Member.objects.all()
        
        if search:
            members = members.filter(
                Q(first_name__icontains=search) | Q(last_name__icontains=search)
            )
        
        serializer = MemberSerializer(members, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class MemberDetailView(APIView):
    """
    Get member profile by ID
    """
    authentication_classes = [CookieAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request, id):
        try:
            member = Member.objects.get(id=id)
            serializer = MemberSerializer(member)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Member.DoesNotExist:
            return Response(
                {'error': 'Member not found'},
                status=status.HTTP_404_NOT_FOUND
            )


class MemberUpdateView(APIView):
    """
    Update member profile (only own profile)
    """
    authentication_classes = [CookieAuthentication]
    permission_classes = [IsAuthenticated]

    def patch(self, request, id):
        try:
            member = Member.objects.get(id=id)
            
            if member.id != request.user.id:
                return Response(
                    {'error': 'Cannot update other user\'s profile'},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            serializer = MemberUpdateSerializer(member, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                response_serializer = MemberSerializer(member)
                return Response(response_serializer.data, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Member.DoesNotExist:
            return Response(
                {'error': 'Member not found'},
                status=status.HTTP_404_NOT_FOUND
            )


class DialogListView(APIView):
    """
    Get all dialogs for current user
    """
    authentication_classes = [CookieAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        dialogs = Dialog.objects.filter(
            Q(participant1=request.user) | Q(participant2=request.user)
        ).order_by('-updated_at')
        
        serializer = DialogSerializer(dialogs, many=True, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)


class DialogCreateView(APIView):
    """
    Create a new dialog or return existing one
    """
    authentication_classes = [CookieAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = DialogCreateSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            participant_id = serializer.validated_data['participant_id']
            
            try:
                participant = Member.objects.get(id=participant_id)
            except Member.DoesNotExist:
                return Response(
                    {'error': 'Participant not found'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Check if dialog already exists
            existing_dialog = Dialog.objects.filter(
                Q(participant1=request.user, participant2=participant) |
                Q(participant1=participant, participant2=request.user)
            ).first()
            
            if existing_dialog:
                response_data = {
                    'id': existing_dialog.id,
                    'participant': DialogParticipantSerializer(participant).data,
                    'created_at': existing_dialog.created_at
                }
                return Response(response_data, status=status.HTTP_200_OK)
            
            # Create new dialog
            dialog = Dialog.objects.create(
                participant1=request.user,
                participant2=participant
            )
            
            response_data = {
                'id': dialog.id,
                'participant': DialogParticipantSerializer(participant).data,
                'created_at': dialog.created_at
            }
            return Response(response_data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class DialogDetailView(APIView):
    """
    Get dialog with messages
    """
    authentication_classes = [CookieAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request, id):
        try:
            dialog = Dialog.objects.get(id=id)
            
            if not dialog.is_participant(request.user):
                return Response(
                    {'error': 'Access denied - not a participant of this dialog'},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            serializer = DialogDetailSerializer(dialog, context={'request': request})
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Dialog.DoesNotExist:
            return Response(
                {'error': 'Dialog not found'},
                status=status.HTTP_404_NOT_FOUND
            )


class MessageCreateView(APIView):
    """
    Send a message in a dialog
    """
    authentication_classes = [CookieAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request, id):
        try:
            dialog = Dialog.objects.get(id=id)
            
            if not dialog.is_participant(request.user):
                return Response(
                    {'error': 'Access denied - not a participant of this dialog'},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            serializer = MessageCreateSerializer(data=request.data)
            if serializer.is_valid():
                message = Message.objects.create(
                    dialog=dialog,
                    sender=request.user,
                    text=serializer.validated_data['text']
                )
                
                # Update dialog's updated_at
                dialog.save()
                
                response_data = {
                    'id': message.id,
                    'dialog_id': dialog.id,
                    'sender': {
                        'id': request.user.id,
                        'first_name': request.user.first_name,
                        'last_name': request.user.last_name
                    },
                    'text': message.text,
                    'created_at': message.created_at
                }
                return Response(response_data, status=status.HTTP_201_CREATED)
            
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Dialog.DoesNotExist:
            return Response(
                {'error': 'Dialog not found'},
                status=status.HTTP_404_NOT_FOUND
            )


class AdminMembersView(APIView):
    """
    Admin endpoint for managing members
    """
    authentication_classes = [CookieAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not request.user.is_admin:
            return Response(
                {'error': 'Access denied - admin only'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        members = Member.objects.all()
        serializer = MemberSerializer(members, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def delete(self, request):
        if not request.user.is_admin:
            return Response(
                {'error': 'Access denied - admin only'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        member_id = request.query_params.get('id')
        if not member_id:
            return Response(
                {'error': 'Member ID is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            member = Member.objects.get(id=member_id)
            member.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Member.DoesNotExist:
            return Response(
                {'error': 'Member not found'},
                status=status.HTTP_404_NOT_FOUND
            )


class AdminMessagesView(APIView):
    """
    Admin endpoint for managing messages
    """
    authentication_classes = [CookieAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not request.user.is_admin:
            return Response(
                {'error': 'Access denied - admin only'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        messages = Message.objects.all().order_by('-created_at')
        serializer = AdminMessageSerializer(messages, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def delete(self, request):
        if not request.user.is_admin:
            return Response(
                {'error': 'Access denied - admin only'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        message_id = request.query_params.get('id')
        if not message_id:
            return Response(
                {'error': 'Message ID is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            message = Message.objects.get(id=message_id)
            message.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Message.DoesNotExist:
            return Response(
                {'error': 'Message not found'},
                status=status.HTTP_404_NOT_FOUND
            )
