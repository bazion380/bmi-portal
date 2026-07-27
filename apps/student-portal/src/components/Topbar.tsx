import React from 'react';

interface TopbarProps {
  title: string;
  onNotifClick: () => void;
  notifCount: number;
}

export const Topbar: React.FC<TopbarProps> = ({ title, onNotifClick, notifCount }) => {
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <header className="topbar">
      <div>
        <div className="topbar-title">{title}</div>
        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '1px' }}>{dateStr}</div>
      </div>
      <div className="topbar-actions">
        <button
          id="topbar-notif-btn"
          className="icon-btn"
          onClick={onNotifClick}
          title="Notifications"
          aria-label="View notifications"
        >
          🔔
          {notifCount > 0 && <span className="notif-badge" aria-label={`${notifCount} unread`} />}
        </button>
      </div>
    </header>
  );
};
