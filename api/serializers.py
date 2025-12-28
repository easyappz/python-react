from rest_framework import serializers
from .models import Member, UserSettings, Category, Transaction


class MemberSerializer(serializers.ModelSerializer):
    """Serializer for Member model"""
    class Meta:
        model = Member
        fields = ['id', 'email', 'name', 'business_name', 'created_at']
        read_only_fields = ['id', 'created_at']


class MemberRegistrationSerializer(serializers.ModelSerializer):
    """Serializer for member registration"""
    password = serializers.CharField(write_only=True, min_length=8, style={'input_type': 'password'})

    class Meta:
        model = Member
        fields = ['email', 'password', 'name', 'business_name']

    def create(self, validated_data):
        password = validated_data.pop('password')
        member = Member(**validated_data)
        member.set_password(password)
        member.save()
        
        # Create default settings for the member
        UserSettings.objects.create(member=member)
        
        # Create default categories for the member
        self._create_default_categories(member)
        
        return member
    
    def _create_default_categories(self, member):
        """Create default income and expense categories for new member"""
        # Default income categories
        income_categories = [
            {'name': 'Sales', 'type': 'income', 'color': '#10B981', 'icon': 'shopping-cart', 'is_default': True},
            {'name': 'Services', 'type': 'income', 'color': '#3B82F6', 'icon': 'briefcase', 'is_default': True},
            {'name': 'Consulting', 'type': 'income', 'color': '#8B5CF6', 'icon': 'users', 'is_default': True},
            {'name': 'Other Income', 'type': 'income', 'color': '#6B7280', 'icon': 'plus-circle', 'is_default': True},
        ]
        
        # Default expense categories
        expense_categories = [
            {'name': 'Salary', 'type': 'expense', 'color': '#EF4444', 'icon': 'user', 'is_default': True},
            {'name': 'Rent', 'type': 'expense', 'color': '#F59E0B', 'icon': 'home', 'is_default': True},
            {'name': 'Taxes', 'type': 'expense', 'color': '#DC2626', 'icon': 'file-text', 'is_default': True},
            {'name': 'Marketing', 'type': 'expense', 'color': '#EC4899', 'icon': 'trending-up', 'is_default': True},
            {'name': 'Purchases', 'type': 'expense', 'color': '#8B5CF6', 'icon': 'shopping-bag', 'is_default': True},
            {'name': 'Office Supplies', 'type': 'expense', 'color': '#06B6D4', 'icon': 'package', 'is_default': True},
            {'name': 'Utilities', 'type': 'expense', 'color': '#14B8A6', 'icon': 'zap', 'is_default': True},
            {'name': 'Insurance', 'type': 'expense', 'color': '#F97316', 'icon': 'shield', 'is_default': True},
            {'name': 'Transportation', 'type': 'expense', 'color': '#84CC16', 'icon': 'truck', 'is_default': True},
            {'name': 'Professional Services', 'type': 'expense', 'color': '#6366F1', 'icon': 'award', 'is_default': True},
            {'name': 'Software & Subscriptions', 'type': 'expense', 'color': '#0EA5E9', 'icon': 'monitor', 'is_default': True},
            {'name': 'Other Expenses', 'type': 'expense', 'color': '#6B7280', 'icon': 'minus-circle', 'is_default': True},
        ]
        
        # Create all categories
        categories_to_create = []
        for cat_data in income_categories + expense_categories:
            categories_to_create.append(
                Category(
                    member=member,
                    name=cat_data['name'],
                    type=cat_data['type'],
                    color=cat_data['color'],
                    icon=cat_data['icon'],
                    is_default=cat_data['is_default']
                )
            )
        
        Category.objects.bulk_create(categories_to_create)


class MemberLoginSerializer(serializers.Serializer):
    """Serializer for member login"""
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, style={'input_type': 'password'})


class UserSettingsSerializer(serializers.ModelSerializer):
    """Serializer for UserSettings model"""
    user_id = serializers.IntegerField(source='member.id', read_only=True)

    class Meta:
        model = UserSettings
        fields = ['id', 'tax_rate', 'currency', 'language', 'default_period', 'user_id', 'created_at', 'updated_at']
        read_only_fields = ['id', 'user_id', 'created_at', 'updated_at']


class CategorySerializer(serializers.ModelSerializer):
    """Serializer for Category model"""
    user_id = serializers.IntegerField(source='member.id', read_only=True)

    class Meta:
        model = Category
        fields = ['id', 'name', 'type', 'color', 'icon', 'is_default', 'user_id', 'created_at', 'updated_at']
        read_only_fields = ['id', 'user_id', 'created_at', 'updated_at']


class TransactionSerializer(serializers.ModelSerializer):
    """Serializer for Transaction model"""
    user_id = serializers.IntegerField(source='member.id', read_only=True)
    category_id = serializers.IntegerField(source='category.id')

    class Meta:
        model = Transaction
        fields = [
            'id', 'type', 'amount', 'date', 'category_id', 'description',
            'counterparty', 'project', 'account', 'document',
            'user_id', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'user_id', 'created_at', 'updated_at']

    def create(self, validated_data):
        category_data = validated_data.pop('category')
        category_id = category_data['id']
        
        try:
            category = Category.objects.get(id=category_id)
        except Category.DoesNotExist:
            raise serializers.ValidationError({'category_id': 'Category does not exist'})
        
        validated_data['category'] = category
        return Transaction.objects.create(**validated_data)

    def update(self, instance, validated_data):
        if 'category' in validated_data:
            category_data = validated_data.pop('category')
            category_id = category_data['id']
            
            try:
                category = Category.objects.get(id=category_id)
            except Category.DoesNotExist:
                raise serializers.ValidationError({'category_id': 'Category does not exist'})
            
            validated_data['category'] = category
        
        return super().update(instance, validated_data)


