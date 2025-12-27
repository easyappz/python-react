from django.contrib import admin
from .models import (
    Member, Board, BoardMember, Column, Card, Label, CardLabel,
    Checklist, ChecklistItem, Comment, Attachment
)


@admin.register(Member)
class MemberAdmin(admin.ModelAdmin):
    list_display = ['id', 'username', 'email', 'created_at']
    search_fields = ['username', 'email']
    list_filter = ['created_at']


@admin.register(Board)
class BoardAdmin(admin.ModelAdmin):
    list_display = ['id', 'title', 'owner', 'background_color', 'created_at']
    search_fields = ['title', 'owner__username']
    list_filter = ['created_at']


@admin.register(BoardMember)
class BoardMemberAdmin(admin.ModelAdmin):
    list_display = ['id', 'board', 'member', 'role']
    search_fields = ['board__title', 'member__username']
    list_filter = ['role']


@admin.register(Column)
class ColumnAdmin(admin.ModelAdmin):
    list_display = ['id', 'title', 'board', 'position']
    search_fields = ['title', 'board__title']
    list_filter = ['board']


@admin.register(Card)
class CardAdmin(admin.ModelAdmin):
    list_display = ['id', 'title', 'column', 'position', 'due_date', 'created_at']
    search_fields = ['title', 'description']
    list_filter = ['column', 'created_at', 'due_date']


@admin.register(Label)
class LabelAdmin(admin.ModelAdmin):
    list_display = ['id', 'name', 'color', 'board']
    search_fields = ['name', 'board__title']
    list_filter = ['board']


@admin.register(CardLabel)
class CardLabelAdmin(admin.ModelAdmin):
    list_display = ['id', 'card', 'label']
    search_fields = ['card__title', 'label__name']
    list_filter = ['label']


@admin.register(Checklist)
class ChecklistAdmin(admin.ModelAdmin):
    list_display = ['id', 'title', 'card']
    search_fields = ['title', 'card__title']
    list_filter = ['card']


@admin.register(ChecklistItem)
class ChecklistItemAdmin(admin.ModelAdmin):
    list_display = ['id', 'text', 'checklist', 'is_completed']
    search_fields = ['text', 'checklist__title']
    list_filter = ['is_completed', 'checklist']


@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ['id', 'card', 'author', 'created_at']
    search_fields = ['text', 'card__title', 'author__username']
    list_filter = ['created_at', 'author']


@admin.register(Attachment)
class AttachmentAdmin(admin.ModelAdmin):
    list_display = ['id', 'filename', 'card', 'uploaded_at']
    search_fields = ['filename', 'card__title']
    list_filter = ['uploaded_at', 'card']
