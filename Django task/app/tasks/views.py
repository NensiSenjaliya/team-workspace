from rest_framework import status, viewsets
from rest_framework.response import Response

from app.activity_logs.models import ActivityLog
from core.permissions import is_workspace_admin, is_workspace_member
from .models import Task
from .serializers import TaskSerializer


class TaskViewSet(viewsets.ModelViewSet):
    serializer_class = TaskSerializer
    filterset_fields = ['workspace', 'status', 'priority', 'assignee', 'due_date']
    search_fields = ['title', 'description']
    ordering_fields = ['due_date', 'created_at', 'updated_at', 'priority', 'status']
    ordering = ['-created_at']

    def get_queryset(self):
        return Task.objects.filter(
            workspace__members__user=self.request.user
        ).select_related(
            'workspace', 'created_by', 'assignee'
        ).distinct()

    def perform_create(self, serializer):
        workspace = serializer.validated_data['workspace']
        save_kwargs = {'created_by': self.request.user}
        if not is_workspace_admin(self.request.user, workspace):
            save_kwargs['assignee'] = self.request.user

        task = serializer.save(**save_kwargs)
        ActivityLog.objects.create(
            workspace=workspace,
            task=task,
            user=self.request.user,
            action='task_created',
            description=f'{self.request.user.username} created task "{task.title}".'
        )

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        workspace = serializer.validated_data['workspace']
        if not is_workspace_member(request.user, workspace):
            return Response(
                {'detail': 'You must be a workspace member to create tasks.'},
                status=status.HTTP_403_FORBIDDEN
            )
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def _can_delete(self, task):
        return is_workspace_admin(self.request.user, task.workspace)

    def _can_update_with_payload(self, task, data):
        if is_workspace_admin(self.request.user, task.workspace):
            return True

        if task.created_by_id == self.request.user.id:
            return True

        status_only = set(data.keys()) <= {'status'}
        return task.assignee_id == self.request.user.id and status_only

    def update(self, request, *args, **kwargs):
        task = self.get_object()
        if not self._can_update_with_payload(task, request.data):
            return Response(
                {'detail': 'Members can edit their own tasks. Assigned members can only update task status.'},
                status=status.HTTP_403_FORBIDDEN
            )

        old_status = task.status
        response = super().update(request, *args, **kwargs)
        task.refresh_from_db()
        if old_status != task.status:
            ActivityLog.objects.create(
                workspace=task.workspace,
                task=task,
                user=request.user,
                action='task_updated',
                description=f'{request.user.username} changed "{task.title}" status from {old_status} to {task.status}.'
            )
        return response

    def partial_update(self, request, *args, **kwargs):
        kwargs['partial'] = True
        return self.update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        task = self.get_object()
        if not self._can_delete(task):
            return Response(
                {'detail': 'Only workspace admins can delete tasks.'},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().destroy(request, *args, **kwargs)
