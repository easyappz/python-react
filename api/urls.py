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
    UserSettingsViewSet,
    DashboardStatsView,
    DashboardDynamicsView,
    TopCategoriesView,
    ProfitLossReportView,
    CashFlowReportView,
    TaxReportView,
    ReportExportView
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
    
    # Dashboard endpoints
    path("dashboard/stats/", DashboardStatsView.as_view(), name="dashboard-stats"),
    path("dashboard/dynamics/", DashboardDynamicsView.as_view(), name="dashboard-dynamics"),
    path("dashboard/top-categories/", TopCategoriesView.as_view(), name="dashboard-top-categories"),
    
    # Reports endpoints
    path("reports/profit-loss/", ProfitLossReportView.as_view(), name="reports-profit-loss"),
    path("reports/cash-flow/", CashFlowReportView.as_view(), name="reports-cash-flow"),
    path("reports/tax/", TaxReportView.as_view(), name="reports-tax"),
    path("reports/export/", ReportExportView.as_view(), name="reports-export"),
    
    # Include router URLs
    path("", include(router.urls)),
]