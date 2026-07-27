import React, { useState } from 'react';
import './index.css';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Sidebar, Page } from './components/Sidebar';
import { Topbar } from './components/Topbar';
import { OverviewView } from './views/OverviewView';
import { HRStaffView, HRLeaveView } from './views/HRViews';
import { LibraryView } from './views/LibraryView';
import { AlumniView, CampusView } from './views/AlumniCampusViews';

// ── Page titles ──────────────────────────────────────────────────────────────
const PAGE_TITLES: Record<Page, string> = {
  overview:      'Dashboard Overview',
  admissions:    'Admissions Pipeline',
  students:      'Student Records',
  courses:       'Courses & Offerings',
  grades:        'Grades Management',
  finance:       'Finance & Fees',
  'hr-staff':    'Staff Records',
  'hr-leave':    'Leave Requests',
  library:       'Library Management',
  alumni:        'Alumni Management',
  campus:        'Campus Services',
  notifications: 'Notifications',
};

const PAGE_SUBTITLES: Record<Page, string> = {
  overview:      'A consolidated view of all active BMI modules',
  admissions:    'Review and process incoming applications',
  students:      'View enrolled, graduated, and withdrawn students',
  courses:       'Manage course catalog and term offerings',
  grades:        'Review and submit student grade records',
  finance:       'Manage fee structures, invoices and financial holds',
  'hr-staff':    'Staff employment records across all departments',
  'hr-leave':    'Review and approve staff leave applications',
  library:       'Catalog, borrowings, and fine management',
  alumni:        'Alumni profiles, events, and donations',
  campus:        'Hostel allocations and transport management',
  notifications: 'System-wide notifications and announcements',
};

// ── Placeholder for views not yet built ─────────────────────────────────────
const PlaceholderView: React.FC<{ page: Page }> = ({ page }) => (
  <div>
    <div className="page-header fade-up">
      <h1>{PAGE_TITLES[page]}</h1>
      <p>{PAGE_SUBTITLES[page]}</p>
    </div>
    <div className="card fade-up fade-up-delay-1" style={{ textAlign: 'center', padding: '56px' }}>
      <div style={{ fontSize: '2.8rem', marginBottom: '14px' }}>🚧</div>
      <p style={{ color: 'var(--text-muted)' }}>
        The <strong style={{ color: 'var(--text-primary)' }}>{PAGE_TITLES[page]}</strong> module is under active development.
      </p>
    </div>
  </div>
);

// ── Login Screen ─────────────────────────────────────────────────────────────
const DEMO_ROLES = [
  { role: 'president',          label: 'President (All Access)' },
  { role: 'registrar',          label: 'Registrar' },
  { role: 'admissions_officer', label: 'Admissions Officer' },
  { role: 'finance_officer',    label: 'Finance Officer' },
  { role: 'hr_manager',         label: 'HR Manager' },
  { role: 'librarian',          label: 'Librarian' },
  { role: 'alumni_officer',     label: 'Alumni Officer' },
  { role: 'lecturer',           label: 'Lecturer' },
];

const LoginScreen: React.FC = () => {
  const { login } = useAuth();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole]         = useState('president');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    // Simulate Neon Auth — swap with real call when VITE_NEON_AUTH_URL is set
    await new Promise((r) => setTimeout(r, 500));
    if (!email || !password) {
      setError('Please enter your email and password.');
      setLoading(false);
      return;
    }
    login('admin-mock-jwt', {
      id: 'admin-001',
      name: 'Dr. Kwesi Antwi',
      email,
      role,
    });
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-base)',
      backgroundImage: 'radial-gradient(ellipse at 30% 0%, rgba(124,58,237,0.18) 0%, transparent 55%)',
      padding: '24px',
    }}>
      <div className="card fade-up" style={{ width: '100%', maxWidth: '420px' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '52px', height: '52px',
            background: 'linear-gradient(135deg, var(--brand), var(--brand-bright))',
            borderRadius: '14px',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.4rem', fontWeight: 800, color: 'white',
            boxShadow: '0 0 28px rgba(124,58,237,0.45)',
            marginBottom: '14px',
          }}>BMI</div>
          <h2 style={{ fontSize: '1.2rem', marginBottom: '4px' }}>Admin Portal</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
            Staff &amp; administrator access only
          </p>
        </div>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div className="form-group">
            <label className="form-label">University Email</label>
            <input id="admin-email" type="email" className="form-input"
              value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@bmi.edu.gh" required />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input id="admin-password" type="password" className="form-input"
              value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••" required />
          </div>

          {/* Role selector — for dev/demo only. Remove when Neon Auth is live */}
          <div className="form-group">
            <label className="form-label">Role <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(dev only — set via Neon Auth in production)</span></label>
            <select id="admin-role" className="form-input" value={role} onChange={(e) => setRole(e.target.value)}>
              {DEMO_ROLES.map((r) => (
                <option key={r.role} value={r.role}>{r.label}</option>
              ))}
            </select>
          </div>

          {error && (
            <div className="alert alert-danger" style={{ margin: 0, padding: '10px 14px', fontSize: '0.8rem' }}>
              {error}
            </div>
          )}

          <button id="admin-login-submit" type="submit" className="btn btn-primary"
            disabled={loading}
            style={{ width: '100%', justifyContent: 'center', padding: '11px', marginTop: '4px' }}
          >
            {loading ? 'Signing in…' : 'Sign In to Admin Portal'}
          </button>
        </form>
      </div>
    </div>
  );
};

// ── App Shell ────────────────────────────────────────────────────────────────
const AppShell: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [activePage, setActivePage] = useState<Page>('overview');

  if (!isAuthenticated) return <LoginScreen />;

  const renderPage = () => {
    switch (activePage) {
      case 'overview':   return <OverviewView />;
      case 'hr-staff':   return <HRStaffView />;
      case 'hr-leave':   return <HRLeaveView />;
      case 'library':    return <LibraryView />;
      case 'alumni':     return <AlumniView />;
      case 'campus':     return <CampusView />;
      default:           return <PlaceholderView page={activePage} />;
    }
  };

  return (
    <div className="app-shell">
      <Sidebar activePage={activePage} onNavigate={setActivePage} />
      <div className="main-content">
        <Topbar title={PAGE_TITLES[activePage]} subtitle={PAGE_SUBTITLES[activePage]} />
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
