from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken
from django.utils.translation import gettext_lazy as _

from .models import CustomUser


class UserSerializer(serializers.ModelSerializer):    
    class Meta:
        model = CustomUser
        fields = ['id', 'email', 'username', 'phone', 'avatar', 'rating']
        extra_kwargs = {'password': {'write_only': True}}
        read_only_fields = ['id', 'date_joined']


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'},
        min_length=8,
        max_length=128,
        label=_("Password"),
        help_text=_("Password must be at least 8 characters long.")
    )
    password_confirmation = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'},
        label=_("Password Confirmation")
    )

    class Meta:
        model = CustomUser
        fields = ['id', 'email', 'username', 'phone', 'avatar', 'rating', 'password', 'password_confirmation']
        extra_kwargs = {
            'password': {'write_only': True},
            'password_confirmation': {'write_only': True},
        }
        read_only_fields = ['id', 'date_joined']

    def validate(self, data):
        if data['password'] != data['password_confirmation']:
            raise serializers.ValidationError(
                {"password_confirmation": _("Passwords do not match.")}
            )
        return data

    def create(self, validated_data):
        password = validated_data.pop('password')
        validated_data.pop('password_confirmation')
        user = CustomUser.objects.create_user(password=password, **validated_data)
        return user


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True, label=_("Email"))
    password = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'},
        label=_("Password")
    )

    def validate(self, data):
        from django.contrib.auth import authenticate
        user = authenticate(email=data['email'], password=data['password'])
        
        if not user:
            raise serializers.ValidationError(
                {"email": _("Invalid email or password.")}
            )
        if not user.is_active:
            raise serializers.ValidationError(
                {"email": _("User account is disabled.")}
            )
            
        refresh = RefreshToken.for_user(user)
        return {
            'user': UserSerializer(user).data,
            'access': str(refresh.access_token),
            'refresh': str(refresh),
        }