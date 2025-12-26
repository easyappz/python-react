from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.utils import timezone
from drf_spectacular.utils import extend_schema
from .serializers import (
    MessageSerializer,
    MemberRegistrationSerializer,
    MemberLoginSerializer,
    MemberSerializer,
    ProfileUpdateSerializer
)
from .models import Member
from .authentication import CookieAuthentication


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
    permission_classes = [AllowAny]
    authentication_classes = []

    @extend_schema(
        request=MemberRegistrationSerializer,
        responses={201: MemberSerializer, 400: dict},
        description="Register a new user"
    )
    def post(self, request):
        serializer = MemberRegistrationSerializer(data=request.data)
        
        if serializer.is_valid():
            member = serializer.save()
            response_serializer = MemberSerializer(member)
            return Response(response_serializer.data, status=status.HTTP_201_CREATED)
        
        return Response(
            {"error": "Validation error", "detail": serializer.errors},
            status=status.HTTP_400_BAD_REQUEST
        )


class LoginView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    @extend_schema(
        request=MemberLoginSerializer,
        responses={200: MemberSerializer, 400: dict, 401: dict},
        description="Login user with email and password"
    )
    def post(self, request):
        serializer = MemberLoginSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response(
                {"error": "Validation error", "detail": serializer.errors},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        email = serializer.validated_data['email'].lower()
        password = serializer.validated_data['password']
        
        try:
            member = Member.objects.get(email=email)
        except Member.DoesNotExist:
            return Response(
                {"error": "Invalid credentials"},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        if not member.check_password(password):
            return Response(
                {"error": "Invalid credentials"},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        request.session['member_id'] = member.id
        request.session.save()
        
        response_serializer = MemberSerializer(member)
        return Response(response_serializer.data, status=status.HTTP_200_OK)


class LogoutView(APIView):
    authentication_classes = [CookieAuthentication]
    permission_classes = [IsAuthenticated]

    @extend_schema(
        responses={200: dict, 401: dict},
        description="Logout current user"
    )
    def post(self, request):
        request.session.flush()
        return Response(
            {"message": "Successfully logged out"},
            status=status.HTTP_200_OK
        )


class MeView(APIView):
    authentication_classes = [CookieAuthentication]
    permission_classes = [IsAuthenticated]

    @extend_schema(
        responses={200: MemberSerializer, 401: dict},
        description="Get current authenticated user data"
    )
    def get(self, request):
        serializer = MemberSerializer(request.user)
        return Response(serializer.data, status=status.HTTP_200_OK)


class ProfileUpdateView(APIView):
    authentication_classes = [CookieAuthentication]
    permission_classes = [IsAuthenticated]

    @extend_schema(
        request=ProfileUpdateSerializer,
        responses={200: MemberSerializer, 400: dict, 401: dict},
        description="Update user profile"
    )
    def put(self, request):
        serializer = ProfileUpdateSerializer(request.user, data=request.data, partial=True)
        
        if serializer.is_valid():
            serializer.save()
            response_serializer = MemberSerializer(request.user)
            return Response(response_serializer.data, status=status.HTTP_200_OK)
        
        return Response(
            {"error": "Validation error", "detail": serializer.errors},
            status=status.HTTP_400_BAD_REQUEST
        )
