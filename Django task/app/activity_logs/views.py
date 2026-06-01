from rest_framework import viewsets

from .models import ActivityLog
from .serializers import ActivityLogSerializer


class ActivityLogViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = ActivityLogSerializer
    pagination_class = None
    filterset_fields = ['workspace', 'task', 'action', 'user']
    ordering_fields = ['created_at']
    ordering = ['-created_at']

    def get_queryset(self):
        return ActivityLog.objects.filter(
            workspace__members__user=self.request.user
        ).select_related(
            'workspace', 'task', 'user'
        ).distinct()
