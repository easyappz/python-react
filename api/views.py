from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from drf_spectacular.utils import extend_schema
from .serializers import (
    MessageSerializer,
    MemberSerializer,
    MemberRegistrationSerializer,
    MemberLoginSerializer
)
from .models import Member
from .authentication import SessionAuthentication
from .permissions import IsAuthenticated


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
    Register new member and automatically login
    """
    authentication_classes = []
    permission_classes = []

    @extend_schema(
        request=MemberRegistrationSerializer,
        responses={
            201: MemberSerializer,
            400: {'type': 'object', 'properties': {'error': {'type': 'string'}}},
            409: {'type': 'object', 'properties': {'error': {'type': 'string'}}}
        },
        description="Register new member and automatically login"
    )
    def post(self, request):
        serializer = MemberRegistrationSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response({'error': str(serializer.errors)}, status=status.HTTP_400_BAD_REQUEST)
        
        # Check if email already exists
        if Member.objects.filter(email=serializer.validated_data['email']).exists():
            return Response(
                {'error': 'Member with this email already exists'},
                status=status.HTTP_409_CONFLICT
            )
        
        member = serializer.save()
        
        # Automatically login after registration
        request.session['member_id'] = member.id
        
        response_serializer = MemberSerializer(member)
        response = Response(response_serializer.data, status=status.HTTP_201_CREATED)
        
        # Set HttpOnly cookie
        response.set_cookie(
            key='sessionid',
            value=request.session.session_key,
            httponly=True,
            samesite='Lax',
            path='/'
        )
        
        return response


class LoginView(APIView):
    """
    Login member and set session cookie
    """
    authentication_classes = []
    permission_classes = []

    @extend_schema(
        request=MemberLoginSerializer,
        responses={
            200: MemberSerializer,
            400: {'type': 'object', 'properties': {'error': {'type': 'string'}}},
            401: {'type': 'object', 'properties': {'error': {'type': 'string'}}}
        },
        description="Authenticate member and set session cookie"
    )
    def post(self, request):
        serializer = MemberLoginSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response({'error': str(serializer.errors)}, status=status.HTTP_400_BAD_REQUEST)
        
        email = serializer.validated_data['email']
        password = serializer.validated_data['password']
        
        try:
            member = Member.objects.get(email=email)
        except Member.DoesNotExist:
            return Response(
                {'error': 'Invalid credentials'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        if not member.check_password(password):
            return Response(
                {'error': 'Invalid credentials'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        # Create session
        request.session['member_id'] = member.id
        
        response_serializer = MemberSerializer(member)
        response = Response(response_serializer.data, status=status.HTTP_200_OK)
        
        # Set HttpOnly cookie
        response.set_cookie(
            key='sessionid',
            value=request.session.session_key,
            httponly=True,
            samesite='Lax',
            path='/'
        )
        
        return response


class LogoutView(APIView):
    """
    Logout current member and clear session cookie
    """
    authentication_classes = [SessionAuthentication]
    permission_classes = [IsAuthenticated]

    @extend_schema(
        responses={
            200: {'type': 'object', 'properties': {'message': {'type': 'string'}}},
            401: {'type': 'object', 'properties': {'error': {'type': 'string'}}}
        },
        description="Logout current member and clear session cookie"
    )
    def post(self, request):
        # Clear session
        request.session.flush()
        
        response = Response({'message': 'Successfully logged out'}, status=status.HTTP_200_OK)
        
        # Clear cookie
        response.delete_cookie('sessionid', path='/')
        
        return response


class MeView(APIView):
    """
    Get information about currently authenticated member
    """
    authentication_classes = [SessionAuthentication]
    permission_classes = [IsAuthenticated]

    @extend_schema(
        responses={
            200: MemberSerializer,
            401: {'type': 'object', 'properties': {'error': {'type': 'string'}}}
        },
        description="Get information about currently authenticated member"
    )
    def get(self, request):
        serializer = MemberSerializer(request.user)
        return Response(serializer.data, status=status.HTTP_200_OK)
