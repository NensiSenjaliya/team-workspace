from rest_framework import permissions

from app.workspaces.models import WorkspaceMember


def is_workspace_member(user, workspace):
    if not user or not user.is_authenticated:
        return False

    return WorkspaceMember.objects.filter(
        user=user,
        workspace=workspace
    ).exists()


def is_workspace_admin(user, workspace):
    if not user or not user.is_authenticated:
        return False

    return WorkspaceMember.objects.filter(
        user=user,
        workspace=workspace,
        role='admin'
    ).exists()


class IsAuthenticatedWorkspaceMember(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated)
