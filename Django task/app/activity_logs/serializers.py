from rest_framework import serializers
from app.accounts.serializers import UserSerializer
from .models import ActivityLog

class ActivityLogSerializer(serializers.ModelSerializer):
    user_detail = UserSerializer(source='user', read_only=True)

    class Meta:
        model = ActivityLog
        fields = ['id', 'workspace', 'task', 'user', 'user_detail', 'action', 'description', 'created_at']
        read_only_fields = fields
