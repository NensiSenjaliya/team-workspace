from rest_framework import serializers
from django.contrib.auth.models import User
from app.accounts.serializers import UserSerializer
from .models import Workspace, WorkspaceMember

class WorkspaceSerializer(serializers.ModelSerializer):
    created_by = UserSerializer(read_only=True)

    class Meta:
        model = Workspace
        fields = ['id', 'name', 'description', 'created_by', 'created_at']
        read_only_fields = ['id', 'created_by', 'created_at']


class WorkspaceMemberSerializer(serializers.ModelSerializer):
    user_detail = UserSerializer(source='user', read_only=True)

    class Meta:
        model = WorkspaceMember
        fields = ['id', 'workspace', 'user', 'user_detail', 'role', 'joined_at']
        read_only_fields = ['id', 'workspace', 'joined_at', 'user_detail']


class WorkspaceInviteSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=8, required=False, allow_blank=True)
    username = serializers.CharField(required=False, allow_blank=True, max_length=150)

    def validate(self, data):
        email = data['email'].lower()
        user_exists = User.objects.filter(email__iexact=email).exists()

        if not user_exists and not data.get('password'):
            raise serializers.ValidationError("Password is required when creating a new member account.")

        username = data.get('username')
        if username and User.objects.filter(username__iexact=username).exists():
            raise serializers.ValidationError("This username is already taken.")

        data['email'] = email
        return data
