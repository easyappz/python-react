from django.db import migrations


def create_default_categories_for_members(apps, schema_editor):
    """Create default categories for all existing members"""
    Category = apps.get_model('api', 'Category')
    Member = apps.get_model('api', 'Member')
    
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
    
    # Create categories for all existing members
    for member in Member.objects.all():
        # Create income categories
        for cat_data in income_categories:
            Category.objects.get_or_create(
                member=member,
                name=cat_data['name'],
                type=cat_data['type'],
                defaults={
                    'color': cat_data['color'],
                    'icon': cat_data['icon'],
                    'is_default': cat_data['is_default'],
                }
            )
        
        # Create expense categories
        for cat_data in expense_categories:
            Category.objects.get_or_create(
                member=member,
                name=cat_data['name'],
                type=cat_data['type'],
                defaults={
                    'color': cat_data['color'],
                    'icon': cat_data['icon'],
                    'is_default': cat_data['is_default'],
                }
            )


def reverse_default_categories(apps, schema_editor):
    """Remove default categories"""
    Category = apps.get_model('api', 'Category')
    Category.objects.filter(is_default=True).delete()


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(create_default_categories_for_members, reverse_default_categories),
    ]
