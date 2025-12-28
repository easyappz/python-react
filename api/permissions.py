from rest_framework.permissions import BasePermission


class IsAuthenticated(BasePermission):
    """
    Custom permission to check if user is authenticated
    """
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated
