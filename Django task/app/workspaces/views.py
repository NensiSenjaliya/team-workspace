from django.contrib.auth.models import User
from django.shortcuts import get_object_or_404
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from app.activity_logs.models import ActivityLog
from app.tasks.models import Task
from core.permissions import is_workspace_admin
from .models import Workspace, WorkspaceMember
from .serializers import (
    WorkspaceInviteSerializer,
    WorkspaceMemberSerializer,
    WorkspaceSerializer,
)


class WorkspaceViewSet(viewsets.ModelViewSet):
    serializer_class = WorkspaceSerializer
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'created_at']
    ordering = ['-created_at']

    def get_queryset(self):
        return Workspace.objects.filter(
            members__user=self.request.user
        ).select_related('created_by').prefetch_related(
            'members__user'
        ).distinct()

    def perform_create(self, serializer):
        workspace = serializer.save(created_by=self.request.user)
        WorkspaceMember.objects.create(
            workspace=workspace,
            user=self.request.user,
            role='admin'
        )

    def create(self, request, *args, **kwargs):
        if Workspace.objects.filter(created_by=request.user).exists():
            return Response(
                {'detail': 'You can create only one workspace.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        return super().create(request, *args, **kwargs)

    def _require_admin(self, workspace):
        if not is_workspace_admin(self.request.user, workspace):
            return Response(
                {'detail': 'Only workspace admins can perform this action.'},
                status=status.HTTP_403_FORBIDDEN
            )
        return None

    def update(self, request, *args, **kwargs):
        denied = self._require_admin(self.get_object())
        if denied:
            return denied
        return super().update(request, *args, **kwargs)

    def partial_update(self, request, *args, **kwargs):
        denied = self._require_admin(self.get_object())
        if denied:
            return denied
        return super().partial_update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        denied = self._require_admin(self.get_object())
        if denied:
            return denied
        return super().destroy(request, *args, **kwargs)

    @action(detail=True, methods=['get'])
    def members(self, request, pk=None):
        members = self.get_object().members.select_related('user').order_by('joined_at')
        serializer = WorkspaceMemberSerializer(members, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def invite(self, request, pk=None):
        workspace = self.get_object()
        denied = self._require_admin(workspace)
        if denied:
            return denied

        serializer = WorkspaceInviteSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data['email']
        user = User.objects.filter(email__iexact=email).first()

        if not user:
            base_username = serializer.validated_data.get('username') or email.split('@')[0]
            username = base_username
            suffix = 1
            while User.objects.filter(username__iexact=username).exists():
                username = f'{base_username}{suffix}'
                suffix += 1

            user = User.objects.create_user(
                username=username,
                email=email,
                password=serializer.validated_data['password']
            )

        member, created = WorkspaceMember.objects.get_or_create(
            workspace=workspace,
            user=user,
            defaults={'role': 'member'}
        )

        if not created and member.role != 'member':
            member.role = 'member'
            member.save(update_fields=['role'])

        ActivityLog.objects.create(
            workspace=workspace,
            user=request.user,
            action='member_invited',
            description=f'{request.user.username} added {user.username} as {member.role}.'
        )

        return Response(WorkspaceMemberSerializer(member).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['delete'], url_path='members/(?P<member_id>[^/.]+)')
    def remove_member(self, request, pk=None, member_id=None):
        workspace = self.get_object()
        denied = self._require_admin(workspace)
        if denied:
            return denied

        member = get_object_or_404(WorkspaceMember, pk=member_id, workspace=workspace)
        if member.role == 'admin':
            remaining_admins = WorkspaceMember.objects.filter(
                workspace=workspace,
                role='admin'
            ).exclude(pk=member.pk).exists()
            if not remaining_admins:
                return Response(
                    {'detail': 'A workspace must keep at least one admin.'},
                    status=status.HTTP_400_BAD_REQUEST
                )

        removed_user = member.user
        removed_username = removed_user.username
        unassigned_count = Task.objects.filter(
            workspace=workspace,
            assignee=removed_user
        ).update(assignee=None)
        member.delete()
        ActivityLog.objects.create(
            workspace=workspace,
            user=request.user,
            action='member_removed',
            description=(
                f'{request.user.username} removed {removed_username} from the workspace. '
                f'{unassigned_count} assigned task(s) were marked unassigned.'
            )
        )
        return Response(status=status.HTTP_204_NO_CONTENT)
