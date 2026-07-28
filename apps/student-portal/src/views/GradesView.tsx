import React, { useEffect, useState } from 'react';
import { api, GradeEntry as Grade } from '../lib/api';

export const GradesView: React.FC = () => {
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTerm, setActiveTerm] = useState<string>('all');

  useEffect(() => {
    api.getGrades().then(setGrades).finally(() => setLoading(false));
  }, []);

  const terms = ['all', ...Array.from(new Set(grades.map((g) => g.term))).sort((a, b) => b.localeCompare(a))];
  const filtered = activeTerm === 'all' ? grades : grades.filter((g) => g.term === activeTerm);
  const gpa = filtered.length
    ? (filtered.reduce((s, g) => s + (parseFloat(g.grade ?? '0') / 25), 0) / filtered.length).toFixed(2)
    : 'N/A';
  const totalCredits = filtered.reduce((s, g) => s + g.credits, 0);

  const letterColor = (l: string | null) => {
    if (!l) return 'badge-yellow';
    if (l.startsWith('A')) return 'badge-green';
    if (l === 'F') return 'badge-red';
    if (l.startsWith('B')) return 'badge-blue';
    return 'badge-yellow';
  };

  return (
    <div>
      <div className="page-header fade-up">
        <h1>My Grades</h1>
        <p>View your complete academic transcript and GPA.</p>
      </div>
      <div className="stat-grid fade-up fade-up-delay-1">
        <div className="stat-card"><div className="stat-icon indigo">📊</div><div className="stat-body"><div className="stat-label">GPA ({activeTerm === 'all' ? 'Cumulative' : activeTerm})</div><div className="stat-value">{loading ? '…' : gpa}</div></div></div>
        <div className="stat-card"><div className="stat-icon green">📚</div><div className="stat-body"><div className="stat-label">Courses</div><div className="stat-value">{filtered.length}</div></div></div>
        <div className="stat-card"><div className="stat-icon blue">🎓</div><div className="stat-body"><div className="stat-label">Credit Hours</div><div className="stat-value">{totalCredits}</div></div></div>
      </div>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }} className="fade-up fade-up-delay-2">
        {terms.map((t) => (
          <button key={t} className={activeTerm === t ? 'btn btn-primary' : 'btn btn-ghost'}
            onClick={() => setActiveTerm(t)}
            style={{ padding: '6px 14px', fontSize: '0.8rem', textTransform: 'capitalize' }}>
            {t === 'all' ? 'All Terms' : t}
          </button>
        ))}
      </div>
      <div className="card fade-up fade-up-delay-3">
        {loading ? <div className="empty-state"><p>Loading…</p></div> : filtered.length === 0 ? (
          <div className="empty-state"><div className="empty-icon">📊</div><p>No grades for this term.</p></div>
        ) : (
          <div className="table-wrapper"><table>
            <thead><tr><th>Code</th><th>Course</th><th>Credits</th><th>Score</th><th>Grade</th><th>Term</th></tr></thead>
            <tbody>
              {filtered.map((g) => (
                <tr key={g.id}>
                  <td><strong>{g.courseCode}</strong></td>
                  <td>{g.courseTitle}</td>
                  <td>{g.credits}</td>
                  <td>{g.grade ?? '—'}</td>
                  <td><span className={`badge ${letterColor(g.letterGrade)}`}>{g.letterGrade ?? '—'}</span></td>
                  <td>{g.term}</td>
                </tr>
              ))}
            </tbody>
          </table></div>
        )}
      </div>
    </div>
  );
};
