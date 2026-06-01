import { CalendarDays, MessageSquare, Pencil, Plus, Save, Ticket, Trash2, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { Avatar } from '../../components/ui/Avatar';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { Modal } from '../../components/ui/Modal';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { displayName, formatDate } from '../../lib/formatters';
import { TaskFilters } from './TaskFilters';
import { TaskForm } from './TaskForm';

const columns = [
  { key: 'todo', title: 'Todo' },
  { key: 'in_progress', title: 'In progress' },
  { key: 'done', title: 'Done' }
];

export function TaskBoard({
  addComment,
  commentsByTask,
  createTask,
  deleteTask,
  filters,
  loadComments,
  loadMoreTasks,
  loadingMoreTasks,
  members,
  setFilters,
  taskPagination,
  tasks,
  updateTask,
  canDeleteTasks = false,
  isWorkspaceAdmin = false,
  user
}) {
  const [openTaskId, setOpenTaskId] = useState(null);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editDraft, setEditDraft] = useState({ title: '', description: '', due_date: '', assignee: '' });
  const [commentDrafts, setCommentDrafts] = useState({});
  const loadMoreRef = useRef(null);
  const editingTask = tasks.find((task) => task.id === editingTaskId);

  const toggleComments = async (taskId) => {
    const next = openTaskId === taskId ? null : taskId;
    setOpenTaskId(next);
    if (next && !commentsByTask[taskId]) {
      await loadComments(taskId);
    }
  };

  const submitComment = async (event, taskId) => {
    event.preventDefault();
    const message = commentDrafts[taskId]?.trim();
    if (!message) return;
    await addComment(taskId, message);
    setCommentDrafts((current) => ({ ...current, [taskId]: '' }));
  };

  const startEdit = (task) => {
    setEditingTaskId(task.id);
    setEditDraft({
      title: task.title,
      description: task.description || '',
      due_date: task.due_date || '',
      assignee: task.assignee || ''
    });
  };

  const cancelEdit = () => {
    setEditingTaskId(null);
    setEditDraft({ title: '', description: '', due_date: '', assignee: '' });
  };

  const submitEdit = async (event, taskId) => {
    event.preventDefault();
    const payload: any = {
      title: editDraft.title,
      description: editDraft.description,
      due_date: editDraft.due_date || null
    };

    if (isWorkspaceAdmin) {
      payload.assignee = editDraft.assignee || null;
    }

    await updateTask(taskId, payload);
    cancelEdit();
  };

  useEffect(() => {
    const node = loadMoreRef.current;
    if (!node || !taskPagination?.next) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          loadMoreTasks();
        }
      },
      { rootMargin: '220px' }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [loadMoreTasks, taskPagination?.next]);

  return (
    <section className="tasks-section" id="tasks">
      <div className="panel-heading">
        <div>
          <span className="eyebrow">Execution</span>
          <h2>Task board</h2>
        </div>
        <Button
          size="sm"
          type="button"
          variant={showTaskForm ? 'secondary' : 'primary'}
          onClick={() => setShowTaskForm((current) => !current)}
        >
          <Plus size={16} />
          Add task
        </Button>
      </div>

      <TaskFilters filters={filters} setFilters={setFilters} />

      {showTaskForm ? (
        <Modal title="Add task" onClose={() => setShowTaskForm(false)}>
          <TaskForm
            createTask={createTask}
            isWorkspaceAdmin={isWorkspaceAdmin}
            members={members}
            onCreated={() => setShowTaskForm(false)}
            user={user}
          />
        </Modal>
      ) : null}

      <div className="task-workspace task-workspace-full">
        <div className="kanban">
          {columns.map((column) => {
            const columnTasks = tasks.filter((task) => task.status === column.key);
            return (
              <div className="kanban-column" key={column.key}>
                <div className="column-heading">
                  <h3>{column.title}</h3>
                  <span>{columnTasks.length}</span>
                </div>

                {columnTasks.length === 0 ? (
                  <EmptyState title="No tasks" message="Tasks in this stage will appear here." />
                ) : columnTasks.map((task) => {
                  const canChangeStatus = (
                    isWorkspaceAdmin
                    || task.created_by === user?.id
                    || task.assignee === user?.id
                  );
                  const canEditDetails = isWorkspaceAdmin || task.created_by === user?.id;
                  return (
                    <article className="task-card" key={task.id}>
                      <div className="ticket-head">
                        <span className="ticket-key"><Ticket size={15} /> TASK-{task.id}</span>
                        <select
                          value={task.status}
                          onChange={(event) => updateTask(task.id, { status: event.target.value })}
                          disabled={!canChangeStatus}
                        >
                          <option value="todo">Todo</option>
                          <option value="in_progress">In progress</option>
                          <option value="done">Done</option>
                        </select>
                      </div>

                      <h4>{task.title}</h4>
                      {task.description ? <p>{task.description}</p> : null}

                      <div className="ticket-row">
                        <StatusBadge value={task.priority} />
                        <span><CalendarDays size={15} /> {formatDate(task.due_date)}</span>
                      </div>
                      <div className="ticket-footer">
                        <span>
                          {task.assignee_detail ? <Avatar user={task.assignee_detail} /> : <span className="avatar muted">--</span>}
                          {task.assignee_detail ? displayName(task.assignee_detail) : 'Unassigned'}
                        </span>
                        <div className="task-actions">
                          {canEditDetails ? (
                            <button className="icon-text" type="button" onClick={() => startEdit(task)}>
                              <Pencil size={16} /> Edit
                            </button>
                          ) : null}
                          <button className="icon-text" type="button" onClick={() => toggleComments(task.id)}>
                            <MessageSquare size={16} /> Comments
                          </button>
                          {canDeleteTasks ? (
                            <button className="icon-btn danger" type="button" aria-label="Delete task" onClick={() => deleteTask(task.id)}>
                              <Trash2 size={16} />
                            </button>
                          ) : null}
                        </div>
                      </div>

                      {openTaskId === task.id ? (
                        <div className="comments-box">
                          {(commentsByTask[task.id] || []).map((comment) => (
                            <div className="comment" key={comment.id}>
                              <Avatar user={comment.user_detail} />
                              <p><strong>{displayName(comment.user_detail)}</strong>{comment.message}</p>
                            </div>
                          ))}
                          <form onSubmit={(event) => submitComment(event, task.id)}>
                            <input
                              value={commentDrafts[task.id] || ''}
                              onChange={(event) => setCommentDrafts((current) => ({ ...current, [task.id]: event.target.value }))}
                              placeholder="Add a comment"
                            />
                            <Button size="sm" type="submit">Send</Button>
                          </form>
                        </div>
                      ) : null}
                    </article>
                  );
                })}
              </div>
            );
          })}
        </div>

        {editingTask ? (
          <Modal title={`Edit TASK-${editingTask.id}`} onClose={cancelEdit}>
            <form className="task-edit-form" onSubmit={(event) => submitEdit(event, editingTask.id)}>
              <input
                value={editDraft.title}
                onChange={(event) => setEditDraft((current) => ({ ...current, title: event.target.value }))}
                required
              />
              <textarea
                value={editDraft.description}
                onChange={(event) => setEditDraft((current) => ({ ...current, description: event.target.value }))}
                rows={3}
              />
              <input
                type="date"
                value={editDraft.due_date}
                onChange={(event) => setEditDraft((current) => ({ ...current, due_date: event.target.value }))}
              />
              {isWorkspaceAdmin ? (
                <select
                  value={editDraft.assignee}
                  onChange={(event) => setEditDraft((current) => ({ ...current, assignee: event.target.value }))}
                >
                  <option value="">Unassigned</option>
                  {members.map((member) => (
                    <option key={member.user} value={member.user}>{displayName(member.user_detail)}</option>
                  ))}
                </select>
              ) : null}
              <div className="task-edit-actions">
                <Button size="sm" type="submit"><Save size={15} /> Save</Button>
                <Button size="sm" type="button" variant="secondary" onClick={cancelEdit}>
                  <X size={15} /> Cancel
                </Button>
              </div>
            </form>
          </Modal>
        ) : null}

        <div className="load-more-sentinel" ref={loadMoreRef}>
          {loadingMoreTasks ? 'Loading more tasks...' : taskPagination?.next ? 'Scroll to load more tasks' : `${tasks.length} of ${taskPagination?.count || tasks.length} tasks loaded`}
        </div>
      </div>
    </section>
  );
}
