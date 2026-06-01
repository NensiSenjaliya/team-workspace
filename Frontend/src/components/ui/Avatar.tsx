import { initials } from '../../lib/formatters';

export function Avatar({ user, label }: { user?: any; label?: string }) {
  return (
    <span className="avatar" title={label || user?.username}>
      {initials(user)}
    </span>
  );
}
