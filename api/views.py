from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from drf_spectacular.utils import extend_schema
from .serializers import MessageSerializer, RegisterSerializer, LoginSerializer, MemberSerializer
from .models import Member


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
