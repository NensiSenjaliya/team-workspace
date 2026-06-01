import { classNames } from '../../lib/formatters';

const labels = {
  todo: 'Todo',
  in_progress: 'In progress',
  done: 'Done',
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  admin: 'Admin',
  member: 'Member'
};

export function StatusBadge({ value }) {
  return <span className={classNames('badge', `badge-${value}`)}>{labels[value] || value}</span>;
}
