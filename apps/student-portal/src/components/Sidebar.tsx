import React from 'react';
import { useAuth } from '../context/AuthContext';

type Page = 'dashboard' | 'grades' | 'registration' | 'finance' | 'library' | 'notifications' | 'profile';

interface SidebarProps {
  activePage: Page;
  onNavigate: (page: Page) => void;
}

const navItems: { id: Page; label: string; icon: string; section?: string }[] = [
  { id: 'dashboard',     label: 'Dashboard',     icon: '⬛', section: 'Main' },
  { id: 'grades',        label: 'Grades',         icon: '📊' },
  { id: 'registration',  label: 'Registration',   icon: '📋' },
  { id: 'finance',       label: 'Finance & Fees', icon: '💳' },
  { id: 'library',       label: 'Library',        icon: '📚', section: 'Services' },
  { id: 'notifications', label: 'Notifications',  icon: '🔔' },
  { id: 'profile',       label: 'My Profile',     icon: '👤', section: 'Account' },
];

export const Sidebar: React.FC<SidebarProps> = ({ activePage, onNavigate }) => {
  const { user, logout } = useAuth();

  const initials = user?.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) ?? 'ST';

  let currentSection = '';

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-mark">BMI</div>
        <div className="sidebar-logo-text">
          <strong>BMI Portal</strong>
          <span>Student Access</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const showSection = item.section && item.section !== currentSection;
          if (item.section) currentSection = item.section;

          return (
            <React.Fragment key={item.id}>
              {showSection && (
                <div className="nav-section-label">{item.section}</div>
              )}
              <button
                className={`nav-item ${activePage === item.id ? 'active' : ''}`}
                onClick={() => onNavigate(item.id)}
              >
                <span className="nav-icon">{item.icon}</span>
                {item.label}
              </button>
            </React.Fragment>
          );
        })}
      </nav>

      {/* User Footer */}
      <div className="sidebar-footer">
        <div className="user-pill">
          <div className="user-avatar">{initials}</div>
          <div className="user-info">
            <div className="user-name">{user?.name ?? 'Student'}</div>
            <div className="user-role">{user?.studentId ?? 'ID: —'}</div>
          </div>
          <button
            onClick={logout}
            title="Sign out"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '1rem', padding: '2px 4px' }}
          >
            ↩
          </button>
        </div>
      </div>
    </aside>
  );
};