class MessageSerializer(serializers.Serializer):
    """Generic message serializer"""
    message = serializers.CharField(max_length=200)


# Dashboard serializers
class DashboardStatsSerializer(serializers.Serializer):
    """Serializer for dashboard statistics"""
    total_income = serializers.DecimalField(max_digits=15, decimal_places=2)
    total_expenses = serializers.DecimalField(max_digits=15, decimal_places=2)
    net_profit = serializers.DecimalField(max_digits=15, decimal_places=2)
    taxes = serializers.DecimalField(max_digits=15, decimal_places=2)
    cash_flow = serializers.DecimalField(max_digits=15, decimal_places=2)
    profitability = serializers.DecimalField(max_digits=15, decimal_places=2)
    period = serializers.CharField()
    date_from = serializers.DateField()
    date_to = serializers.DateField()


class DynamicsItemSerializer(serializers.Serializer):
    """Serializer for dynamics item"""
    month = serializers.DateField()
    income = serializers.DecimalField(max_digits=15, decimal_places=2)
    expenses = serializers.DecimalField(max_digits=15, decimal_places=2)
    profit = serializers.DecimalField(max_digits=15, decimal_places=2)


class DashboardDynamicsSerializer(serializers.Serializer):
    """Serializer for dashboard dynamics"""
    dynamics = DynamicsItemSerializer(many=True)
    period = serializers.CharField()
    date_from = serializers.DateField()
    date_to = serializers.DateField()


class TopCategoryItemSerializer(serializers.Serializer):
    """Serializer for top category item"""
    category_id = serializers.IntegerField()
    category_name = serializers.CharField()
    amount = serializers.DecimalField(max_digits=15, decimal_places=2)
    percentage = serializers.DecimalField(max_digits=5, decimal_places=2)


class TopCategoriesSerializer(serializers.Serializer):
    """Serializer for top categories"""
    income_categories = TopCategoryItemSerializer(many=True)
    expense_categories = TopCategoryItemSerializer(many=True)
    period = serializers.CharField()
    date_from = serializers.DateField()
    date_to = serializers.DateField()


# Reports serializers
class CategoryBreakdownSerializer(serializers.Serializer):
    """Serializer for category breakdown"""
    category_id = serializers.IntegerField()
    category_name = serializers.CharField()
    amount = serializers.DecimalField(max_digits=15, decimal_places=2)


class IncomeExpensesSerializer(serializers.Serializer):
    """Serializer for income/expenses breakdown"""
    total = serializers.DecimalField(max_digits=15, decimal_places=2)
    categories = CategoryBreakdownSerializer(many=True)


class ProfitLossReportSerializer(serializers.Serializer):
    """Serializer for profit and loss report"""
    income = IncomeExpensesSerializer()
    expenses = IncomeExpensesSerializer()
    gross_profit = serializers.DecimalField(max_digits=15, decimal_places=2)
    taxes = serializers.DecimalField(max_digits=15, decimal_places=2)
    net_profit = serializers.DecimalField(max_digits=15, decimal_places=2)
    period = serializers.CharField()
    date_from = serializers.DateField()
    date_to = serializers.DateField()


class CashFlowMonthlyDataSerializer(serializers.Serializer):
    """Serializer for cash flow monthly data"""
    month = serializers.DateField()
    inflows = serializers.DecimalField(max_digits=15, decimal_places=2)
    outflows = serializers.DecimalField(max_digits=15, decimal_places=2)
    net_flow = serializers.DecimalField(max_digits=15, decimal_places=2)


class CashFlowReportSerializer(serializers.Serializer):
    """Serializer for cash flow report"""
    cash_inflows = serializers.DecimalField(max_digits=15, decimal_places=2)
    cash_outflows = serializers.DecimalField(max_digits=15, decimal_places=2)
    net_cash_flow = serializers.DecimalField(max_digits=15, decimal_places=2)
    monthly_data = CashFlowMonthlyDataSerializer(many=True)
    period = serializers.CharField()
    date_from = serializers.DateField()
    date_to = serializers.DateField()


class TaxMonthlyBreakdownSerializer(serializers.Serializer):
    """Serializer for tax monthly breakdown"""
    month = serializers.DateField()
    income = serializers.DecimalField(max_digits=15, decimal_places=2)
    expenses = serializers.DecimalField(max_digits=15, decimal_places=2)
    taxable_income = serializers.DecimalField(max_digits=15, decimal_places=2)
    tax = serializers.DecimalField(max_digits=15, decimal_places=2)


class TaxReportSerializer(serializers.Serializer):
    """Serializer for tax report"""
    taxable_income = serializers.DecimalField(max_digits=15, decimal_places=2)
    tax_rate = serializers.DecimalField(max_digits=5, decimal_places=2)
    estimated_tax = serializers.DecimalField(max_digits=15, decimal_places=2)
    total_income = serializers.DecimalField(max_digits=15, decimal_places=2)
    total_expenses = serializers.DecimalField(max_digits=15, decimal_places=2)
    monthly_breakdown = TaxMonthlyBreakdownSerializer(many=True)
    period = serializers.CharField()
    date_from = serializers.DateField()
    date_to = serializers.DateField()