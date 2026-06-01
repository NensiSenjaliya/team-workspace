import { Plus, Trash2, UserPlus } from 'lucide-react';
import { useState } from 'react';

import { Avatar } from '../../components/ui/Avatar';
import { Button } from '../../components/ui/Button';
import { Field } from '../../components/ui/Field';
import { Modal } from '../../components/ui/Modal';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { displayName } from '../../lib/formatters';

export function MembersPanel({ inviteMember, members, removeMember }) {
  const [showMemberForm, setShowMemberForm] = useState(false);
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: ''
  });

  const submit = async (event) => {
    event.preventDefault();
    await inviteMember(form);
    setForm({
      username: '',
      email: '',
      password: ''
    });
    setShowMemberForm(false);
  };

  return (
    <section className="panel" id="members">
      <div className="panel-heading">
        <div>
          <span className="eyebrow">Team</span>
          <h2>Members</h2>
        </div>
        <Button
          size="sm"
          type="button"
          variant={showMemberForm ? 'secondary' : 'primary'}
          onClick={() => setShowMemberForm((current) => !current)}
        >
          <Plus size={16} />
          Add member
        </Button>
      </div>

      {showMemberForm ? (
        <Modal title="Add member" onClose={() => setShowMemberForm(false)}>
          <form className="member-create-form" onSubmit={submit}>
            <Field label="Username">
              <input
                value={form.username}
                onChange={(event) => setForm((current) => ({ ...current, username: event.target.value }))}
                placeholder="membername"
              />
            </Field>
            <Field label="Email address">
              <input
                value={form.email}
                onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                placeholder="member@company.com"
                type="email"
                required
              />
            </Field>
            <Field label="Password" hint="Required for a new account">
              <input
                value={form.password}
                onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
                type="password"
                minLength={8}
              />
            </Field>
            <Button type="submit" variant="secondary">
              <UserPlus size={16} /> Create member
            </Button>
          </form>
        </Modal>
      ) : null}

      <div className="member-list">
        {members.map((member) => (
          <div className="member-row" key={member.id}>
            <Avatar user={member.user_detail} />
            <div>
              <strong>{displayName(member.user_detail)}</strong>
              <span>@{member.user_detail?.username}</span>
            </div>
            <StatusBadge value={member.role} />
            <button className="icon-btn danger" type="button" aria-label="Remove member" onClick={() => removeMember(member.id)}>
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
