type EmptyStateProps = {
  icon?: any;
  title: string;
  message: string;
  action?: React.ReactNode;
};

export function EmptyState({ icon: Icon, title, message, action }: EmptyStateProps) {
  return (
    <div className="empty-state">
      {Icon ? <Icon size={28} /> : null}
      <h3>{title}</h3>
      <p>{message}</p>
      {action}
    </div>
  );
}
