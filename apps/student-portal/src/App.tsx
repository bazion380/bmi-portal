import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Sidebar } from './components/Sidebar';
import { Topbar } from './components/Topbar';
import { DashboardView } from './views/DashboardView';
import { GradesView } from './views/GradesView';
import { RegistrationView } from './views/RegistrationView';
import { signInWithPassword } from './lib/neonAuth';

type Page = 'dashboard' | 'grades' | 'registration' | 'finance' | 'library' | 'notifications' | 'profile';

const PAGE_TITLES: Record<Page, string> = {
  dashboard: 'Dashboard',
  grades: 'Grades & Transcript',
  registration: 'Course Registration',
  finance: 'Finance & Fees',
  library: 'Library',
  notifications: 'Notifications',
  profile: 'My Profile',
};

// Placeholder for views not yet built
const PlaceholderView: React.FC<{ page: Page }> = ({ page }) => (
  <div>
    <div className="page-header fade-up">
      <h1>{PAGE_TITLES[page]}</h1>
      <p>This module is under construction.</p>
    </div>
    <div className="card fade-up fade-up-delay-1" style={{ textAlign: 'center', padding: '60px' }}>
      <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🚧</div>
      <p style={{ color: 'var(--text-muted)' }}>
        The <strong style={{ color: 'var(--text-primary)' }}>{PAGE_TITLES[page]}</strong> view is coming soon.
      </p>
    </div>
  </div>
);

// Login Screen
const LoginScreen: React.FC = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // ── Real Neon Auth call ──────────────────────────────────────────────
      // signInWithPassword uses your VITE_NEON_AUTH_URL env variable.
      // If that variable is not set, it falls back to a dev mock automatically.
      const authResponse = await signInWithPassword(email, password);

      login(authResponse.access_token, {
        id: authResponse.user.id,
        name: authResponse.user.user_metadata?.full_name ?? authResponse.user.email,
        role: authResponse.user.user_metadata?.role ?? 'student',
        studentId: authResponse.user.user_metadata?.student_id ?? '—',
        program: authResponse.user.user_metadata?.program ?? '—',
      });
    } catch (e: any) {
      setError(e.message ?? 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-base)',
      backgroundImage: 'radial-gradient(ellipse at 50% 0%, rgba(99,102,241,0.15) 0%, transparent 60%)',
      padding: '24px',
    }}>
      <div className="card fade-up" style={{ width: '100%', maxWidth: '400px' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '56px', height: '56px',
            background: 'linear-gradient(135deg, var(--brand), #818cf8)',
            borderRadius: '16px',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.5rem',
            fontWeight: 700,
            color: 'white',
            boxShadow: '0 0 32px rgba(99,102,241,0.4)',
            marginBottom: '16px',
          }}>BMI</div>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '4px' }}>Welcome back</h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: 0 }}>
            Sign in to the BMI Student Portal
          </p>
        </div>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
              University Email
            </label>
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="student@bmi.edu.gh"
              required
              style={{
                width: '100%', padding: '10px 14px',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text-primary)',
                fontSize: '0.9rem',
                outline: 'none',
                fontFamily: 'inherit',
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
              Password
            </label>
            <input
              id="login-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              style={{
                width: '100%', padding: '10px 14px',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text-primary)',
                fontSize: '0.9rem',
                outline: 'none',
                fontFamily: 'inherit',
              }}
            />
          </div>

          {error && (
            <div className="alert alert-danger" style={{ margin: 0, padding: '10px 14px', fontSize: '0.8rem' }}>
              {error}
            </div>
          )}

          <button
            id="login-submit"
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: '100%', justifyContent: 'center', padding: '11px' }}
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
};

// Main App Shell
const AppShell: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [activePage, setActivePage] = useState<Page>('dashboard');

  if (!isAuthenticated) return <LoginScreen />;

  const unreadCount = 0; // TODO: wire from global state / polling hook

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':    return <DashboardView />;
      case 'grades':       return <GradesView />;
      case 'registration': return <RegistrationView />;
      default:             return <PlaceholderView page={activePage} />;
    }
  };

  return (
    <div className="app-shell">
      <Sidebar activePage={activePage} onNavigate={setActivePage} />
      <div className="main-content">
        <Topbar
          title={PAGE_TITLES[activePage]}
          onNotifClick={() => setActivePage('notifications')}
          notifCount={unreadCount}
        />
        <main className="page-content">
          {renderPage()}
        </main>
      </div>
    </div>
  );
};

const App: React.FC = () => (
  <AuthProvider>
    <AppShell />
  </AuthProvider>
);

export default App;
