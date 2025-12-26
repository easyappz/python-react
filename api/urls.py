from django.urls import path
from .views import (
    RegisterView,
    LoginView,
    LogoutView,
    MeView,
    MemberListView,
    MemberDetailView,
    MemberUpdateView,
    DialogListView,
    DialogCreateView,
    DialogDetailView,
    MessageCreateView
)

urlpatterns = [
    # Authentication
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/login/', LoginView.as_view(), name='login'),
    path('auth/logout/', LogoutView.as_view(), name='logout'),
    path('auth/me/', MeView.as_view(), name='me'),
    
    # Members
    path('members/', MemberListView.as_view(), name='member-list'),
    path('members/<int:id>/', MemberDetailView.as_view(), name='member-detail'),
    path('members/<int:id>/update/', MemberUpdateView.as_view(), name='member-update'),
    
    # Dialogs
    path('dialogs/', DialogListView.as_view(), name='dialog-list'),
    path('dialogs/create/', DialogCreateView.as_view(), name='dialog-create'),
    path('dialogs/<int:id>/', DialogDetailView.as_view(), name='dialog-detail'),
    
    # Messages
    path('dialogs/<int:id>/messages/', MessageCreateView.as_view(), name='message-create'),
]
