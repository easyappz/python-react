from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from django.conf import settings
from .models import Member


class CookieAuthentication(BaseAuthentication):
    """
    Custom authentication class that uses HttpOnly cookies for session management
    """

    def authenticate(self, request):
        session_id = request.COOKIES.get('sessionid')
        
        if not session_id:
            return None
        
        member_id = request.session.get('member_id')
        
        if not member_id:
            return None
        
        try:
            member = Member.objects.get(id=member_id)
            return (member, None)
        except Member.DoesNotExist:
            raise AuthenticationFailed('Invalid session')
