from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.pagination import PageNumberPagination
from django.utils import timezone
from django.db.models import Q
from django.http import HttpResponse
from drf_spectacular.utils import extend_schema
import csv
import io
from .serializers import (
    MessageSerializer,
    MemberSerializer,
    MemberRegistrationSerializer,
    MemberLoginSerializer,
    TransactionSerializer,
    CategorySerializer,
    UserSettingsSerializer
)
from .models import Member, Transaction, Category, UserSettings
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


class TransactionPagination(PageNumberPagination):
    """
    Pagination for transactions
    """
    page_size = 50
    page_size_query_param = 'page_size'
    max_page_size = 1000


class TransactionViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing transactions
    """
    serializer_class = TransactionSerializer
    authentication_classes = [SessionAuthentication]
    permission_classes = [IsAuthenticated]
    pagination_class = TransactionPagination

    def get_queryset(self):
        """
        Get transactions for current user with filtering
        """
        queryset = Transaction.objects.filter(member=self.request.user)
        
        # Filter by type
        transaction_type = self.request.query_params.get('type', None)
        if transaction_type:
            queryset = queryset.filter(type=transaction_type)
        
        # Filter by category
        category_id = self.request.query_params.get('category_id', None)
        if category_id:
            queryset = queryset.filter(category_id=category_id)
        
        # Filter by date range
        date_from = self.request.query_params.get('date_from', None)
        if date_from:
            queryset = queryset.filter(date__gte=date_from)
        
        date_to = self.request.query_params.get('date_to', None)
        if date_to:
            queryset = queryset.filter(date__lte=date_to)
        
        # Filter by counterparty
        counterparty = self.request.query_params.get('counterparty', None)
        if counterparty:
            queryset = queryset.filter(counterparty__icontains=counterparty)
        
        # Filter by project
        project = self.request.query_params.get('project', None)
        if project:
            queryset = queryset.filter(project__icontains=project)
        
        # Filter by account
        account = self.request.query_params.get('account', None)
        if account:
            queryset = queryset.filter(account__icontains=account)
        
        # Search in description, counterparty, project
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(description__icontains=search) |
                Q(counterparty__icontains=search) |
                Q(project__icontains=search)
            )
        
        return queryset.select_related('category')

    def perform_create(self, serializer):
        """
        Set member to current user on create
        """
        serializer.save(member=self.request.user)

    def perform_update(self, serializer):
        """
        Ensure member stays the same on update
        """
        serializer.save(member=self.request.user)

    @action(detail=False, methods=['get'], url_path='export')
    def export(self, request):
        """
        Export transactions to CSV or Excel format
        """
        export_format = request.query_params.get('format', None)
        
        if not export_format:
            return Response(
                {'error': 'Format parameter is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if export_format not in ['csv', 'excel']:
            return Response(
                {'error': 'Invalid format. Allowed: csv, excel'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get filtered queryset
        queryset = self.get_queryset()
        
        if export_format == 'csv':
            return self._export_csv(queryset)
        else:
            return self._export_excel(queryset)

    def _export_csv(self, queryset):
        """
        Export transactions to CSV
        """
        output = io.StringIO()
        writer = csv.writer(output)
        
        # Write header
        writer.writerow([
            'ID', 'Type', 'Amount', 'Date', 'Category', 'Description',
            'Counterparty', 'Project', 'Account', 'Document', 'Created At'
        ])
        
        # Write data
        for transaction in queryset:
            writer.writerow([
                transaction.id,
                transaction.type,
                str(transaction.amount),
                transaction.date.strftime('%Y-%m-%d'),
                transaction.category.name,
                transaction.description or '',
                transaction.counterparty or '',
                transaction.project or '',
                transaction.account or '',
                transaction.document or '',
                transaction.created_at.strftime('%Y-%m-%d %H:%M:%S')
            ])
        
        response = HttpResponse(output.getvalue(), content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="transactions.csv"'
        return response

    def _export_excel(self, queryset):
        """
        Export transactions to Excel format
        """
        try:
            import openpyxl
            from openpyxl.styles import Font
        except ImportError:
            return Response(
                {'error': 'Excel export is not available'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        workbook = openpyxl.Workbook()
        worksheet = workbook.active
        worksheet.title = 'Transactions'
        
        # Write header
        headers = [
            'ID', 'Type', 'Amount', 'Date', 'Category', 'Description',
            'Counterparty', 'Project', 'Account', 'Document', 'Created At'
        ]
        worksheet.append(headers)
        
        # Make header bold
        for cell in worksheet[1]:
            cell.font = Font(bold=True)
        
        # Write data
        for transaction in queryset:
            worksheet.append([
                transaction.id,
                transaction.type,
                float(transaction.amount),
                transaction.date.strftime('%Y-%m-%d'),
                transaction.category.name,
                transaction.description or '',
                transaction.counterparty or '',
                transaction.project or '',
                transaction.account or '',
                transaction.document or '',
                transaction.created_at.strftime('%Y-%m-%d %H:%M:%S')
            ])
        
        # Save to bytes
        output = io.BytesIO()
        workbook.save(output)
        output.seek(0)
        
        response = HttpResponse(
            output.getvalue(),
            content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        )
        response['Content-Disposition'] = 'attachment; filename="transactions.xlsx"'
        return response


class CategoryViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing categories
    """
    serializer_class = CategorySerializer
    authentication_classes = [SessionAuthentication]
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """
        Get categories for current user with filtering
        """
        queryset = Category.objects.filter(member=self.request.user)
        
        # Filter by type
        category_type = self.request.query_params.get('type', None)
        if category_type:
            queryset = queryset.filter(type=category_type)
        
        return queryset

    def perform_create(self, serializer):
        """
        Set member to current user on create
        """
        serializer.save(member=self.request.user)

    def perform_update(self, serializer):
        """
        Ensure member stays the same on update
        """
        serializer.save(member=self.request.user)

    def destroy(self, request, *args, **kwargs):
        """
        Prevent deletion of default categories
        """
        category = self.get_object()
        
        if category.is_default:
            return Response(
                {'error': 'Cannot delete default category'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        return super().destroy(request, *args, **kwargs)


class UserSettingsViewSet(viewsets.ViewSet):
    """
    ViewSet for managing user settings
    """
    authentication_classes = [SessionAuthentication]
    permission_classes = [IsAuthenticated]

    def retrieve(self, request):
        """
        Get current user settings
        """
        try:
            settings = UserSettings.objects.get(member=request.user)
        except UserSettings.DoesNotExist:
            # Create default settings if they don't exist
            settings = UserSettings.objects.create(member=request.user)
        
        serializer = UserSettingsSerializer(settings)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def update(self, request):
        """
        Update current user settings
        """
        try:
            settings = UserSettings.objects.get(member=request.user)
        except UserSettings.DoesNotExist:
            # Create default settings if they don't exist
            settings = UserSettings.objects.create(member=request.user)
        
        serializer = UserSettingsSerializer(settings, data=request.data, partial=True)
        
        if not serializer.is_valid():
            return Response(
                {'error': str(serializer.errors)},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)
