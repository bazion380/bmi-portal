import React, { useEffect, useState } from 'react';
import { api, CourseOffering, FinancialHold } from '../lib/api';

export const RegistrationView: React.FC = () => {
  const [offerings, setOfferings] = useState<CourseOffering[]>([]);
  const [holds, setHolds] = useState<FinancialHold[]>([]);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState<number | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [registered, setRegistered] = useState<Set<number>>(new Set());

  useEffect(() => {
    Promise.all([api.getOfferings(), api.getFinancialHolds()])
      .then(([off, h]) => {
        setOfferings(off);
        setHolds(h);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const hasHold = holds.length > 0;

  const handleRegister = async (offeringId: number, courseTitle: string) => {
    setRegistering(offeringId);
    setSuccess(null);
    setError(null);
    try {
      await api.registerCourse(offeringId);
      setRegistered((prev) => new Set(prev).add(offeringId));
      setSuccess(`Successfully registered for ${courseTitle}!`);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setRegistering(null);
    }
  };

  const terms = Array.from(new Set(offerings.map((o) => o.term)));

  return (
    <div>
      <div className="page-header fade-up">
        <h1>Course Registration</h1>
        <p>Browse and register for available course offerings. Holds must be cleared first.</p>
      </div>

      {/* Financial Hold Warning */}
      {hasHold && (
        <div className="alert alert-warning fade-up">
          ⚠️ <strong>You have an active financial hold.</strong> Please clear your outstanding balance before registering for courses.
          {holds.map((h) => (
            <div key={h.id} style={{ marginTop: '6px', fontSize: '0.8rem' }}>
              {h.reason} — <strong>GHS {parseFloat(h.amountDue).toFixed(2)}</strong>
            </div>
          ))}
        </div>
      )}

      {success && (
        <div className="alert fade-up" style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', color: '#34d399' }}>
          ✅ {success}
        </div>
      )}

      {error && (
        <div className="alert alert-danger fade-up">
          ⚠️ {error}
        </div>
      )}

      {loading && <div className="empty-state"><p>Loading course offerings…</p></div>}

      {!loading && terms.map((term, tIdx) => (
        <div key={term} className="card fade-up" style={{ marginBottom: '20px', animationDelay: `${tIdx * 0.05}s` }}>
          <div className="card-header">
            <div>
              <div className="card-title">{term}</div>
              <div className="card-subtitle">
                {offerings.filter((o) => o.term === term).length} offerings available
              </div>
            </div>
          </div>

          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Course Code</th>
                  <th>Course Title</th>
                  <th>Credits</th>
                  <th>Capacity</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {offerings
                  .filter((o) => o.term === term)
                  .map((o) => {
                    const isRegistered = registered.has(o.id);
                    return (
                      <tr key={o.id}>
                        <td><strong>{o.courseCode}</strong></td>
                        <td>{o.courseTitle}</td>
                        <td>{o.courseCredits} cr.</td>
                        <td>{o.capacity} seats</td>
                        <td>
                          {isRegistered ? (
                            <span className="badge badge-green">✓ Registered</span>
                          ) : (
                            <button
                              id={`register-btn-${o.id}`}
                              className="btn btn-primary"
                              style={{ padding: '5px 12px', fontSize: '0.8rem' }}
                              disabled={hasHold || registering === o.id}
                              onClick={() => handleRegister(o.id, o.courseTitle)}
                            >
                              {registering === o.id ? '…' : 'Register'}
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      ))}

      {!loading && offerings.length === 0 && !error && (
        <div className="empty-state card">
          <div className="empty-icon">📋</div>
          <p>No course offerings are currently available for registration.</p>
        </div>
      )}
    </div>
  );
};
