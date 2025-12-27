from rest_framework import serializers
from .models import Member, Board, BoardMember, Column, Card, Label, CardLabel, Checklist, Comment


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


class LabelSerializer(serializers.ModelSerializer):
    """Serializer for Label model"""
    
    class Meta:
        model = Label
        fields = ['id', 'name', 'color']
        read_only_fields = ['id']


class ChecklistItemSerializer(serializers.Serializer):
    """Serializer for checklist items"""
    id = serializers.IntegerField(read_only=True)
    text = serializers.CharField(max_length=500)
    is_completed = serializers.BooleanField(default=False)


class ChecklistSerializer(serializers.ModelSerializer):
    """Serializer for Checklist model"""
    items = ChecklistItemSerializer(many=True, read_only=True)
    
    class Meta:
        model = Checklist
        fields = ['id', 'title', 'items']
        read_only_fields = ['id']


class CardSerializer(serializers.ModelSerializer):
    """Serializer for Card model with nested data"""
    labels = LabelSerializer(many=True, read_only=True, source='card_labels.label')
    checklists = ChecklistSerializer(many=True, read_only=True)
    comments_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Card
        fields = ['id', 'column', 'title', 'description', 'position', 'due_date', 'created_at', 'labels', 'checklists', 'comments_count']
        read_only_fields = ['id', 'created_at']
    
    def get_comments_count(self, obj):
        """Get count of comments for the card"""
        return obj.comments.count()
    
    def to_representation(self, instance):
        """Custom representation to handle labels properly"""
        representation = super().to_representation(instance)
        # Get labels through CardLabel relationship
        card_labels = CardLabel.objects.filter(card=instance).select_related('label')
        representation['labels'] = LabelSerializer([cl.label for cl in card_labels], many=True).data
        return representation


class CardCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating a new card"""
    labels = serializers.CharField(required=False, allow_null=True, allow_blank=True)
    
    class Meta:
        model = Card
        fields = ['column', 'title', 'description', 'position', 'due_date', 'labels']
    
    def validate_column(self, value):
        """Check if column exists"""
        if not Column.objects.filter(id=value.id).exists():
            raise serializers.ValidationError("Column not found")
        return value
    
    def create(self, validated_data):
        """Create card and handle labels"""
        labels_str = validated_data.pop('labels', None)
        card = Card.objects.create(**validated_data)
        
        # Handle labels if provided
        if labels_str:
            label_names = [name.strip() for name in labels_str.split(',') if name.strip()]
            board = card.column.board
            for label_name in label_names:
                label, created = Label.objects.get_or_create(
                    board=board,
                    name=label_name,
                    defaults={'color': '#61BD4F'}
                )
                CardLabel.objects.create(card=card, label=label)
        
        return card


class CardMoveSerializer(serializers.Serializer):
    """Serializer for moving a card"""
    column = serializers.IntegerField(required=True)
    position = serializers.IntegerField(required=True)
    
    def validate_column(self, value):
        """Check if column exists"""
        if not Column.objects.filter(id=value).exists():
            raise serializers.ValidationError("Column not found")
        return value
    
    def validate_position(self, value):
        """Validate position is non-negative"""
        if value < 0:
            raise serializers.ValidationError("Position must be non-negative")
        return value
