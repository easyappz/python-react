from rest_framework import serializers
from .models import Member, Board, BoardMember, Column, Card, Label, CardLabel, Checklist, ChecklistItem, Comment, Attachment


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


class ProfileUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating user profile"""
    
    class Meta:
        model = Member
        fields = ['username', 'avatar']
    
    def validate_username(self, value):
        """Check if username already exists (excluding current user)"""
        instance = self.instance
        if Member.objects.filter(username=value).exclude(id=instance.id).exists():
            raise serializers.ValidationError("User with this username already exists")
        if len(value) < 3:
            raise serializers.ValidationError("Username must be at least 3 characters")
        return value


class BoardSerializer(serializers.ModelSerializer):
    """Serializer for Board model"""
    owner = serializers.IntegerField(source='owner.id', read_only=True)
    members = serializers.SerializerMethodField()
    
    class Meta:
        model = Board
        fields = ['id', 'title', 'description', 'background_color', 'owner', 'members', 'created_at']
        read_only_fields = ['id', 'owner', 'members', 'created_at']
    
    def get_members(self, obj):
        """Get list of member IDs"""
        return list(BoardMember.objects.filter(board=obj).values_list('member_id', flat=True))


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
        fields = ['id', 'board', 'name', 'color']
        read_only_fields = ['id']


class LabelCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating a new label"""
    
    class Meta:
        model = Label
        fields = ['board', 'name', 'color']
    
    def validate_board(self, value):
        """Check if board exists"""
        if not Board.objects.filter(id=value.id).exists():
            raise serializers.ValidationError("Board not found")
        return value


class ChecklistItemSerializer(serializers.ModelSerializer):
    """Serializer for checklist items"""
    
    class Meta:
        model = ChecklistItem
        fields = ['id', 'checklist', 'text', 'is_completed']
        read_only_fields = ['id']


class ChecklistSerializer(serializers.ModelSerializer):
    """Serializer for Checklist model"""
    items = ChecklistItemSerializer(many=True, read_only=True)
    
    class Meta:
        model = Checklist
        fields = ['id', 'card', 'title', 'items']
        read_only_fields = ['id']


class ChecklistCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating a new checklist"""
    
    class Meta:
        model = Checklist
        fields = ['card', 'title']
    
    def validate_card(self, value):
        """Check if card exists"""
        if not Card.objects.filter(id=value.id).exists():
            raise serializers.ValidationError("Card not found")
        return value


class CommentSerializer(serializers.ModelSerializer):
    """Serializer for Comment model"""
    
    class Meta:
        model = Comment
        fields = ['id', 'card', 'author', 'text', 'created_at']
        read_only_fields = ['id', 'author', 'created_at']


class CommentCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating a new comment"""
    
    class Meta:
        model = Comment
        fields = ['card', 'text']
    
    def validate_card(self, value):
        """Check if card exists"""
        if not Card.objects.filter(id=value.id).exists():
            raise serializers.ValidationError("Card not found")
        return value


class AttachmentSerializer(serializers.ModelSerializer):
    """Serializer for Attachment model"""
    
    class Meta:
        model = Attachment
        fields = ['id', 'card', 'file', 'filename', 'uploaded_at']
        read_only_fields = ['id', 'uploaded_at']


class CardSerializer(serializers.ModelSerializer):
    """Serializer for Card model - returns labels as comma-separated string per OpenAPI spec"""
    labels = serializers.SerializerMethodField()
    
    class Meta:
        model = Card
        fields = ['id', 'column', 'title', 'description', 'position', 'due_date', 'labels', 'created_at']
        read_only_fields = ['id', 'created_at']
    
    def get_labels(self, obj):
        """Get labels as comma-separated string per OpenAPI spec"""
        card_labels = CardLabel.objects.filter(card=obj).select_related('label')
        label_names = [cl.label.name for cl in card_labels]
        return ', '.join(label_names) if label_names else None


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
