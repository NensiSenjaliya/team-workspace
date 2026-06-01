import { ArrowDownUp, Search } from 'lucide-react';

import { Field } from '../../components/ui/Field';

export function TaskFilters({ filters, setFilters }) {
  const update = (key, value) => setFilters((current) => ({ ...current, [key]: value }));

  return (
    <div className="filters">
      <label className="search-control">
        <Search size={17} />
        <input value={filters.search} onChange={(event) => update('search', event.target.value)} placeholder="Search tasks" />
      </label>

      <Field label="Status">
        <select value={filters.status} onChange={(event) => update('status', event.target.value)}>
          <option value="">All</option>
          <option value="todo">Todo</option>
          <option value="in_progress">In progress</option>
          <option value="done">Done</option>
        </select>
      </Field>

      <Field label="Priority">
        <select value={filters.priority} onChange={(event) => update('priority', event.target.value)}>
          <option value="">All</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </Field>

      <Field label="Sort">
        <span className="select-with-icon">
          <ArrowDownUp size={16} />
          <select value={filters.ordering} onChange={(event) => update('ordering', event.target.value)}>
            <option value="-created_at">Newest</option>
            <option value="due_date">Due date</option>
            <option value="priority">Priority</option>
            <option value="status">Status</option>
          </select>
        </span>
      </Field>
    </div>
  );
}
