import { useEffect, useState } from 'react';

import { authApi } from './services/api';
import { clearAuthTokens, getAccessToken } from './services/storage/tokenStorage';
import { AppRoutes } from './routes/AppRoutes';

export default function App() {
  const [user, setUser] = useState<unknown>(null);
  const [booting, setBooting] = useState(Boolean(getAccessToken()));

  useEffect(() => {
    let mounted = true;

    async function restoreSession() {
      if (!getAccessToken()) {
        setBooting(false);
        return;
      }

      try {
        const currentUser = await authApi.me();
        if (mounted) setUser(currentUser);
      } catch {
        clearAuthTokens();
      } finally {
        if (mounted) setBooting(false);
      }
    }

    restoreSession();

    return () => {
      mounted = false;
    };
  }, []);

  function logout() {
    clearAuthTokens();
    setUser(null);
  }

  if (booting) {
    return <div className="boot-screen">Preparing your workspace...</div>;
  }

  return (
    <AppRoutes
      user={user}
      onAuthenticated={setUser}
      onLogout={logout}
    />
  );
}
