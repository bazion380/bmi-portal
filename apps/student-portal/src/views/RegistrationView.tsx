import React, { useEffect, useState } from 'react';
import { api, CourseOffering, FinancialHold } from '../lib/api';

export const RegistrationView: React.FC = () => {
  const [offerings, setOfferings] = useState<CourseOffering[]>([]);
  const [holds, setHolds] = useState<FinancialHold[]>([]);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState<number | null>(null);
  const [registered, setRegistered] = useState<Set<number>>(new Set());
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.allSettled([api.getOfferings(), api.getHolds()])
      .then(([o, h]) => {
        if (o.status === 'fulfilled') setOfferings(o.value);
        if (h.status === 'fulfilled') setHolds(h.value);
      }).finally(() => setLoading(false));
  }, []);

  const hasHold = holds.some((h) => h.isActive);

  const handleRegister = async (id: number) => {
    if (hasHold) { setError('Cannot register: you have an active financial hold.'); return; }
    setRegistering(id);
    setError('');
    try {
      await api.registerCourse(id);
      setRegistered((prev) => new Set(prev).add(id));
    } catch (e: any) {
      setError(e.message ?? 'Registration failed.');
    } finally {
      setRegistering(null);
    }
  };

  const terms = Array.from(new Set(offerings.map((o) => o.term))).sort((a, b) => b.localeCompare(a));

  return (
    <div>
      <div className="page-header fade-up">
        <h1>Course Registration</h1>
        <p>Browse available courses and register for the upcoming term.</p>
      </div>
      {hasHold && (
        <div className="alert alert-danger fade-up">
          ⚠️ Registration is blocked: you have {holds.length} active financial hold(s). Contact the Finance Office to resolve.
        </div>
      )}
      {error && <div className="alert alert-danger fade-up">{error}</div>}
      {loading ? <div className="card"><div className="empty-state"><p>Loading…</p></div></div> : (
        terms.map((term) => (
          <div key={term} className="card fade-up" style={{ marginBottom: '16px' }}>
            <div className="card-header"><div className="card-title">{term}</div></div>
            <div className="table-wrapper"><table>
              <thead><tr><th>Code</th><th>Course</th><th>Credits</th><th>Capacity</th><th>Action</th></tr></thead>
              <tbody>
                {offerings.filter((o) => o.term === term).map((o) => (
                  <tr key={o.id}>
                    <td><strong>{o.courseCode}</strong></td>
                    <td>{o.courseTitle}</td>
                    <td>{o.courseCredits}</td>
                    <td>{o.capacity}</td>
                    <td>
                      {registered.has(o.id)
                        ? <span className="badge badge-green">✓ Registered</span>
                        : <button className="btn btn-primary" style={{ padding: '4px 12px', fontSize: '0.8rem' }}
                            disabled={hasHold || registering === o.id}
                            onClick={() => handleRegister(o.id)}>
                            {registering === o.id ? '…' : 'Register'}
                          </button>
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table></div>
          </div>
        ))
      )}
    </div>
  );
};
