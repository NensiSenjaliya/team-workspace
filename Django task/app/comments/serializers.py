from rest_framework import serializers
from app.accounts.serializers import UserSerializer
from app.workspaces.models import WorkspaceMember
from .models import Comment

class CommentSerializer(serializers.ModelSerializer):
    user_detail = UserSerializer(source='user', read_only=True)

    class Meta:
        model = Comment
        fields = ['id', 'task', 'user', 'user_detail', 'message', 'created_at']
        read_only_fields = ['id', 'user', 'user_detail', 'created_at']

    def validate(self, data):
        task = data.get('task') or getattr(self.instance, 'task', None)
        request = self.context.get('request')

        if self.instance and 'task' in data and data['task'] != self.instance.task:
            raise serializers.ValidationError("A comment cannot be moved to another task.")

        if request and task and not WorkspaceMember.objects.filter(
            workspace=task.workspace,
            user=request.user
        ).exists():
            raise serializers.ValidationError("You must be a workspace member.")

        return data
