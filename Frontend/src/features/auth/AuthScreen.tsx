import { BriefcaseBusiness, CheckCircle2, Clock3, LockKeyhole, MessageSquare, UserPlus, UsersRound } from 'lucide-react';
import { useState } from 'react';

import { Button } from '../../components/ui/Button';
import { Field } from '../../components/ui/Field';
import { authApi } from '../../services/api';
import { setAuthTokens } from '../../services/storage/tokenStorage';

export function AuthScreen({ onAuthenticated }) {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({
    username: '',
    password: '',
    email: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const update = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (mode === 'register') {
        await authApi.register(form);
        setSuccess('Account created. Sign in to continue.');
        setMode('login');
        setForm((current) => ({ ...current, password: '' }));
        return;
      }

      const tokens = await authApi.login({
        email: form.email,
        password: form.password
      });
      setAuthTokens(tokens);
      const user = await authApi.me();
      onAuthenticated(user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-stage">
        <div className="auth-panel">
          <div className="auth-visual" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>

          <div className="auth-left">
            <div className="brand-lockup">
              <div className="brand-mark">
                <BriefcaseBusiness size={25} />
              </div>
              <div>
                <strong>Team Workspace</strong>
                <span>Task collaboration system</span>
              </div>
            </div>

            <div className="auth-copy">
              <span className="auth-kicker">Workspace operating system</span>
              <h1>Plan, assign, and track team work.</h1>
              <p>Manage tickets, members, comments, and activity history inside one secure workspace.</p>
            </div>

            <div className="auth-feature-grid">
              <span><UsersRound size={18} /> Role based members</span>
              <span><MessageSquare size={18} /> Task comments</span>
              <span><Clock3 size={18} /> Activity timeline</span>
              <span><CheckCircle2 size={18} /> Private workspaces</span>
            </div>
          </div>

          <section className="auth-card" aria-label="Authentication form">
            <div className="auth-card-heading">
              <span className="eyebrow">{mode === 'login' ? 'Welcome back' : 'Create access'}</span>
              <h2>{mode === 'login' ? 'Sign in to your workspace' : 'Register your account'}</h2>
              <p>{mode === 'login' ? 'Use your email and password to continue.' : 'Create an account, then sign in to continue.'}</p>
            </div>

            <div className="segmented">
              <button className={mode === 'login' ? 'active' : ''} onClick={() => setMode('login')} type="button">
                <LockKeyhole size={16} /> Sign in
              </button>
              <button className={mode === 'register' ? 'active' : ''} onClick={() => setMode('register')} type="button">
                <UserPlus size={16} /> Register
              </button>
            </div>

            <form onSubmit={submit} className="auth-form">
              {mode === 'register' ? (
                <Field label="Username">
                  <input name="username" value={form.username} onChange={update} autoComplete="username" required />
                </Field>
              ) : null}

              <Field label="Email">
                <input
                  name="email"
                  value={form.email}
                  onChange={update}
                  type="email"
                  autoComplete="email"
                  required
                />
              </Field>

              <Field label="Password" hint={mode === 'register' ? 'Minimum 8 characters' : ''}>
                <input
                  name="password"
                  value={form.password}
                  onChange={update}
                  type="password"
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  required
                />
              </Field>

              {error ? <div className="form-error">{error}</div> : null}
              {success ? <div className="form-success">{success}</div> : null}

              <Button type="submit" disabled={loading}>
                {loading ? 'Please wait...' : mode === 'login' ? 'Sign in' : 'Create account'}
              </Button>
            </form>
          </section>
        </div>
      </section>
    </main>
  );
}
