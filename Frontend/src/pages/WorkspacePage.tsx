import { AppShell } from '../components/layout/AppShell';
import { Dashboard } from '../features/dashboard/Dashboard';
import { useWorkspaceData } from '../hooks/useWorkspaceData';

export function WorkspacePage({ user, onLogout }) {
  const data = useWorkspaceData();

  return (
    <AppShell user={user} onLogout={onLogout}>
      <Dashboard data={data} user={user} />
    </AppShell>
  );
}
