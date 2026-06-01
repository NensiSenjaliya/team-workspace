import { AppShell } from '../components/layout/AppShell';
import { Dashboard } from '../features/dashboard/Dashboard';
import { useWorkspaceData } from '../hooks/useWorkspaceData';

export function WorkspacePage({ user, onLogout }) {
  const data = useWorkspaceData();
  const activeMembership = data.members.find((member) => member.user === user?.id);

  return (
    <AppShell user={user} role={activeMembership?.role} onLogout={onLogout}>
      <Dashboard data={data} user={user} />
    </AppShell>
  );
}
