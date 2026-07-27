import React, { useEffect, useState } from 'react';
import { api, GradeEntry } from '../lib/api';

// Compute GPA from grade entries
function computeGPA(grades: GradeEntry[]): string {
  const graded = grades.filter((g) => g.grade !== null);
  if (!graded.length) return 'N/A';
  const total = graded.reduce((sum, g) => {
    const gp = parseFloat(g.grade ?? '0');
    return sum + gp * g.credits;
  }, 0);
  const totalCredits = graded.reduce((sum, g) => sum + g.credits, 0);
  return totalCredits ? (total / totalCredits).toFixed(2) : 'N/A';
}

const LETTER_COLOR: Record<string, string> = {
  'A': 'badge-green', 'A+': 'badge-green', 'A-': 'badge-green',
  'B': 'badge-blue', 'B+': 'badge-blue', 'B-': 'badge-blue',
  'C': 'badge-yellow', 'C+': 'badge-yellow', 'C-': 'badge-yellow',
  'D': 'badge-red', 'F': 'badge-red',
};

export const GradesView: React.FC = () => {
  const [grades, setGrades] = useState<GradeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTerm, setActiveTerm] = useState<string>('All');

  useEffect(() => {
    api.getGrades()
      .then(setGrades)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const terms = ['All', ...Array.from(new Set(grades.map((g) => g.term)))];
  const filtered = activeTerm === 'All' ? grades : grades.filter((g) => g.term === activeTerm);
  const gpa = computeGPA(grades);
  const totalCredits = grades.reduce((sum, g) => sum + g.credits, 0);

  return (
    <div>
      <div className="page-header fade-up">
        <h1>Academic Transcript</h1>
        <p>Your complete grade history across all enrolled terms.</p>
      </div>

      {/* Summary Stats */}
      <div className="stat-grid fade-up fade-up-delay-1">
        <div className="stat-card">
          <div className="stat-icon indigo">📊</div>
          <div className="stat-body">
            <div className="stat-label">Cumulative GPA</div>
            <div className="stat-value">{gpa}</div>
            <div className="stat-sub">Out of 4.0</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon emerald">✅</div>
          <div className="stat-body">
            <div className="stat-label">Courses Completed</div>
            <div className="stat-value">{grades.length}</div>
            <div className="stat-sub">Total graded</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon amber">🎓</div>
          <div className="stat-body">
            <div className="stat-label">Credits Earned</div>
            <div className="stat-value">{totalCredits}</div>
            <div className="stat-sub">Across all terms</div>
          </div>
        </div>
      </div>

      {/* Term Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }} className="fade-up fade-up-delay-2">
        {terms.map((term) => (
          <button
            key={term}
            id={`term-tab-${term.replace(/\s+/g, '-')}`}
            className={activeTerm === term ? 'btn btn-primary' : 'btn btn-ghost'}
            onClick={() => setActiveTerm(term)}
            style={{ padding: '6px 14px', fontSize: '0.8rem' }}
          >
            {term}
          </button>
        ))}
      </div>

      {/* Grades Table */}
      <div className="card fade-up fade-up-delay-3">
        <div className="card-header">
          <div>
            <div className="card-title">Grade Records</div>
            <div className="card-subtitle">{filtered.length} course(s) shown</div>
          </div>
        </div>

        {loading && <div className="empty-state"><p>Loading grades…</p></div>}
        {error && <div className="alert alert-danger">⚠️ {error}</div>}

        {!loading && !error && filtered.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <p>No grade records found for this term.</p>
          </div>
        )}

        {!loading && !error && filtered.length > 0 && (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Course Code</th>
                  <th>Course Title</th>
                  <th>Credits</th>
                  <th>Term</th>
                  <th>Grade</th>
                  <th>Letter</th>
                  <th>Date Graded</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((g) => (
                  <tr key={g.gradeId}>
                    <td><strong>{g.courseCode}</strong></td>
                    <td>{g.courseTitle}</td>
                    <td>{g.credits}</td>
                    <td>{g.term}</td>
                    <td>{g.grade ?? '—'}</td>
                    <td>
                      {g.letterGrade ? (
                        <span className={`badge ${LETTER_COLOR[g.letterGrade] ?? 'badge-yellow'}`}>
                          {g.letterGrade}
                        </span>
                      ) : '—'}
                    </td>
                    <td>{new Date(g.gradedAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
