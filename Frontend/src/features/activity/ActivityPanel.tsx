import { Activity, CircleDot } from 'lucide-react';

import { EmptyState } from '../../components/ui/EmptyState';
import { formatDateTime } from '../../lib/formatters';

export function ActivityPanel({ activities }) {
  return (
    <section className="panel" id="activity">
      <div className="panel-heading">
        <div>
          <span className="eyebrow">Audit trail</span>
          <h2>Activity</h2>
        </div>
        <Activity size={20} />
      </div>

      <div className="activity-list">
        {activities.length === 0 ? (
          <EmptyState title="No activity yet" message="Workspace actions will be recorded here." />
        ) : activities.map((item) => (
          <div className="activity-row" key={item.id}>
            <CircleDot size={16} />
            <div>
              <strong>{item.description}</strong>
              <span>{formatDateTime(item.created_at)}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
