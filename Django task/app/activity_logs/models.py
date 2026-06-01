from django.db import models
from django.contrib.auth.models import User
from app.workspaces.models import Workspace
from app.tasks.models import Task

class ActivityLog(models.Model):
    ACTION_CHOICES = (
        ('task_created', 'Task Created'),
        ('task_updated', 'Task Updated'),
        ('comment_added', 'Comment Added'),
        ('member_invited', 'Member Invited'),
        ('member_removed', 'Member Removed'),
    )

    workspace = models.ForeignKey(Workspace, on_delete=models.CASCADE, related_name='activity_logs')
    task = models.ForeignKey(Task, on_delete=models.CASCADE, null=True, blank=True, related_name='activity_logs')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    action = models.CharField(max_length=50, choices=ACTION_CHOICES)
    description = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)