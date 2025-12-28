from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    HelloView,
    RegisterView,
    LoginView,
    LogoutView,
    MeView,
    TransactionViewSet,
    CategoryViewSet,
    UserSettingsViewSet
)

router = DefaultRouter()
router.register(r'transactions', TransactionViewSet, basename='transaction')
router.register(r'categories', CategoryViewSet, basename='category')

urlpatterns = [
    path("hello/", HelloView.as_view(), name="hello"),
    
    # Authentication endpoints
    path("auth/register/", RegisterView.as_view(), name="register"),
    path("auth/login/", LoginView.as_view(), name="login"),
    path("auth/logout/", LogoutView.as_view(), name="logout"),
    path("auth/me/", MeView.as_view(), name="me"),
    
    # Settings endpoints
    path("settings/", UserSettingsViewSet.as_view({'get': 'retrieve', 'put': 'update'}), name="settings"),
    
    # Include router URLs
    path("", include(router.urls)),
]
