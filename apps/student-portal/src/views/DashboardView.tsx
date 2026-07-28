import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api, GradeEntry, FinancialHold, Notification } from '../lib/api';

export const DashboardView: React.FC = () => {
  const { user } = useAuth();
  const [grades, setGrades] = useState<GradeEntry[]>([]);
  const [holds, setHolds] = useState<FinancialHold[]>([]);
  const [notifs, setNotifs] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([api.getGrades(), api.getFinancialHolds(), api.getNotifications()])
      .then(([gradesRes, holdsRes, notifsRes]) => {
        if (gradesRes.status === 'fulfilled') setGrades(gradesRes.value);
        if (holdsRes.status === 'fulfilled') setHolds(holdsRes.value);
        if (notifsRes.status === 'fulfilled') setNotifs(notifsRes.value);
      })
      .finally(() => setLoading(false));
  }, []);

  const gpa = (() => {
    const graded = grades.filter((g) => g.grade !== null);
    if (!graded.length) return '—';
    const total = graded.reduce((sum, g) => sum + parseFloat(g.grade) * g.credits, 0);
    const credits = graded.reduce((sum, g) => sum + g.credits, 0);
    return credits ? (total / credits).toFixed(2) : '—';
  })();

  const unreadNotifs = notifs.filter((n) => !n.isRead);
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div>
      {/* Welcome */}
      <div className="page-header fade-up">
        <h1>{greeting}, {user?.name?.split(' ')[0] ?? 'Student'} 👋</h1>
        <p>Here's a snapshot of your academic status. Have a productive day.</p>
      </div>

      {/* Hold Warning */}
      {holds.length > 0 && (
        <div className="alert alert-warning fade-up">
          ⚠️ You have <strong>{holds.length}</strong> active financial hold(s). This may block course registration.
        </div>
      )}

      {/* Stats */}
      <div className="stat-grid fade-up fade-up-delay-1">
        <div className="stat-card">
          <div className="stat-icon indigo">📊</div>
          <div className="stat-body">
            <div className="stat-label">Cumulative GPA</div>
            <div className="stat-value">{loading ? '…' : gpa}</div>
            <div className="stat-sub">Out of 4.0</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon emerald">📚</div>
          <div className="stat-body">
            <div className="stat-label">Courses Completed</div>
            <div className="stat-value">{loading ? '…' : grades.length}</div>
            <div className="stat-sub">On record</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon amber">🔔</div>
          <div className="stat-body">
            <div className="stat-label">Unread Notifications</div>
            <div className="stat-value">{loading ? '…' : unreadNotifs.length}</div>
            <div className="stat-sub">Requires attention</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon red">🚫</div>
          <div className="stat-body">
            <div className="stat-label">Financial Holds</div>
            <div className="stat-value">{loading ? '…' : holds.length}</div>
            <div className="stat-sub">{holds.length > 0 ? 'Action required' : 'All clear'}</div>
          </div>
        </div>
      </div>

      {/* Recent Grades */}
      <div className="card fade-up fade-up-delay-2" style={{ marginBottom: '20px' }}>
        <div className="card-header">
          <div>
            <div className="card-title">Recent Grades</div>
            <div className="card-subtitle">Latest 5 results</div>
          </div>
        </div>
        {loading ? (
          <div className="empty-state"><p>Loading…</p></div>
        ) : grades.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <p>No grades on record yet.</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr><th>Course</th><th>Term</th><th>Grade</th></tr>
              </thead>
              <tbody>
                {grades.slice(0, 5).map((g) => (
                  <tr key={g.gradeId}>
                    <td><strong>{g.courseCode}</strong> — {g.courseTitle}</td>
                    <td>{g.term}</td>
                    <td>
                      {g.letterGrade
                        ? <span className="badge badge-green">{g.letterGrade}</span>
                        : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Recent Notifications */}
      <div className="card fade-up fade-up-delay-3">
        <div className="card-header">
          <div className="card-title">Recent Notifications</div>
        </div>
        {loading ? (
          <div className="empty-state"><p>Loading…</p></div>
        ) : notifs.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🔕</div>
            <p>No notifications yet.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {notifs.slice(0, 4).map((n) => (
              <div
                key={n.id}
                style={{
                  padding: '12px 16px',
                  background: n.isRead ? 'transparent' : 'rgba(99,102,241,0.06)',
                  border: `1px solid ${n.isRead ? 'var(--border)' : 'rgba(99,102,241,0.2)'}`,
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.875rem',
                  color: n.isRead ? 'var(--text-secondary)' : 'var(--text-primary)',
                }}
              >
                {!n.isRead && <span style={{ color: 'var(--brand)', marginRight: '6px' }}>●</span>}
                {n.message}
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  {new Date(n.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
