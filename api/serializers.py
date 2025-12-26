from rest_framework import serializers
from .models import Member, Dialog, Message


class MemberSerializer(serializers.ModelSerializer):
    class Meta:
        model = Member
        fields = ['id', 'email', 'first_name', 'last_name', 'created_at']
        read_only_fields = ['id', 'created_at']


class MemberCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = Member
        fields = ['email', 'password', 'first_name', 'last_name']

    def create(self, validated_data):
        member = Member(
            email=validated_data['email'],
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name']
        )
        member.set_password(validated_data['password'])
        member.save()
        return member


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)


class MemberUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Member
        fields = ['first_name', 'last_name']


class MessageSenderSerializer(serializers.ModelSerializer):
    class Meta:
        model = Member
        fields = ['id', 'first_name', 'last_name']


class MessageSerializer(serializers.ModelSerializer):
    sender = MessageSenderSerializer(read_only=True)

    class Meta:
        model = Message
        fields = ['id', 'sender', 'text', 'created_at']
        read_only_fields = ['id', 'sender', 'created_at']


class MessageCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = ['text']

    def validate_text(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError('Message text cannot be empty')
        return value


class LastMessageSerializer(serializers.ModelSerializer):
    sender_id = serializers.IntegerField(source='sender.id', read_only=True)

    class Meta:
        model = Message
        fields = ['id', 'text', 'created_at', 'sender_id']


class DialogParticipantSerializer(serializers.ModelSerializer):
    class Meta:
        model = Member
        fields = ['id', 'email', 'first_name', 'last_name']


class DialogSerializer(serializers.ModelSerializer):
    participant = serializers.SerializerMethodField()
    last_message = serializers.SerializerMethodField()

    class Meta:
        model = Dialog
        fields = ['id', 'participant', 'last_message', 'created_at']
        read_only_fields = ['id', 'created_at']

    def get_participant(self, obj):
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            other_participant = obj.get_other_participant(request.user)
            return DialogParticipantSerializer(other_participant).data
        return None

    def get_last_message(self, obj):
        last_message = obj.messages.order_by('-created_at').first()
        if last_message:
            return LastMessageSerializer(last_message).data
        return None


class DialogDetailSerializer(serializers.ModelSerializer):
    participant = serializers.SerializerMethodField()
    messages = MessageSerializer(many=True, read_only=True)

    class Meta:
        model = Dialog
        fields = ['id', 'participant', 'messages', 'created_at']
        read_only_fields = ['id', 'created_at']

    def get_participant(self, obj):
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            other_participant = obj.get_other_participant(request.user)
            return DialogParticipantSerializer(other_participant).data
        return None


class DialogCreateSerializer(serializers.Serializer):
    participant_id = serializers.IntegerField()

    def validate_participant_id(self, value):
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            if request.user.id == value:
                raise serializers.ValidationError('Cannot create dialog with yourself')
        
        try:
            Member.objects.get(id=value)
        except Member.DoesNotExist:
            raise serializers.ValidationError('Member not found')
        
        return value
