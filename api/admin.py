from django.contrib import admin
from api.models import Member, Dialog, Message


@admin.register(Member)
class MemberAdmin(admin.ModelAdmin):
    list_display = ['id', 'email', 'first_name', 'last_name', 'is_admin', 'created_at']
    search_fields = ['email', 'first_name', 'last_name']
    list_filter = ['is_admin', 'created_at']
    readonly_fields = ['created_at']
    actions = ['delete_selected']

    def delete_selected(self, request, queryset):
        """Delete selected members"""
        count = queryset.count()
        queryset.delete()
        self.message_user(request, f'{count} members deleted successfully.')
    delete_selected.short_description = 'Delete selected members'


@admin.register(Dialog)
class DialogAdmin(admin.ModelAdmin):
    list_display = ['id', 'participant1', 'participant2', 'created_at', 'updated_at']
    search_fields = ['participant1__email', 'participant2__email']
    readonly_fields = ['created_at', 'updated_at']
    list_filter = ['created_at', 'updated_at']

    def get_queryset(self, request):
        """Optimize queries with select_related"""
        qs = super().get_queryset(request)
        return qs.select_related('participant1', 'participant2')


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ['id', 'dialog', 'sender', 'text_preview', 'created_at']
    search_fields = ['text', 'sender__email']
    list_filter = ['created_at']
    readonly_fields = ['created_at']
    actions = ['delete_selected']

    def text_preview(self, obj):
        """Show preview of message text"""
        return obj.text[:50] + '...' if len(obj.text) > 50 else obj.text
    text_preview.short_description = 'Text Preview'

    def delete_selected(self, request, queryset):
        """Delete selected messages"""
        count = queryset.count()
        queryset.delete()
        self.message_user(request, f'{count} messages deleted successfully.')
    delete_selected.short_description = 'Delete selected messages'

    def get_queryset(self, request):
        """Optimize queries with select_related"""
        qs = super().get_queryset(request)
        return qs.select_related('dialog', 'sender')
