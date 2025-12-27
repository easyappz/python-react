from django.urls import path
from .views import (
    HelloView, RegisterView, LoginView, LogoutView, MeView,
    BoardListCreateView, BoardDetailView, BoardInviteView,
    ColumnListCreateView, ColumnDetailView, ColumnReorderView,
    CardListCreateView, CardDetailView, CardMoveView, CardSearchView
)

urlpatterns = [
    path("hello/", HelloView.as_view(), name="hello"),
    path("auth/register/", RegisterView.as_view(), name="auth-register"),
    path("auth/login/", LoginView.as_view(), name="auth-login"),
    path("auth/logout/", LogoutView.as_view(), name="auth-logout"),
    path("auth/me/", MeView.as_view(), name="auth-me"),
    
    # Board endpoints
    path("boards/", BoardListCreateView.as_view(), name="boards-list"),
    path("boards/<int:id>/", BoardDetailView.as_view(), name="boards-detail"),
    path("boards/<int:id>/invite/", BoardInviteView.as_view(), name="boards-invite"),
    
    # Column endpoints
    path("columns/", ColumnListCreateView.as_view(), name="columns-list"),
    path("columns/<int:id>/", ColumnDetailView.as_view(), name="columns-detail"),
    path("columns/reorder/", ColumnReorderView.as_view(), name="columns-reorder"),
    
    # Card endpoints
    path("cards/", CardListCreateView.as_view(), name="cards-list"),
    path("cards/<int:id>/", CardDetailView.as_view(), name="cards-detail"),
    path("cards/<int:id>/move/", CardMoveView.as_view(), name="cards-move"),
    path("cards/search/", CardSearchView.as_view(), name="cards-search"),
]
