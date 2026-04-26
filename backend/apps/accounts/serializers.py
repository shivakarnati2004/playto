from django.contrib.auth import authenticate
from rest_framework import serializers
from rest_framework.authtoken.models import Token

from .models import User


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password', 'phone', 'role')
        read_only_fields = ('id',)
        extra_kwargs = {
            'role': {'default': User.ROLE_MERCHANT},
        }

    def validate_role(self, value):
        # Only allow merchant self-registration; reviewers are created via seed/admin
        if value == User.ROLE_REVIEWER:
            raise serializers.ValidationError("Reviewer accounts cannot be self-registered.")
        return value

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        user = authenticate(username=data['username'], password=data['password'])
        if not user:
            raise serializers.ValidationError("Invalid credentials. Please try again.")
        if not user.is_active:
            raise serializers.ValidationError("This account has been deactivated.")
        data['user'] = user
        return data


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'phone', 'role', 'first_name', 'last_name', 'is_email_verified')
        read_only_fields = ('id', 'role', 'is_email_verified')
