import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyTickets, createEmergencyTicket, getAllCategories, createTicket } from '../../api/tickets';
import { getStudentBalance, getEmergencyContacts, addEmergencyContact, deleteEmergencyContact } from '../../api/students';
import StatusPill from '../../components/ui/StatusPill';
import Button from '../../components/ui/Button';

function AddContactModal({ onClose, onAdded }) {
  const [form, setForm] = useState({ name: '', relationship: '', phone: '', wechat_id: '' });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [apiError, setApiError] = useState('');

  const handleSubmit = async () => {
    const e = {};
    if (!form.name) e.name = 'Required';
    if (!form.phone) e.phone = 'Required';
    if (Object.keys(e).length) { setErrors(e); return; }
    setSaving(true);
    setApiError('');
    try {
      const contact = await addEmergencyContact(form);
      onAdded(contact);
      onClose();
    } catch (err) {
      setApiError(err.response?.data?.message || 'Failed to add contact');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="panel-overlay" onClick={onClose} />
      <div className="panel">
        <div className="panel-header">
          <h3 className="panel-title">Add Emergency Contact</h3>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div className="panel-body">
          {apiError && <div className="form-error" style={{ marginBottom: 'var(--space-4)' }}>{apiError}</div>}
          <div className="form-group">
            <label>Full Name *</label>
            <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className={errors.name ? 'error' : ''} placeholder="e.g. Li Ming" />
            {errors.name && <div className="form-error">{errors.name}</div>}
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Relationship</label>
              <select value={form.relationship} onChange={e => setForm(p => ({ ...p, relationship: e.target.value }))}>
                <option value="">Select...</option>
                <option>Father</option>
                <option>Mother</option>
                <option>Legal Guardian</option>
                <option>Grandparent</option>
                <option>Uncle / Aunt</option>
                <option>Other</option>
              </select>
            </div>
            <div className="form-group">
              <label>Phone *</label>
              <input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} className={errors.phone ? 'error' : ''} placeholder="+86 xxx xxxx xxxx" />
              {errors.phone && <div className="form-error">{errors.phone}</div>}
            </div>
          </div>
          <div className="form-group">
            <label>WeChat ID</label>
            <input value={form.wechat_id} onChange={e => setForm(p => ({ ...p, wechat_id: e.target.value }))} placeholder="Optional" />
          </div>
        </div>
        <div className="panel-footer">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant="primary" loading={saving} onClick={handleSubmit}>Add Contact</Button>
        </div>
      </div>
    </>
  );
}

