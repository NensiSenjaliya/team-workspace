import { Plus } from 'lucide-react';
import { useState } from 'react';

import { Button } from '../../components/ui/Button';
import { Field } from '../../components/ui/Field';
import { displayName } from '../../lib/formatters';

export function TaskForm({ createTask, members, user, isWorkspaceAdmin, onCreated }) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    status: 'todo',
    priority: 'medium',
    due_date: '',
    assignee: ''
  });

  const update = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const submit = async (event) => {
    event.preventDefault();
    await createTask({
      ...form,
      assignee: isWorkspaceAdmin ? form.assignee || null : user?.id,
      due_date: form.due_date || null
    });
    setForm({
      title: '',
      description: '',
      status: 'todo',
      priority: 'medium',
      due_date: '',
      assignee: ''
    });
    onCreated?.();
  };

  return (
    <form className="task-form" onSubmit={submit}>
      <Field label="Task title">
        <input name="title" value={form.title} onChange={update} required />
      </Field>
      <Field label="Assignee">
        {isWorkspaceAdmin ? (
          <select name="assignee" value={form.assignee} onChange={update}>
            <option value="">Unassigned</option>
            {members.map((member) => (
              <option key={member.user} value={member.user}>{displayName(member.user_detail)}</option>
            ))}
          </select>
        ) : (
          <input value={displayName(user)} disabled />
        )}
      </Field>
      <Field label="Priority">
        <select name="priority" value={form.priority} onChange={update}>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </Field>
      <Field label="Due date">
        <input name="due_date" type="date" value={form.due_date} onChange={update} />
      </Field>
      <Field label="Description">
        <textarea name="description" value={form.description} onChange={update} rows={3} />
      </Field>
      <Button type="submit">
        <Plus size={16} /> Add task
      </Button>
    </form>
  );
}
