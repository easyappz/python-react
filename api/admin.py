from django.contrib import admin
from .models import Member


@admin.register(Member)
class MemberAdmin(admin.ModelAdmin):
    list_display = ['id', 'email', 'first_name', 'last_name', 'created_at']
    list_filter = ['created_at', 'updated_at']
    search_fields = ['email', 'first_name', 'last_name']
    readonly_fields = ['created_at', 'updated_at']
    ordering = ['-created_at']

    fieldsets = (
        ('User Information', {
            'fields': ('email', 'first_name', 'last_name')
        }),
        ('Password', {
            'fields': ('password',),
            'description': 'Password is hashed. Cannot be viewed.'
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
