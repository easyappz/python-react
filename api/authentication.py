from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from .models import Member


class CookieAuthentication(BaseAuthentication):
    def authenticate(self, request):
        member_id = request.session.get('member_id')
        
        if not member_id:
            return None
        
        try:
            member = Member.objects.get(id=member_id)
            return (member, None)
        except Member.DoesNotExist:
            raise AuthenticationFailed('Invalid session')
