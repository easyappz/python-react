from django.contrib import admin
from .models import Member, UserSettings, Category, Transaction


@admin.register(Member)
class MemberAdmin(admin.ModelAdmin):
    list_display = ['id', 'email', 'name', 'business_name', 'created_at']
    search_fields = ['email', 'name', 'business_name']
    list_filter = ['created_at']
    readonly_fields = ['created_at']


@admin.register(UserSettings)
class UserSettingsAdmin(admin.ModelAdmin):
    list_display = ['id', 'member', 'tax_rate', 'currency', 'language', 'default_period']
    list_filter = ['currency', 'language', 'default_period']
    search_fields = ['member__email']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['id', 'name', 'type', 'member', 'is_default', 'created_at']
    list_filter = ['type', 'is_default', 'created_at']
    search_fields = ['name', 'member__email']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ['id', 'member', 'type', 'amount', 'date', 'category', 'created_at']
    list_filter = ['type', 'date', 'created_at']
    search_fields = ['member__email', 'description', 'counterparty']
    readonly_fields = ['created_at', 'updated_at']
    date_hierarchy = 'date'
