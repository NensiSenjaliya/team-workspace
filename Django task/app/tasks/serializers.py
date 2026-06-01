from rest_framework import serializers
from app.accounts.serializers import UserSerializer
from .models import Task
from app.workspaces.models import WorkspaceMember
from core.permissions import is_workspace_admin

class TaskSerializer(serializers.ModelSerializer):
    assignee_detail = UserSerializer(source='assignee', read_only=True)
    created_by_detail = UserSerializer(source='created_by', read_only=True)

    class Meta:
        model = Task
        fields = [
            'id', 'workspace', 'title', 'description', 'status', 'priority',
            'due_date', 'assignee', 'assignee_detail', 'created_by',
            'created_by_detail', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_by', 'created_by_detail', 'created_at', 'updated_at']

    def to_representation(self, instance):
        data = super().to_representation(instance)

        if instance.assignee_id and not WorkspaceMember.objects.filter(
            workspace=instance.workspace,
            user_id=instance.assignee_id
        ).exists():
            data['assignee'] = None
            data['assignee_detail'] = None

        return data

    def validate(self, data):
        workspace = data.get('workspace') or getattr(self.instance, 'workspace', None)
        assignee = data.get('assignee')
        request = self.context.get('request')

        if request and workspace and not WorkspaceMember.objects.filter(
            workspace=workspace,
            user=request.user
        ).exists():
            raise serializers.ValidationError("You must be a workspace member.")

        if assignee and workspace:
            is_member = WorkspaceMember.objects.filter(
                workspace=workspace,
                user=assignee
            ).exists()

            if not is_member:
                raise serializers.ValidationError("Assignee must be workspace member.")

        if request and workspace and 'assignee' in data and not is_workspace_admin(request.user, workspace):
            if assignee != request.user:
                raise serializers.ValidationError("Members can only assign tasks to themselves.")

        return data
