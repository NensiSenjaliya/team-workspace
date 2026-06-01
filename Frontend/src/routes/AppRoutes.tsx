import { AuthPage } from '../pages/AuthPage';
import { WorkspacePage } from '../pages/WorkspacePage';

type AppRoutesProps = {
  user: unknown;
  onAuthenticated: (user: unknown) => void;
  onLogout: () => void;
};

export function AppRoutes({ user, onAuthenticated, onLogout }: AppRoutesProps) {
  if (!user) {
    return <AuthPage onAuthenticated={onAuthenticated} />;
  }

  return <WorkspacePage user={user} onLogout={onLogout} />;
}