function TicketCreatePanel({ onClose, onCreated, categories }) {
  const [form, setForm] = useState({ title: '', category_id: '', description: '', priority: 'medium' });
  const [errors, setErrors] = useState({});
  const [creating, setCreating] = useState(false);
  const [apiError, setApiError] = useState('');

  const handleCreate = async () => {
    const e = {};
    if (!form.title) e.title = 'Title is required';
    if (!form.description) e.description = 'Please describe the issue';
    if (Object.keys(e).length) { setErrors(e); return; }
    setCreating(true);
    setApiError('');
    try {
      const result = await createTicket(form);
      onCreated(result);
      onClose();
    } catch (err) {
      setApiError(err.response?.data?.error || 'Failed to create ticket');
    } finally {
      setCreating(false);
    }
  };

  return (
    <>
      <div className="panel-overlay" onClick={onClose} />
      <div className="panel">
        <div className="panel-header">
          <h3 className="panel-title">Submit a Ticket</h3>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div className="panel-body">
          {apiError && <div className="form-error" style={{ marginBottom: 'var(--space-4)' }}>{apiError}</div>}
          <div className="form-group">
            <label>Title *</label>
            <input type="text" placeholder="Brief description of the issue" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} className={errors.title ? 'error' : ''} />
            {errors.title && <div className="form-error">{errors.title}</div>}
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Category</label>
              <select value={form.category_id} onChange={e => setForm(p => ({ ...p, category_id: e.target.value }))}>
                <option value="">Select category</option>
                {categories.map(c => <option key={c.category_id} value={c.category_id}>{c.category_name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Priority</label>
              <select value={form.priority} onChange={e => setForm(p => ({ ...p, priority: e.target.value }))}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label>Description *</label>
            <textarea
              rows={5}
              placeholder="Please describe your situation in detail..."
              value={form.description}
              onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
              className={errors.description ? 'error' : ''}
              style={{ resize: 'vertical' }}
            />
            {errors.description && <div className="form-error">{errors.description}</div>}
          </div>
        </div>
        <div className="panel-footer">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant="primary" loading={creating} onClick={handleCreate}>Submit Ticket</Button>
        </div>
      </div>
    </>
  );
}

function EmergencyConfirmBanner({ onConfirm, onCancel, loading }) {
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  const handleConfirm = () => {
    if (!description.trim()) { setError('Please describe the emergency.'); return; }
    onConfirm(description.trim());
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
      background: 'var(--status-urgent-bg)',
      border: '2px solid var(--status-urgent-border)',
      padding: 'var(--space-5) var(--space-8)',
      boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 'var(--space-6)' }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, color: 'var(--status-urgent)', marginBottom: 4 }}>File an emergency ticket?</div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 'var(--space-3)' }}>This will immediately alert our team for urgent assistance.</div>
          <textarea
            rows={2}
            placeholder="Describe the emergency..."
            value={description}
            onChange={e => { setDescription(e.target.value); setError(''); }}
            style={{ width: '100%', resize: 'none', fontSize: '0.875rem', borderColor: error ? 'var(--status-urgent)' : undefined }}
          />
          {error && <div style={{ fontSize: '0.78rem', color: 'var(--status-urgent)', marginTop: 4 }}>{error}</div>}
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-3)', flexShrink: 0, paddingTop: 4 }}>
          <Button variant="secondary" onClick={onCancel} disabled={loading}>Cancel</Button>
          <Button variant="danger" loading={loading} onClick={handleConfirm}>Confirm Emergency</Button>
        </div>
      </div>
    </div>
  );
}

