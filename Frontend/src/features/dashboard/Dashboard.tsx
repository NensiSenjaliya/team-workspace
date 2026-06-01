import { ClipboardList, Clock3, FolderKanban, UsersRound } from 'lucide-react';
import { useMemo, useState } from 'react';

import { EmptyState } from '../../components/ui/EmptyState';
import { ActivityPanel } from '../activity/ActivityPanel';
import { TaskBoard } from '../tasks/TaskBoard';
import { MembersPanel } from '../workspaces/MembersPanel';
import { WorkspaceSwitcher } from '../workspaces/WorkspaceSwitcher';

export function Dashboard({ data, user }) {
  const [toast, setToast] = useState('');

  const runAction = async (action) => {
    setToast('');
    try {
      await action();
    } catch (err) {
      setToast(err.message);
    }
  };

  const stats = useMemo(() => {
    const done = data.tasks.filter((task) => task.status === 'done').length;
    const active = data.tasks.filter((task) => task.status !== 'done').length;
    return [
      { label: 'Open tasks', value: active, icon: ClipboardList },
      { label: 'Completed', value: done, icon: FolderKanban },
      { label: 'Members', value: data.members.length, icon: UsersRound },
      { label: 'Activities', value: data.activities.length, icon: Clock3 }
    ];
  }, [data.activities.length, data.members.length, data.tasks]);

  const activeMembership = useMemo(
    () => data.members.find((member) => member.user === user?.id),
    [data.members, user?.id]
  );
  const isWorkspaceAdmin = activeMembership?.role === 'admin';

  if (data.loading) {
    return <main className="content-page"><div className="loading-card">Loading workspace...</div></main>;
  }

  if (data.workspaces.length === 0) {
    return (
      <main className="content-page">
        <WorkspaceSwitcher
          {...data}
          canCreateWorkspace
          createWorkspace={(payload) => runAction(() => data.createWorkspace(payload))}
        />
        <EmptyState
          icon={FolderKanban}
          title="No workspace access yet"
          message="Ask an admin to add you as a member, or create a workspace if you are starting a new team."
        />
        {toast || data.error ? <div className="toast">{toast || data.error}</div> : null}
      </main>
    );
  }

  return (
    <main className="content-page">
      <WorkspaceSwitcher
        activeWorkspaceId={data.activeWorkspaceId}
        canCreateWorkspace={false}
        createWorkspace={(payload) => runAction(() => data.createWorkspace(payload))}
        setActiveWorkspaceId={data.setActiveWorkspaceId}
        workspaces={data.workspaces}
      />

      <section className="hero-strip" id="overview">
        <div>
          <span className="eyebrow">Current workspace</span>
          <h1>{data.activeWorkspace?.name}</h1>
          <p>
            {isWorkspaceAdmin
              ? data.activeWorkspace?.description || 'Admin dashboard for assigning tasks and managing members.'
              : data.activeWorkspace?.description || 'Member dashboard for your assigned work and team activity.'}
          </p>
        </div>
      </section>

      <section className="stats-grid">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div className="stat-card" key={stat.label}>
              <Icon size={20} />
              <span>{stat.label}</span>
              <strong>{stat.value}</strong>
            </div>
          );
        })}
      </section>

      <TaskBoard
        addComment={(taskId, message) => runAction(() => data.addComment(taskId, message))}
        commentsByTask={data.commentsByTask}
        createTask={(payload) => runAction(() => data.createTask(payload))}
        deleteTask={(taskId) => runAction(() => data.deleteTask(taskId))}
        filters={data.filters}
        loadComments={(taskId) => runAction(() => data.loadComments(taskId))}
        loadMoreTasks={() => runAction(() => data.loadMoreTasks())}
        loadingMoreTasks={data.loadingMoreTasks}
        members={data.members}
        setFilters={data.setFilters}
        taskPagination={data.taskPagination}
        tasks={data.tasks}
        updateTask={(taskId, payload) => runAction(() => data.updateTask(taskId, payload))}
        canDeleteTasks={isWorkspaceAdmin}
        isWorkspaceAdmin={isWorkspaceAdmin}
        user={user}
      />

      <div className="lower-grid">
        {isWorkspaceAdmin ? (
          <MembersPanel
            inviteMember={(payload) => runAction(() => data.inviteMember(payload))}
            members={data.members}
            removeMember={(memberId) => runAction(() => data.removeMember(memberId))}
          />
        ) : (
          <section className="panel" id="members">
            <div className="panel-heading">
              <div>
                <span className="eyebrow">Team</span>
                <h2>Workspace members</h2>
              </div>
            </div>
            <div className="member-list">
              {data.members.map((member) => (
                <div className="member-row member-readonly" key={member.id}>
                  <span className="avatar">{member.user_detail?.username?.slice(0, 2).toUpperCase()}</span>
                  <div>
                    <strong>{member.user_detail?.first_name || member.user_detail?.username}</strong>
                    <span>@{member.user_detail?.username}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
        <ActivityPanel activities={data.activities} />
      </div>

      {toast || data.error ? <div className="toast">{toast || data.error}</div> : null}
    </main>
  );
}
