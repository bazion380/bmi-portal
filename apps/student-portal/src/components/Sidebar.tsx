import React from 'react';
import { useAuth } from '../context/AuthContext';

type Page = 'dashboard' | 'grades' | 'registration' | 'finance' | 'library' | 'notifications' | 'profile';

interface SidebarProps {
  activePage: Page;
  onNavigate: (page: Page) => void;
}

const NAV_ITEMS: { id: Page; label: string; icon: string; section?: string }[] = [
  { id: 'dashboard',    label: 'Dashboard',       icon: '⬛', section: 'Main' },
  { id: 'grades',       label: 'My Grades',       icon: '📊', section: 'Academic' },
  { id: 'registration', label: 'Course Registration', icon: '📚' },
  { id: 'finance',      label: 'Finance & Fees',  icon: '💳', section: 'Services' },
  { id: 'library',      label: 'Library',         icon: '📖' },
  { id: 'notifications',label: 'Notifications',   icon: '🔔', section: 'Account' },
  { id: 'profile',      label: 'My Profile',      icon: '👤' },
];

export const Sidebar: React.FC<SidebarProps> = ({ activePage, onNavigate }) => {
  const { user, logout } = useAuth();
  const initials = user?.name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) ?? 'ST';
  let currentSection = '';

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-mark">BMI</div>
        <div className="sidebar-logo-text">
          <strong>BMI UMS</strong>
          <span>Student Portal</span>
        </div>
      </div>
      <nav className="sidebar-nav">
        {NAV_ITEMS.map((item) => {
          const showSection = item.section && item.section !== currentSection;
          if (item.section) currentSection = item.section;
          return (
            <React.Fragment key={item.id}>
              {showSection && <div className="nav-section-label">{item.section}</div>}
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
      <div className="sidebar-footer">
        <div className="user-pill">
          <div className="user-avatar">{initials}</div>
          <div className="user-info">
            <div className="user-name">{user?.name ?? 'Student'}</div>
            <div className="user-role">{user?.studentId ?? ''}</div>
          </div>
          <button onClick={logout} title="Sign out"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '1rem' }}
          >↩</button>
        </div>
      </div>
    </aside>
  );
};

export type { Page };
