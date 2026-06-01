from rest_framework import status, viewsets
from rest_framework.response import Response

from app.activity_logs.models import ActivityLog
from core.permissions import is_workspace_member
from .models import Comment
from .serializers import CommentSerializer


class CommentViewSet(viewsets.ModelViewSet):
    serializer_class = CommentSerializer
    filterset_fields = ['task']
    ordering_fields = ['created_at']
    ordering = ['created_at']

    def get_queryset(self):
        return Comment.objects.filter(
            task__workspace__members__user=self.request.user
        ).select_related(
            'task', 'task__workspace', 'user'
        ).distinct()

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        task = serializer.validated_data['task']
        if not is_workspace_member(request.user, task.workspace):
            return Response(
                {'detail': 'You must be a workspace member to comment on this task.'},
                status=status.HTTP_403_FORBIDDEN
            )

        comment = serializer.save(user=request.user)
        ActivityLog.objects.create(
            workspace=task.workspace,
            task=task,
            user=request.user,
            action='comment_added',
            description=f'{request.user.username} commented on "{task.title}".'
        )
        return Response(CommentSerializer(comment).data, status=status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        comment = self.get_object()
        if comment.user_id != request.user.id:
            return Response(
                {'detail': 'You can only edit your own comments.'},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().update(request, *args, **kwargs)

    def partial_update(self, request, *args, **kwargs):
        kwargs['partial'] = True
        return self.update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        comment = self.get_object()
        if comment.user_id != request.user.id:
            return Response(
                {'detail': 'You can only delete your own comments.'},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().destroy(request, *args, **kwargs)
