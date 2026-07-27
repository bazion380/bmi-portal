import React from 'react';
import { useAuth } from '../context/AuthContext';

interface TopbarProps {
  title: string;
}

export const Topbar: React.FC<TopbarProps> = ({ title }) => {
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  return (
    <header className="topbar">
      <div className="topbar-title">{title}</div>
      <div className="topbar-right">
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{dateStr}</span>
        <button className="icon-btn" title="Notifications">🔔</button>
      </div>
    </header>
  );
};
