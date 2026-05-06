import { useState, useEffect } from 'react';
import { createInvitation } from '../../api/auth';
import { getOrganizations } from '../../api/organizations';
import { getInvitations } from '../../api/students';
import StatusPill from '../../components/ui/StatusPill';
import Button from '../../components/ui/Button';

function InvitationHistory({ filterRole }) {
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getInvitations().then(setInvitations).finally(() => setLoading(false));
  }, []);

  const filtered = invitations.filter(i => filterRole === 'all' || i.role === filterRole);

  return (
    <div className="table-wrapper">
      <table className="table">
        <thead>
          <tr>
            <th>Email</th>
            <th>Role</th>
            <th>Organization</th>
            <th style={{ width: 100 }}>Status</th>
            <th>Expires</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <tr key={i}>{[1,2,3,4,5].map(j => <td key={j}><div className="skeleton" style={{ height: 16, width: '70%' }} /></td>)}</tr>
            ))
          ) : filtered.length === 0 ? (
            <tr><td colSpan={5} style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>No invitations found</td></tr>
          ) : filtered.map(inv => (
            <tr key={inv.token_id}>
              <td style={{ fontSize: '0.875rem' }}>{inv.email}</td>
              <td><span style={{ fontSize: '0.78rem', fontWeight: 600, textTransform: 'capitalize' }}>{inv.role}</span></td>
              <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{inv.org_name || '—'}</td>
              <td><StatusPill status={inv.status} /></td>
              <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {new Date(inv.expires_at).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const ROLES = [
  { id: 2, name: 'admin', label: 'Admin' },
  { id: 6, name: 'vendor', label: 'Vendor' },
];

export default function UserManagement() {
  const [orgs, setOrgs] = useState([]);
  const [filterRole, setFilterRole] = useState('all');
  const [form, setForm] = useState({ email: '', role_id: '', org_id: '' });
  const [errors, setErrors] = useState({});
  const [creating, setCreating] = useState(false);
  const [success, setSuccess] = useState(null);

  useEffect(() => { getOrganizations().then(setOrgs); }, []);

  const validate = () => {
    const e = {};
    if (!form.email || !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Valid email required';
    if (!form.role_id) e.role_id = 'Role required';
    return e;
  };

  const [apiError, setApiError] = useState('');

  const handleCreate = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setCreating(true);
    setApiError('');
    try {
      const result = await createInvitation({ email: form.email, role_id: Number(form.role_id), org_id: form.org_id || null });
      setSuccess({ email: form.email, token: result.token });
      setForm({ email: '', role_id: '', org_id: '' });
      setErrors({});
    } catch (err) {
      setApiError(err.response?.data?.message || 'Failed to send invitation. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="animate-in">
      <div className="page-header">
        <div className="page-header-text">
          <h2>User Management</h2>
          <p>Create and manage admin and vendor accounts</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 'var(--space-6)', alignItems: 'start' }}>
        {/* User list */}
        <div>
          <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-5)' }}>
            {['all', 'admin', 'vendor'].map(r => (
              <button key={r} className={`btn btn-sm ${filterRole === r ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setFilterRole(r)}>
                {r === 'all' ? 'All Invitations' : r.charAt(0).toUpperCase() + r.slice(1) + 's'}
              </button>
            ))}
          </div>

          <InvitationHistory filterRole={filterRole} />
        </div>

        {/* Create user panel */}
        <div className="card">
          <div className="card-title" style={{ marginBottom: 'var(--space-5)' }}>Invite New User</div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 'var(--space-5)' }}>
            An invitation link will be sent that allows them to set up their account.
          </p>

          {apiError && (
            <div style={{ padding: 'var(--space-3) var(--space-4)', background: 'var(--status-urgent-bg)', border: '1px solid var(--status-urgent-border)', borderRadius: 'var(--radius-md)', fontSize: '0.8rem', color: 'var(--status-urgent)', marginBottom: 'var(--space-4)' }}>
              {apiError}
            </div>
          )}

          {success && (
            <div style={{ padding: 'var(--space-4)', background: 'var(--status-active-bg)', border: '1px solid var(--status-active-border)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-5)', animation: 'fadeSlideIn 0.3s both' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--status-active)', marginBottom: 'var(--space-2)' }}>Invitation sent to {success.email}</div>
              <input readOnly value={`${window.location.origin}/register/${success.token}`} style={{ fontSize: '0.72rem', fontFamily: 'monospace' }} />
              <button className="btn btn-sm btn-ghost" style={{ marginTop: 'var(--space-2)', width: '100%' }} onClick={() => setSuccess(null)}>Dismiss</button>
            </div>
          )}

          <div className="form-group">
            <label>Email Address *</label>
            <input type="email" placeholder="user@organization.com" value={form.email} onChange={e => { setForm(p => ({ ...p, email: e.target.value })); setErrors(p => ({ ...p, email: undefined })); }} className={errors.email ? 'error' : ''} />
            {errors.email && <div className="form-error">{errors.email}</div>}
          </div>

          <div className="form-group">
            <label>Role *</label>
            <select value={form.role_id} onChange={e => { setForm(p => ({ ...p, role_id: e.target.value })); setErrors(p => ({ ...p, role_id: undefined })); }} className={errors.role_id ? 'error' : ''}>
              <option value="">Select role...</option>
              {ROLES.map(r => <option key={r.id} value={r.id}>{r.label}</option>)}
            </select>
            {errors.role_id && <div className="form-error">{errors.role_id}</div>}
          </div>

          {form.role_id && (
            <div className="form-group">
              <label>Organization (optional)</label>
              <select value={form.org_id} onChange={e => setForm(p => ({ ...p, org_id: e.target.value }))}>
                <option value="">None (system-wide)</option>
                {orgs.map(o => <option key={o.org_id} value={o.org_id}>{o.name}</option>)}
              </select>
            </div>
          )}

          <Button variant="primary" style={{ width: '100%', justifyContent: 'center' }} loading={creating} onClick={handleCreate}>
            Send Invitation
          </Button>
        </div>
      </div>
    </div>
  );
}
