import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Sidebar, Page } from './components/Sidebar';
import { Topbar } from './components/Topbar';
import { DashboardView } from './views/DashboardView';
import { GradesView } from './views/GradesView';
import { RegistrationView } from './views/RegistrationView';
import { signInWithPassword } from './lib/neonAuth';

const PAGE_TITLES: Record<Page, string> = {
  dashboard:    'Dashboard',
  grades:       'My Grades',
  registration: 'Course Registration',
  finance:      'Finance & Fees',
  library:      'Library',
  notifications:'Notifications',
  profile:      'My Profile',
};

const PlaceholderView: React.FC<{ page: Page }> = ({ page }) => (
  <div>
    <div className="page-header fade-up"><h1>{PAGE_TITLES[page]}</h1></div>
    <div className="card fade-up fade-up-delay-1" style={{ textAlign: 'center', padding: '48px' }}>
      <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🚧</div>
      <p style={{ color: 'var(--text-muted)' }}>
        The <strong style={{ color: 'var(--text-primary)' }}>{PAGE_TITLES[page]}</strong> module is coming soon.
      </p>
    </div>
  </div>
);

const LoginScreen: React.FC = () => {
  const { login } = useAuth();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const authResponse = await signInWithPassword(email, password);
      login(authResponse.access_token, {
        id:        authResponse.user.id,
        name:      authResponse.user.user_metadata?.full_name ?? authResponse.user.email,
        role:      authResponse.user.user_metadata?.role ?? 'student',
        studentId: authResponse.user.user_metadata?.student_id ?? '—',
        program:   authResponse.user.user_metadata?.program ?? '—',
      });
    } catch (e: any) {
      setError(e.message ?? 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg-base)',
      backgroundImage: 'radial-gradient(ellipse at 50% 0%, rgba(99,102,241,0.15) 0%, transparent 60%)',
      padding: '24px',
    }}>
      <div className="login-card fade-up">
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            width: '52px', height: '52px',
            background: 'linear-gradient(135deg, var(--brand), #818cf8)',
            borderRadius: '14px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.3rem', fontWeight: 800, color: 'white',
            boxShadow: '0 0 28px rgba(99,102,241,0.4)', marginBottom: '14px',
          }}>BMI</div>
          <h2 style={{ fontSize: '1.2rem', marginBottom: '4px' }}>Welcome back</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>Sign in to the BMI Student Portal</p>
        </div>
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div className="form-group">
            <label className="form-label">University Email</label>
            <input id="student-email" type="email" className="form-input"
              value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="student@bmi.edu.gh" required />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input id="student-password" type="password" className="form-input"
              value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••" required />
          </div>
          {error && (
            <div className="alert alert-danger" style={{ margin: 0, padding: '10px 14px', fontSize: '0.8rem' }}>{error}</div>
          )}
          <button id="student-login-submit" type="submit" className="btn btn-primary"
            disabled={loading}
            style={{ width: '100%', justifyContent: 'center', padding: '11px', marginTop: '4px' }}>
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
};

const AppShell: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [activePage, setActivePage] = useState<Page>('dashboard');

  if (!isAuthenticated) return <LoginScreen />;

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
        <Topbar title={PAGE_TITLES[activePage]} />
        <main className="page-content">{renderPage()}</main>
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
