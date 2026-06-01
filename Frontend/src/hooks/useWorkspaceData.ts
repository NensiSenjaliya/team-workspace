import { useCallback, useEffect, useMemo, useState } from 'react';

import { activityApi, commentApi, taskApi, workspaceApi } from '../services/api';
import { unwrapList } from '../lib/formatters';

const defaultFilters = {
  status: '',
  priority: '',
  search: '',
  ordering: '-created_at'
};

export function useWorkspaceData() {
  const [workspaces, setWorkspaces] = useState([]);
  const [activeWorkspaceId, setActiveWorkspaceId] = useState('');
  const [tasks, setTasks] = useState([]);
  const [taskPagination, setTaskPagination] = useState({ count: 0, next: null, previous: null });
  const [members, setMembers] = useState([]);
  const [activities, setActivities] = useState([]);
  const [commentsByTask, setCommentsByTask] = useState({});
  const [filters, setFilters] = useState(defaultFilters);
  const [loading, setLoading] = useState(true);
  const [loadingMoreTasks, setLoadingMoreTasks] = useState(false);
  const [error, setError] = useState('');

  const activeWorkspace = useMemo(
    () => workspaces.find((workspace) => String(workspace.id) === String(activeWorkspaceId)),
    [activeWorkspaceId, workspaces]
  );

  const refreshWorkspaces = useCallback(async () => {
    const payload = await workspaceApi.list();
    const list = unwrapList(payload);
    setWorkspaces(list);
    setActiveWorkspaceId((current) => current || (list[0]?.id ? String(list[0].id) : ''));
    return list;
  }, []);

  const refreshWorkspaceDetails = useCallback(async () => {
    if (!activeWorkspaceId) {
      setTasks([]);
      setTaskPagination({ count: 0, next: null, previous: null });
      setMembers([]);
      setActivities([]);
      return;
    }

    const [taskPayload, memberPayload, activityPayload] = await Promise.all([
      taskApi.list({ workspace: activeWorkspaceId, ...filters, page: 1 }),
      workspaceApi.members(activeWorkspaceId),
      activityApi.list(activeWorkspaceId)
    ]);

    setTasks(unwrapList(taskPayload));
    setTaskPagination({
      count: taskPayload?.count ?? unwrapList(taskPayload).length,
      next: taskPayload?.next || null,
      previous: taskPayload?.previous || null
    });
    setMembers(unwrapList(memberPayload));
    setActivities(unwrapList(activityPayload));
  }, [activeWorkspaceId, filters]);

  const loadMoreTasks = useCallback(async () => {
    if (!activeWorkspaceId || !taskPagination.next || loadingMoreTasks) return;

    const nextPage = Math.floor(tasks.length / 10) + 1;
    setLoadingMoreTasks(true);
    setError('');

    try {
      const taskPayload = await taskApi.list({
        workspace: activeWorkspaceId,
        ...filters,
        page: nextPage
      });
      setTasks((current) => [...current, ...unwrapList(taskPayload)]);
      setTaskPagination({
        count: taskPayload?.count ?? taskPagination.count,
        next: taskPayload?.next || null,
        previous: taskPayload?.previous || null
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingMoreTasks(false);
    }
  }, [activeWorkspaceId, filters, loadingMoreTasks, taskPagination, tasks.length]);

  useEffect(() => {
    let alive = true;

    async function load() {
      setLoading(true);
      setError('');
      try {
        await refreshWorkspaces();
      } catch (err) {
        if (alive) setError(err.message);
      } finally {
        if (alive) setLoading(false);
      }
    }

    load();
    return () => {
      alive = false;
    };
  }, [refreshWorkspaces]);

  useEffect(() => {
    let alive = true;

    async function loadDetails() {
      if (!activeWorkspaceId) return;
      setError('');
      try {
        await refreshWorkspaceDetails();
      } catch (err) {
        if (alive) setError(err.message);
      }
    }

    loadDetails();
    return () => {
      alive = false;
    };
  }, [activeWorkspaceId, refreshWorkspaceDetails]);

  const createWorkspace = async (payload) => {
    const workspace = await workspaceApi.create(payload);
    await refreshWorkspaces();
    setActiveWorkspaceId(String(workspace.id));
  };

  const createTask = async (payload) => {
    await taskApi.create({ ...payload, workspace: activeWorkspaceId });
    await refreshWorkspaceDetails();
  };

  const updateTask = async (taskId, payload) => {
    await taskApi.update(taskId, payload);
    await refreshWorkspaceDetails();
  };

  const deleteTask = async (taskId) => {
    await taskApi.remove(taskId);
    await refreshWorkspaceDetails();
  };

  const inviteMember = async (payload) => {
    await workspaceApi.invite(activeWorkspaceId, payload);
    await refreshWorkspaceDetails();
  };

  const removeMember = async (memberId) => {
    await workspaceApi.removeMember(activeWorkspaceId, memberId);
    await refreshWorkspaceDetails();
  };

  const loadComments = async (taskId) => {
    const payload = await commentApi.list(taskId);
    setCommentsByTask((current) => ({ ...current, [taskId]: unwrapList(payload) }));
  };

  const addComment = async (taskId, message) => {
    await commentApi.create({ task: taskId, message });
    await Promise.all([loadComments(taskId), refreshWorkspaceDetails()]);
  };

  return {
    activeWorkspace,
    activeWorkspaceId,
    activities,
    addComment,
    commentsByTask,
    createTask,
    createWorkspace,
    deleteTask,
    error,
    filters,
    inviteMember,
    loadComments,
    loadMoreTasks,
    loading,
    loadingMoreTasks,
    members,
    removeMember,
    setActiveWorkspaceId,
    setFilters,
    tasks,
    taskPagination,
    updateTask,
    workspaces
  };
}
