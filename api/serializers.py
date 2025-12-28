from rest_framework import serializers
from .models import Member, UserSettings, Category, Transaction


class MemberSerializer(serializers.ModelSerializer):
    """Serializer for Member model"""
    class Meta:
        model = Member
        fields = ['id', 'email', 'name', 'business_name', 'created_at']
        read_only_fields = ['id', 'created_at']


class MemberRegistrationSerializer(serializers.ModelSerializer):
    """Serializer for member registration"""
    password = serializers.CharField(write_only=True, min_length=8, style={'input_type': 'password'})

    class Meta:
        model = Member
        fields = ['email', 'password', 'name', 'business_name']

    def create(self, validated_data):
        password = validated_data.pop('password')
        member = Member(**validated_data)
        member.set_password(password)
        member.save()
        
        # Create default settings for the member
        UserSettings.objects.create(member=member)
        
        return member


class MemberLoginSerializer(serializers.Serializer):
    """Serializer for member login"""
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, style={'input_type': 'password'})


class UserSettingsSerializer(serializers.ModelSerializer):
    """Serializer for UserSettings model"""
    user_id = serializers.IntegerField(source='member.id', read_only=True)

    class Meta:
        model = UserSettings
        fields = ['id', 'tax_rate', 'currency', 'language', 'default_period', 'user_id', 'created_at', 'updated_at']
        read_only_fields = ['id', 'user_id', 'created_at', 'updated_at']


class CategorySerializer(serializers.ModelSerializer):
    """Serializer for Category model"""
    user_id = serializers.IntegerField(source='member.id', read_only=True)

    class Meta:
        model = Category
        fields = ['id', 'name', 'type', 'color', 'icon', 'is_default', 'user_id', 'created_at', 'updated_at']
        read_only_fields = ['id', 'user_id', 'created_at', 'updated_at']


class TransactionSerializer(serializers.ModelSerializer):
    """Serializer for Transaction model"""
    user_id = serializers.IntegerField(source='member.id', read_only=True)
    category_id = serializers.IntegerField(source='category.id')

    class Meta:
        model = Transaction
        fields = [
            'id', 'type', 'amount', 'date', 'category_id', 'description',
            'counterparty', 'project', 'account', 'document',
            'user_id', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'user_id', 'created_at', 'updated_at']

    def create(self, validated_data):
        category_data = validated_data.pop('category')
        category_id = category_data['id']
        
        try:
            category = Category.objects.get(id=category_id)
        except Category.DoesNotExist:
            raise serializers.ValidationError({'category_id': 'Category does not exist'})
        
        validated_data['category'] = category
        return Transaction.objects.create(**validated_data)

    def update(self, instance, validated_data):
        if 'category' in validated_data:
            category_data = validated_data.pop('category')
            category_id = category_data['id']
            
            try:
                category = Category.objects.get(id=category_id)
            except Category.DoesNotExist:
                raise serializers.ValidationError({'category_id': 'Category does not exist'})
            
            validated_data['category'] = category
        
        return super().update(instance, validated_data)


class MessageSerializer(serializers.Serializer):
    """Generic message serializer"""
    message = serializers.CharField(max_length=200)