export default function StudentPortal() {
  const navigate = useNavigate();
  const [balance, setBalance] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTicketPanel, setShowTicketPanel] = useState(false);
  const [showAddContact, setShowAddContact] = useState(false);
  const [emergencyLoading, setEmergencyLoading] = useState(false);
  const [showEmergencyConfirm, setShowEmergencyConfirm] = useState(false);
  const [emergencySuccess, setEmergencySuccess] = useState(false);
  const [emergencyError, setEmergencyError] = useState('');

  useEffect(() => {
    Promise.allSettled([
      getStudentBalance(),
      getMyTickets(),
      getAllCategories(),
      getEmergencyContacts(),
    ]).then(([b, t, c, ec]) => {
      if (b.status === 'fulfilled') setBalance(b.value);
      if (t.status === 'fulfilled') setTickets(t.value);
      if (c.status === 'fulfilled') setCategories(c.value);
      if (ec.status === 'fulfilled') setContacts(ec.value);
    }).finally(() => setLoading(false));
  }, []);

  const handleEmergencyConfirm = async (description) => {
    setEmergencyLoading(true);
    setEmergencyError('');
    try {
      await createEmergencyTicket({ description });
      setEmergencySuccess(true);
      setShowEmergencyConfirm(false);
      // Refresh ticket list so the new emergency ticket appears immediately
      const fresh = await getMyTickets().catch(() => null);
      if (fresh) setTickets(fresh);
    } catch (err) {
      setEmergencyError(err.response?.data?.error || 'Failed to file emergency ticket. Please try again.');
      setShowEmergencyConfirm(false);
    } finally {
      setEmergencyLoading(false);
    }
  };

  const handleDeleteContact = async (contactId) => {
    try {
      await deleteEmergencyContact(contactId);
      setContacts(prev => prev.filter(c => c.contact_id !== contactId));
    } catch {
      // silently ignore — contact stays in list
    }
  };

  const gateWarning = contacts.length < 3;
  const openTickets = tickets.filter(t => t.status === 'open' || t.status === 'in_progress');
  const closedTickets = tickets.filter(t => t.status === 'completed' || t.status === 'resolved');

  return (
    <div className="animate-in">
      {showEmergencyConfirm && (
        <EmergencyConfirmBanner
          onConfirm={(desc) => handleEmergencyConfirm(desc)}
          onCancel={() => setShowEmergencyConfirm(false)}
          loading={emergencyLoading}
        />
      )}

      {/* Emergency button */}
      <div style={{
        background: emergencySuccess ? 'var(--status-active-bg)' : 'var(--status-urgent-bg)',
        border: `1px solid ${emergencySuccess ? 'var(--status-active)' : 'var(--status-urgent-border)'}`,
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--space-4) var(--space-6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 'var(--space-6)',
      }}>
        <div>
          <div style={{ fontWeight: 700, color: emergencySuccess ? 'var(--status-active)' : 'var(--status-urgent)', marginBottom: 2 }}>
            {emergencySuccess ? 'Emergency ticket filed' : 'Emergency Assistance'}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            {emergencySuccess
              ? 'Our team has been alerted and will contact you immediately.'
              : emergencyError || 'If you need immediate help, press this button to alert our team.'}
          </div>
        </div>
        {!emergencySuccess && (
          <button
            className="btn btn-danger"
            onClick={() => setShowEmergencyConfirm(true)}
            disabled={emergencyLoading}
            style={{ fontWeight: 700, padding: 'var(--space-3) var(--space-6)' }}
          >
            Emergency
          </button>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 'var(--space-6)', alignItems: 'start' }}>
        <div>
          {/* Balance */}
          <div className="card" style={{ marginBottom: 'var(--space-5)' }}>
            <div style={{ marginBottom: 'var(--space-4)' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 4 }}>Account Balance</div>
              {loading ? (
                <div className="skeleton" style={{ height: 40, width: 120 }} />
              ) : (
                <div style={{ fontFamily: 'var(--font-serif)', fontSize: '2.4rem', fontWeight: 600, color: balance?.balance < 500 ? 'var(--status-urgent)' : 'var(--status-active)', lineHeight: 1 }}>
                  {Number(balance?.balance ?? 0).toLocaleString('en', { minimumFractionDigits: 2 })} <span style={{ fontSize: '1.2rem', fontWeight: 400, opacity: 0.7 }}>{balance?.currency ?? 'USD'}</span>
                </div>
              )}
            </div>
            {balance?.balance < 500 && (
              <div style={{ padding: 'var(--space-3) var(--space-4)', background: 'var(--status-urgent-bg)', border: '1px solid var(--status-urgent-border)', borderRadius: 'var(--radius-md)', fontSize: '0.8rem', color: 'var(--status-urgent)' }}>
                Low balance — please submit a deposit request soon.
              </div>
            )}
          </div>

          {/* Tickets */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">My Tickets</span>
              <Button size="sm" variant="primary" onClick={() => setShowTicketPanel(true)} disabled={gateWarning}>
                + New Ticket
              </Button>
            </div>

            {gateWarning && (
              <div style={{ padding: 'var(--space-3) var(--space-4)', background: 'var(--status-urgent-bg)', border: '1px solid var(--status-urgent-border)', borderRadius: 'var(--radius-md)', fontSize: '0.78rem', color: 'var(--status-urgent)', marginBottom: 'var(--space-4)' }}>
                You must add {3 - contacts.length} more emergency contact{3 - contacts.length !== 1 ? 's' : ''} before submitting tickets.
              </div>
            )}

            {openTickets.length === 0 && closedTickets.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-title">No tickets yet</div>
                <p className="empty-state-desc">Need help? Submit a ticket and our concierge team will assist you.</p>
                <Button variant="primary" size="sm" style={{ marginTop: 'var(--space-4)' }} onClick={() => setShowTicketPanel(true)} disabled={gateWarning}>
                  Submit First Ticket
                </Button>
              </div>
            ) : (
              <div>
                {openTickets.length > 0 && (
                  <>
                    <div style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 'var(--space-3)' }}>Active</div>
                    {openTickets.map(t => (
                      <div key={t.ticket_id} onClick={() => navigate(`/student/tickets/${t.ticket_id}`)}
                        style={{ padding: 'var(--space-4) 0', borderBottom: '1px solid var(--border)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 500, marginBottom: 2 }}>{t.title}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>#{t.ticket_id}</div>
                        </div>
                        <StatusPill status={t.status} />
                      </div>
                    ))}
                  </>
                )}
                {closedTickets.length > 0 && (
                  <>
                    <div style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)', marginTop: 'var(--space-4)', marginBottom: 'var(--space-3)' }}>Closed</div>
                    {closedTickets.map(t => (
                      <div key={t.ticket_id}
                        style={{ padding: 'var(--space-3) 0', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 'var(--space-4)', opacity: 0.6 }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 500, marginBottom: 2 }}>{t.title}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>#{t.ticket_id}</div>
                        </div>
                        <StatusPill status={t.status} />
                      </div>
                    ))}
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right sidebar — Emergency contacts */}
        <div>
          <div className="card">
            <div className="card-header">
              <span className="card-title">Emergency Contacts</span>
              {contacts.length < 5 && (
                <Button size="sm" variant="ghost" onClick={() => setShowAddContact(true)}>+ Add</Button>
              )}
            </div>

            {gateWarning && (
              <div style={{ padding: 'var(--space-3) var(--space-4)', background: 'var(--status-urgent-bg)', border: '1px solid var(--status-urgent-border)', borderRadius: 'var(--radius-md)', fontSize: '0.78rem', color: 'var(--status-urgent)', marginBottom: 'var(--space-4)' }}>
                <strong>Action required:</strong> Add {3 - contacts.length} more contact{3 - contacts.length !== 1 ? 's' : ''} to unlock ticket submission.
              </div>
            )}

            {contacts.map(contact => (
              <div key={contact.contact_id} style={{ padding: 'var(--space-4) 0', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontWeight: 500, fontSize: '0.9rem', marginBottom: 2 }}>{contact.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 2 }}>{contact.relationship}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{contact.phone}</div>
                </div>
                <button
                  className="btn btn-ghost btn-icon"
                  style={{ opacity: 0.5, flexShrink: 0 }}
                  onClick={() => handleDeleteContact(contact.contact_id)}
                  title="Remove contact"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>
            ))}

            {contacts.length < 3 && Array.from({ length: 3 - contacts.length }).map((_, i) => (
              <div
                key={i}
                onClick={() => setShowAddContact(true)}
                style={{
                  padding: 'var(--space-4)',
                  border: '2px dashed var(--border)',
                  borderRadius: 'var(--radius-md)',
                  textAlign: 'center',
                  color: 'var(--text-muted)',
                  fontSize: '0.8rem',
                  marginTop: 'var(--space-3)',
                  cursor: 'pointer',
                }}
              >
                + Add contact {contacts.length + i + 1}
              </div>
            ))}
          </div>
        </div>
      </div>

      {showTicketPanel && (
        <TicketCreatePanel
          categories={categories}
          onClose={() => setShowTicketPanel(false)}
          onCreated={t => setTickets(prev => [t, ...prev])}
        />
      )}

      {showAddContact && (
        <AddContactModal
          onClose={() => setShowAddContact(false)}
          onAdded={contact => setContacts(prev => [...prev, contact])}
        />
      )}
    </div>
  );
}
