import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api, Grade, FinancialHold, Notification } from '../lib/api';

export const DashboardView: React.FC = () => {
  const { user } = useAuth();
  const [grades, setGrades] = useState<Grade[]>([]);
  const [holds, setHolds] = useState<FinancialHold[]>([]);
  const [notifs, setNotifs] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([api.getGrades(), api.getHolds(), api.getNotifications()])
      .then(([g, h, n]) => {
        if (g.status === 'fulfilled') setGrades(g.value);
        if (h.status === 'fulfilled') setHolds(h.value);
        if (n.status === 'fulfilled') setNotifs(n.value);
      }).finally(() => setLoading(false));
  }, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const gpa = grades.length
    ? (grades.reduce((s, g) => s + (parseFloat(g.grade ?? '0') / 25), 0) / grades.length).toFixed(2)
    : 'N/A';
  const unread = notifs.filter((n) => !n.isRead).length;

  return (
    <div>
      <div className="page-header fade-up">
        <h1>{greeting}, {user?.name?.split(' ')[0] ?? 'Student'} 👋</h1>
        <p>Here's a snapshot of your academic progress.</p>
      </div>

      {holds.length > 0 && (
        <div className="alert alert-danger fade-up">
          ⚠️ You have {holds.length} active financial hold(s). Course registration is blocked.
        </div>
      )}

      <div className="stat-grid fade-up fade-up-delay-1">
        <div className="stat-card"><div className="stat-icon indigo">📊</div><div className="stat-body"><div className="stat-label">Cumulative GPA</div><div className="stat-value">{loading ? '…' : gpa}</div><div className="stat-sub">Out of 4.0</div></div></div>
        <div className="stat-card"><div className="stat-icon green">📚</div><div className="stat-body"><div className="stat-label">Courses Taken</div><div className="stat-value">{loading ? '…' : grades.length}</div><div className="stat-sub">With recorded grades</div></div></div>
        <div className="stat-card"><div className="stat-icon amber">🔔</div><div className="stat-body"><div className="stat-label">Notifications</div><div className="stat-value">{loading ? '…' : unread}</div><div className="stat-sub">Unread</div></div></div>
        <div className="stat-card"><div className="stat-icon red">💳</div><div className="stat-body"><div className="stat-label">Financial Holds</div><div className="stat-value">{loading ? '…' : holds.length}</div><div className="stat-sub">{holds.length > 0 ? 'Action required' : 'None active'}</div></div></div>
      </div>

      <div className="grid-2 fade-up fade-up-delay-2">
        <div className="card">
          <div className="card-header"><div><div className="card-title">Recent Grades</div><div className="card-subtitle">Latest 5 results</div></div></div>
          {loading ? <div className="empty-state"><p>Loading…</p></div> : grades.length === 0 ? (
            <div className="empty-state"><div className="empty-icon">📊</div><p>No grades recorded yet.</p></div>
          ) : (
            <div className="table-wrapper"><table><thead><tr><th>Course</th><th>Grade</th><th>Term</th></tr></thead><tbody>
              {grades.slice(0, 5).map((g) => (
                <tr key={g.id}><td><strong>{g.courseCode}</strong> — {g.courseTitle}</td>
                <td><span className={`badge ${g.letterGrade === 'A' || g.letterGrade === 'A+' ? 'badge-green' : g.letterGrade === 'F' ? 'badge-red' : 'badge-yellow'}`}>{g.letterGrade ?? '—'}</span></td>
                <td>{g.term}</td></tr>
              ))}
            </tbody></table></div>
          )}
        </div>
        <div className="card">
          <div className="card-header"><div><div className="card-title">Notifications</div><div className="card-subtitle">{unread} unread</div></div></div>
          {loading ? <div className="empty-state"><p>Loading…</p></div> : notifs.length === 0 ? (
            <div className="empty-state"><div className="empty-icon">🔔</div><p>No notifications.</p></div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {notifs.slice(0, 5).map((n) => (
                <div key={n.id} style={{ padding: '10px 12px', background: 'var(--bg-surface-hover)', borderRadius: 'var(--radius-sm)', borderLeft: `3px solid ${n.isRead ? 'var(--border)' : 'var(--brand)'}` }}>
                  <p style={{ fontSize: '0.84rem', margin: 0, color: n.isRead ? 'var(--text-muted)' : 'var(--text-primary)' }}>{n.message}</p>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{new Date(n.createdAt).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
