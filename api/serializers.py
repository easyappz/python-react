from rest_framework import serializers
from .models import Member, Board, BoardMember, Column


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


class BoardSerializer(serializers.ModelSerializer):
    """Serializer for Board model"""
    owner = MemberSerializer(read_only=True)
    
    class Meta:
        model = Board
        fields = ['id', 'title', 'description', 'background_color', 'owner', 'created_at']
        read_only_fields = ['id', 'owner', 'created_at']


class BoardCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating a new board"""
    
    class Meta:
        model = Board
        fields = ['title', 'description', 'background_color']
    
    def validate_background_color(self, value):
        """Validate hex color format"""
        if value and not value.startswith('#'):
            raise serializers.ValidationError("Color must be in hex format (e.g., #0079BF)")
        if value and len(value) != 7:
            raise serializers.ValidationError("Color must be 7 characters long (e.g., #0079BF)")
        return value


class BoardInviteSerializer(serializers.Serializer):
    """Serializer for inviting members to board"""
    member_id = serializers.IntegerField(required=True)
    
    def validate_member_id(self, value):
        """Check if member exists"""
        if not Member.objects.filter(id=value).exists():
            raise serializers.ValidationError("Member not found")
        return value


class ColumnSerializer(serializers.ModelSerializer):
    """Serializer for Column model"""
    
    class Meta:
        model = Column
        fields = ['id', 'board', 'title', 'position']
        read_only_fields = ['id']


class ColumnCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating a new column"""
    
    class Meta:
        model = Column
        fields = ['board', 'title', 'position']
    
    def validate_board(self, value):
        """Check if board exists"""
        if not Board.objects.filter(id=value.id).exists():
            raise serializers.ValidationError("Board not found")
        return value


class ColumnReorderSerializer(serializers.Serializer):
    """Serializer for reordering columns"""
    board = serializers.IntegerField(required=True)
    column_orders = serializers.ListField(
        child=serializers.DictField(),
        required=True
    )
    
    def validate_board(self, value):
        """Check if board exists"""
        if not Board.objects.filter(id=value).exists():
            raise serializers.ValidationError("Board not found")
        return value
    
    def validate_column_orders(self, value):
        """Validate column orders structure"""
        for item in value:
            if 'id' not in item or 'position' not in item:
                raise serializers.ValidationError("Each item must have 'id' and 'position' fields")
        return value
