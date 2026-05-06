import { useState, useEffect, useRef } from 'react';
import { getChildrenStats, createDeposit, getPendingDeposits } from '../../api/deposits';
import StatusPill from '../../components/ui/StatusPill';
import Button from '../../components/ui/Button';

export default function ParentPortal() {
  const [children, setChildren] = useState([]);
  const [recentDeposits, setRecentDeposits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeChild, setActiveChild] = useState(0);
  const [showDepositForm, setShowDepositForm] = useState(false);
  const [form, setForm] = useState({ student_id: '', amount: '', note: '' });
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [errors, setErrors] = useState({});
  const fileRef = useRef(null);

  useEffect(() => {
    Promise.all([getChildrenStats(), getPendingDeposits()])
      .then(([c, d]) => { setChildren(c); setRecentDeposits(d.slice(0, 4)); })
      .finally(() => setLoading(false));
  }, []);

  const child = children[activeChild];

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
      fd.append('student_id', child?.student_id || '');
      fd.append('amount', form.amount);
      fd.append('note', form.note);
      if (file) fd.append('proof', file);
      await createDeposit(fd);
      setSuccess(true);
      setForm({ student_id: '', amount: '', note: '' });
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
          <p>Monitor your child's program and manage deposits</p>
        </div>
      </div>

      {/* Child tabs */}
      {loading ? (
        <div className="loading-state"><div className="loading-spinner" /></div>
      ) : (
        <>
          {children.length > 1 && (
            <div className="tabs">
              {children.map((c, i) => (
                <button key={c.student_id} className={`tab${activeChild === i ? ' active' : ''}`} onClick={() => setActiveChild(i)}>
                  {c.first_name} {c.last_name}
                </button>
              ))}
            </div>
          )}

          {children.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-title">No children linked to your account</div>
              <p className="empty-state-desc">Contact your program coordinator to link your child's account.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 'var(--space-6)', alignItems: 'start' }}>
              {/* Left: child details */}
              <div>
                <div className="card" style={{ marginBottom: 'var(--space-5)' }}>
                  <div style={{ display: 'flex', gap: 'var(--space-6)' }}>
                    {[
                      ['Tickets Filed', child?.ticket_count || 0],
                      ['Total Cost', `$${child?.costBreakdown?.total?.toLocaleString() || 0}`],
                      ['Paid', `$${child?.costBreakdown?.paid?.toLocaleString() || 0}`],
                      ['Outstanding', `$${child?.costBreakdown?.unpaid?.toLocaleString() || 0}`],
                    ].map(([label, val]) => (
                      <div key={label}>
                        <div style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 4 }}>{label}</div>
                        <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', fontWeight: 600 }}>{val}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Cost breakdown */}
                <div className="card">
                  <div className="card-title" style={{ marginBottom: 'var(--space-5)' }}>Cost Breakdown</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                    {[
                      { label: 'Total Cost', amount: child?.costBreakdown?.total || 0, status: null },
                      { label: 'Paid', amount: child?.costBreakdown?.paid || 0, status: 'completed' },
                      { label: 'Outstanding', amount: child?.costBreakdown?.unpaid || 0, status: 'pending' },
                    ].map((item, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'var(--space-4) 0', borderBottom: i < 2 ? '1px solid var(--border)' : 'none' }}>
                        <div style={{ fontWeight: 500, fontSize: '0.9rem' }}>{item.label}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
                          {item.status && <StatusPill status={item.status} />}
                          <span style={{ fontWeight: 700, minWidth: 60, textAlign: 'right' }}>${Number(item.amount).toLocaleString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right: Deposit section */}
              <div>
                <div className="card">
                  <div className="card-header">
                    <span className="card-title">Deposits</span>
                    <Button size="sm" variant="primary" onClick={() => setShowDepositForm(v => !v)}>
                      {showDepositForm ? 'Cancel' : 'Submit Deposit'}
                    </Button>
                  </div>

                  {showDepositForm && (
                    <div style={{ marginBottom: 'var(--space-5)', borderBottom: '1px solid var(--border)', paddingBottom: 'var(--space-5)', animation: 'fadeSlideIn 0.25s both' }}>
                      {success && (
                        <div style={{ padding: 'var(--space-3)', background: 'var(--status-active-bg)', border: '1px solid var(--status-active-border)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-4)', fontSize: '0.85rem', color: 'var(--status-active)', fontWeight: 500 }}>
                          Deposit submitted successfully. Pending review.
                        </div>
                      )}
                      {submitError && (
                        <div style={{ padding: 'var(--space-3)', background: 'var(--status-urgent-bg)', border: '1px solid var(--status-urgent-border)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-4)', fontSize: '0.85rem', color: 'var(--status-urgent)' }}>
                          {submitError}
                        </div>
                      )}

                      <div className="form-group">
                        <label>Amount (CAD)</label>
                        <input type="number" min="1" placeholder="e.g. 1500" value={form.amount} onChange={e => { setForm(p => ({ ...p, amount: e.target.value })); setErrors(p => ({ ...p, amount: undefined })); }} className={errors.amount ? 'error' : ''} />
                        {errors.amount && <div className="form-error">{errors.amount}</div>}
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
                          <input ref={fileRef} type="file" accept="image/*,.pdf" style={{ display: 'none' }} onChange={e => { setFile(e.target.files[0]); setErrors(p => ({ ...p, file: undefined })); }} />
                          {file ? (
                            <div style={{ fontSize: '0.85rem', color: 'var(--status-active)', fontWeight: 500 }}>
                              {file.name}
                            </div>
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
                        <input type="text" placeholder="e.g. Bank transfer for May top-up" value={form.note} onChange={e => setForm(p => ({ ...p, note: e.target.value }))} />
                      </div>

                      <Button variant="primary" style={{ width: '100%', justifyContent: 'center' }} loading={submitting} onClick={handleSubmit}>
                        Submit Deposit Request
                      </Button>
                    </div>
                  )}

                  {/* Deposit history */}
                  {recentDeposits.length === 0 ? (
                    <div style={{ padding: 'var(--space-5)', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>No deposit history</div>
                  ) : (
                    recentDeposits.map(d => (
                      <div key={d.deposit_id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'var(--space-4) 0', borderBottom: '1px solid var(--border)' }}>
                        <div>
                          <div style={{ fontWeight: 600 }}>${Number(d.amount).toLocaleString()}</div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{new Date(d.created_at).toLocaleDateString()}</div>
                        </div>
                        <StatusPill status={d.status} />
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
