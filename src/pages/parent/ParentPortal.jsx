import { useState, useEffect, useRef } from 'react';
import { getChildrenStats, getParentDeposits, createDeposit } from '../../api/deposits';
import StatusPill from '../../components/ui/StatusPill';
import Button from '../../components/ui/Button';

const CURRENCIES = ['CAD', 'USD', 'CNY', 'HKD', 'GBP', 'EUR', 'AUD'];

export default function ParentPortal() {
  const [children, setChildren] = useState([]);
  const [deposits, setDeposits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeChild, setActiveChild] = useState(0);
  const [showDepositForm, setShowDepositForm] = useState(false);
  const [form, setForm] = useState({ amount: '', currency: 'CAD', note: '' });
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [errors, setErrors] = useState({});
  const fileRef = useRef(null);

  useEffect(() => {
    Promise.all([
      getChildrenStats().catch(() => []),
      getParentDeposits().catch(() => []),
    ]).then(([c, d]) => {
      setChildren(c);
      setDeposits(d);
    }).finally(() => setLoading(false));
  }, []);

  const child = children[activeChild];

  // deposits for the currently selected child
  const childDeposits = child
    ? deposits.filter(d => d.student_id === child.student_id)
    : [];

  const validate = () => {
    const e = {};
    if (!form.amount || isNaN(form.amount) || Number(form.amount) <= 0) e.amount = 'Valid amount required';
    if (!file) e.file = 'Proof of payment is required';
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setSubmitting(true);
    setSubmitError('');
    try {
      const fd = new FormData();
      fd.append('student_id', child.student_id);
      fd.append('amount', form.amount);
      fd.append('currency', form.currency);
      fd.append('note', form.note);
      if (file) fd.append('proof', file);
      await createDeposit(fd);
      // Refresh deposits
      const fresh = await getParentDeposits().catch(() => deposits);
      setDeposits(fresh);
      setSuccess(true);
      setForm({ amount: '', currency: 'CAD', note: '' });
      setFile(null);
      setTimeout(() => { setSuccess(false); setShowDepositForm(false); }, 3000);
    } catch (err) {
      setSubmitError(err.response?.data?.message || 'Failed to submit deposit. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="animate-in">
      <div className="page-header">
        <div className="page-header-text">
          <h2>Parent Portal</h2>
          <p>Monitor your {children.length > 1 ? "children's" : "child's"} program and manage deposits</p>
        </div>
      </div>

      {loading ? (
        <div className="loading-state"><div className="loading-spinner" /></div>
      ) : children.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-title">No children linked to your account</div>
          <p className="empty-state-desc">Contact your program coordinator to link your child's account.</p>
        </div>
      ) : (
        <>
          {/* Child tabs — shown even for 1 child to display their name */}
          <div className="tabs" style={{ marginBottom: 'var(--space-6)' }}>
            {children.map((c, i) => (
              <button
                key={c.student_id}
                className={`tab${activeChild === i ? ' active' : ''}`}
                onClick={() => setActiveChild(i)}
              >
                {c.first_name} {c.last_name}
                {c.grade_level && (
                  <span style={{ marginLeft: 6, fontSize: '0.7rem', opacity: 0.7 }}>Gr. {c.grade_level}</span>
                )}
              </button>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 'var(--space-6)', alignItems: 'start' }}>
            {/* Left: child details */}
            <div>
              {/* Stats bar */}
              <div className="card" style={{ marginBottom: 'var(--space-5)' }}>
                <div style={{ display: 'flex', gap: 'var(--space-8)', flexWrap: 'wrap' }}>
                  {[
                    ['Student ID', child?.external_student_id || '—'],
                    ['Program', child?.intended_program || '—'],
                    ['Tickets Filed', child?.ticket_count ?? 0],
                    ['Balance', `$${Number(child?.balance ?? 0).toLocaleString()} CAD`],
                  ].map(([label, val]) => (
                    <div key={label}>
                      <div style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 4 }}>{label}</div>
                      <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.3rem', fontWeight: 600 }}>{val}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Deposit history for this child */}
              <div className="card">
                <div className="card-title" style={{ marginBottom: 'var(--space-5)' }}>Deposit History</div>
                {childDeposits.length === 0 ? (
                  <div style={{ padding: 'var(--space-5)', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                    No deposits yet
                  </div>
                ) : (
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Amount</th>
                        <th>Proof</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {childDeposits.map(d => (
                        <tr key={d.deposit_id}>
                          <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                            {new Date(d.created_at).toLocaleDateString()}
                          </td>
                          <td style={{ fontWeight: 600 }}>
                            {Number(d.amount).toLocaleString()} {d.currency || 'CAD'}
                          </td>
                          <td>
                            {d.proof_url ? (
                              <a
                                href={d.proof_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.8rem', color: 'var(--accent-text)', fontWeight: 600, textDecoration: 'none' }}
                              >
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                                View
                              </a>
                            ) : (
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>—</span>
                            )}
                          </td>
                          <td><StatusPill status={d.status} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            {/* Right: deposit submission */}
            <div className="card">
              <div className="card-header">
                <span className="card-title">Submit Deposit</span>
                <Button size="sm" variant={showDepositForm ? 'ghost' : 'primary'} onClick={() => { setShowDepositForm(v => !v); setSubmitError(''); setErrors({}); }}>
                  {showDepositForm ? 'Cancel' : 'New Deposit'}
                </Button>
              </div>

              {showDepositForm && (
                <div style={{ animation: 'fadeSlideIn 0.25s both' }}>
                  {success && (
                    <div style={{ padding: 'var(--space-3)', background: 'var(--status-active-bg)', border: '1px solid var(--status-active-border)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-4)', fontSize: '0.85rem', color: 'var(--status-active)', fontWeight: 500 }}>
                      Deposit submitted. Pending review.
                    </div>
                  )}
                  {submitError && (
                    <div style={{ padding: 'var(--space-3)', background: 'var(--status-urgent-bg)', border: '1px solid var(--status-urgent-border)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-4)', fontSize: '0.85rem', color: 'var(--status-urgent)' }}>
                      {submitError}
                    </div>
                  )}

                  {/* Child selector when multiple children */}
                  {children.length > 1 && (
                    <div className="form-group">
                      <label>For Child</label>
                      <div style={{ padding: 'var(--space-3) var(--space-4)', background: 'var(--content-bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                        {child?.first_name} {child?.last_name} — switch tabs to change
                      </div>
                    </div>
                  )}

                  <div className="form-row">
                    <div className="form-group">
                      <label>Amount *</label>
                      <input
                        type="number" min="1" placeholder="e.g. 1500"
                        value={form.amount}
                        onChange={e => { setForm(p => ({ ...p, amount: e.target.value })); setErrors(p => ({ ...p, amount: undefined })); }}
                        className={errors.amount ? 'error' : ''}
                      />
                      {errors.amount && <div className="form-error">{errors.amount}</div>}
                    </div>
                    <div className="form-group">
                      <label>Currency *</label>
                      <select value={form.currency} onChange={e => setForm(p => ({ ...p, currency: e.target.value }))}>
                        {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Proof of Payment *</label>
                    <div
                      onClick={() => fileRef.current?.click()}
                      style={{
                        border: `2px dashed ${errors.file ? 'var(--status-urgent)' : 'var(--border-strong)'}`,
                        borderRadius: 'var(--radius-md)',
                        padding: 'var(--space-5)',
                        textAlign: 'center',
                        cursor: 'pointer',
                        background: file ? 'var(--status-active-bg)' : 'transparent',
                        transition: 'all var(--transition-fast)',
                      }}
                    >
                      <input ref={fileRef} type="file" accept="image/*,.pdf" style={{ display: 'none' }}
                        onChange={e => { setFile(e.target.files[0]); setErrors(p => ({ ...p, file: undefined })); }} />
                      {file ? (
                        <div style={{ fontSize: '0.85rem', color: 'var(--status-active)', fontWeight: 500 }}>{file.name}</div>
                      ) : (
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          Click to upload bank transfer screenshot or receipt
                        </div>
                      )}
                    </div>
                    {errors.file && <div className="form-error">{errors.file}</div>}
                  </div>

                  <div className="form-group">
                    <label>Note (optional)</label>
                    <input type="text" placeholder="e.g. Bank transfer for May top-up"
                      value={form.note} onChange={e => setForm(p => ({ ...p, note: e.target.value }))} />
                  </div>

                  <Button variant="primary" style={{ width: '100%', justifyContent: 'center' }} loading={submitting} onClick={handleSubmit}>
                    Submit Deposit Request
                  </Button>
                </div>
              )}

              {!showDepositForm && childDeposits.length === 0 && (
                <div style={{ padding: 'var(--space-4)', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  No deposits for {child?.first_name} yet.
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
