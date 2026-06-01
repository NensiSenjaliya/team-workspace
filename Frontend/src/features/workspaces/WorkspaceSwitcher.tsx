import { Plus } from 'lucide-react';
import { useState } from 'react';

import { Button } from '../../components/ui/Button';
import { Field } from '../../components/ui/Field';
import { Modal } from '../../components/ui/Modal';

export function WorkspaceSwitcher({
  activeWorkspaceId,
  canCreateWorkspace = true,
  createWorkspace,
  setActiveWorkspaceId,
  workspaces
}) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', description: '' });

  const submit = async (event) => {
    event.preventDefault();
    await createWorkspace(form);
    setForm({ name: '', description: '' });
    setOpen(false);
  };

  return (
    <section className="toolbar-card">
      <div className="workspace-select">
        <span>Workspace</span>
        <select value={activeWorkspaceId} onChange={(event) => setActiveWorkspaceId(event.target.value)} disabled={workspaces.length === 0}>
          {workspaces.map((workspace) => (
            <option key={workspace.id} value={workspace.id}>{workspace.name}</option>
          ))}
        </select>
      </div>
      {canCreateWorkspace ? (
        <Button variant="secondary" onClick={() => setOpen((value) => !value)}>
          <Plus size={16} /> New
        </Button>
      ) : null}

      {open && canCreateWorkspace ? (
        <Modal title="Add workspace" onClose={() => setOpen(false)}>
          <form className="inline-form full" onSubmit={submit}>
            <Field label="Workspace name">
              <input
                value={form.name}
                onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                required
              />
            </Field>
            <Field label="Description">
              <input
                value={form.description}
                onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
              />
            </Field>
            <Button type="submit">Create workspace</Button>
          </form>
        </Modal>
      ) : null}
    </section>
  );
}
