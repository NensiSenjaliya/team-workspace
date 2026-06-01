import { AuthScreen } from '../features/auth/AuthScreen';

export function AuthPage({ onAuthenticated }) {
  return <AuthScreen onAuthenticated={onAuthenticated} />;
}
