from rest_framework import serializers
from .models import Member


class MessageSerializer(serializers.Serializer):
    message = serializers.CharField(max_length=200)
    timestamp = serializers.DateTimeField(read_only=True)


class MemberSerializer(serializers.ModelSerializer):
    """Serializer for Member model"""
    class Meta:
        model = Member
        fields = ['id', 'email', 'username', 'avatar', 'created_at']
        read_only_fields = ['id', 'created_at']


class RegisterSerializer(serializers.Serializer):
    """Serializer for user registration"""
    email = serializers.EmailField(required=True)
    username = serializers.CharField(required=True, min_length=3, max_length=150)
    password = serializers.CharField(required=True, min_length=8, write_only=True)
    password_confirm = serializers.CharField(required=True, min_length=8, write_only=True)

    def validate_email(self, value):
        """Check if email already exists"""
        if Member.objects.filter(email=value).exists():
            raise serializers.ValidationError("User with this email already exists")
        return value

    def validate_username(self, value):
        """Check if username already exists"""
        if Member.objects.filter(username=value).exists():
            raise serializers.ValidationError("User with this username already exists")
        return value

    def validate(self, data):
        """Check if passwords match"""
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError({
                'password_confirm': 'Passwords do not match'
            })
        return data

    def create(self, validated_data):
        """Create new member with hashed password"""
        validated_data.pop('password_confirm')
        member = Member(
            email=validated_data['email'],
            username=validated_data['username']
        )
        member.set_password(validated_data['password'])
        member.save()
        return member


class LoginSerializer(serializers.Serializer):
    """Serializer for user login"""
    email = serializers.EmailField(required=True)
    password = serializers.CharField(required=True, write_only=True)
