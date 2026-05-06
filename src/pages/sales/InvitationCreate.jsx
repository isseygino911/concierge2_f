import { useState, useEffect } from 'react';
import { getOrganizations } from '../../api/organizations';
import { generateInvitation, getInvitations } from '../../api/students';
import StatusPill from '../../components/ui/StatusPill';
import Button from '../../components/ui/Button';

function useCountdown(expiresAt) {
  const [remaining, setRemaining] = useState('');

  useEffect(() => {
    if (!expiresAt) return;
    const tick = () => {
      const diff = new Date(expiresAt).getTime() - Date.now();
      if (diff <= 0) { setRemaining('Expired'); return; }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      setRemaining(`${d}d ${h}h ${m}m remaining`);
    };
    tick();
    const id = setInterval(tick, 60000);
    return () => clearInterval(id);
  }, [expiresAt]);

  return remaining;
}

function GeneratedLink({ link, expiresAt, orgName }) {
  const [copied, setCopied] = useState(false);
  const countdown = useCountdown(expiresAt);

  const handleCopy = () => {
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{
      background: 'var(--status-active-bg)',
      border: '1px solid var(--status-active-border)',
      borderRadius: 'var(--radius-lg)',
      padding: 'var(--space-5)',
      marginTop: 'var(--space-5)',
      animation: 'fadeSlideIn 0.3s both',
    }}>
      <div style={{ fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--status-active)', marginBottom: 'var(--space-3)' }}>
        Invitation Link Generated
      </div>
      <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center', marginBottom: 'var(--space-3)' }}>
        <input
          readOnly
          value={link}
          style={{ flex: 1, fontFamily: 'monospace', fontSize: '0.8rem', background: 'var(--surface-raised)', borderColor: 'var(--status-active-border)' }}
        />
        <Button variant="primary" size="sm" onClick={handleCopy}>
          {copied ? (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              Copied
            </>
          ) : 'Copy'}
        </Button>
      </div>
      {!!orgName && (
        <div style={{ fontSize: '0.78rem', color: 'var(--status-active)', marginBottom: 6 }}>
          Organization: <span style={{ fontWeight: 700 }}>{orgName}</span>
        </div>
      )}

      <div style={{ fontSize: '0.78rem', color: 'var(--status-active)' }}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: 4, verticalAlign: 'middle' }}>
          <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
        </svg>
        {countdown}
      </div>
    </div>
  );
}

function timeFromNow(dateStr) {
  const diff = new Date(dateStr).getTime() - Date.now();
  if (diff < 0) return 'Expired';
  const d = Math.floor(diff / 86400000);
  return `${d}d left`;
}

function InvitationRow({ inv }) {
  const [copied, setCopied] = useState(false);

  const buildLink = () => {
    const params = new URLSearchParams();
    if (inv.org_name) params.set('org', inv.org_name);
    if (inv.org_id) params.set('org_id', inv.org_id);
    const qs = params.toString();
    return `${window.location.origin}/register/${inv.token}${qs ? `?${qs}` : ''}`;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(buildLink());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <tr>
      <td style={{ fontWeight: 500, fontSize: '0.85rem' }}>{inv.email}</td>
      <td style={{ fontSize: '0.85rem' }}>{inv.org_name || '—'}</td>
      <td>
        <span style={{
          padding: '2px 8px',
          borderRadius: 12,
          fontSize: '0.72rem',
          fontWeight: 600,
          background: inv.role === 'student' ? 'var(--accent-light)' : 'var(--status-completed-bg)',
          color: inv.role === 'student' ? 'var(--accent-text)' : 'var(--status-completed)',
        }}>
          {inv.role}
        </span>
      </td>
      <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{timeFromNow(inv.expires_at)}</td>
      <td><StatusPill status={inv.status} /></td>
      <td>
        {inv.status === 'pending' && inv.token && (
          <button
            onClick={handleCopy}
            title="Copy invitation link"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              padding: '3px 10px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer',
              border: '1px solid var(--border)',
              background: copied ? 'var(--status-active-bg)' : 'var(--surface-raised)',
              color: copied ? 'var(--status-active)' : 'var(--text-muted)',
              transition: 'all 0.15s',
              whiteSpace: 'nowrap',
            }}
          >
            {copied ? (
              <>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                Copied
              </>
            ) : (
              <>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                Copy URL
              </>
            )}
          </button>
        )}
      </td>
    </tr>
  );
}

export default function InvitationCreate() {
  const [orgs, setOrgs] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [form, setForm] = useState({ email: '', org_id: '', role: 'student' });
  const [errors, setErrors] = useState({});
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(null);

  useEffect(() => {
    Promise.all([getOrganizations(), getInvitations()])
      .then(([o, i]) => { setOrgs(o); setInvitations(i); });
  }, []);

  const validate = () => {
    const e = {};
    if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Valid email required';
    if (!form.org_id) e.org_id = 'Please select an organization';
    return e;
  };

  const handleGenerate = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setGenerating(true);
    setGenerated(null);
    try {
      const result = await generateInvitation(form.email, form.org_id, form.role);
      const orgName = orgs.find(o => o.org_id === form.org_id)?.name || '';
      const link = `${window.location.origin}/register/${result.token}?org=${encodeURIComponent(orgName)}&org_id=${encodeURIComponent(form.org_id)}`;
      setGenerated({ link, expiresAt: result.expiresAt, orgName });
      setInvitations(prev => [
        {
          token_id: result.token,
          token: result.token,
          email: form.email,
          org_id: form.org_id,
          org_name: orgName,
          role: form.role,
          status: 'pending',
          expires_at: result.expiresAt,
          created_at: new Date().toISOString(),
        },
        ...prev,
      ]);
      setForm({ email: '', org_id: '', role: 'student' });
      setErrors({});
    } finally {
      setGenerating(false);
    }
  };

  const f = (field) => ({
    value: form[field],
    onChange: e => { setForm(p => ({ ...p, [field]: e.target.value })); setErrors(p => ({ ...p, [field]: undefined })); },
    className: errors[field] ? 'error' : '',
  });

  return (
    <div className="animate-in">
      <div className="page-header">
        <div className="page-header-text">
          <h2>Invitation Links</h2>
          <p>Generate one-time onboarding links for students and parents</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '440px 1fr', gap: 'var(--space-6)', alignItems: 'start' }}>
        {/* Form */}
        <div className="card">
          <div className="card-title" style={{ marginBottom: 'var(--space-5)' }}>Generate New Invitation</div>

          <div className="form-group">
            <label>Recipient Email *</label>
            <input type="email" placeholder="student@school.cn" {...f('email')} />
            {errors.email && <div className="form-error">{errors.email}</div>}
          </div>

          <div className="form-group">
            <label>Organization *</label>
            <select {...f('org_id')}>
              <option value="">Select organization...</option>
              {orgs.map(o => (
                <option key={o.org_id} value={o.org_id}>{o.name}</option>
              ))}
            </select>
            {errors.org_id && <div className="form-error">{errors.org_id}</div>}
          </div>

          <div className="form-group">
            <label>Role</label>
            <select {...f('role')}>
              <option value="student">Student</option>
              <option value="parent">Parent</option>
            </select>
          </div>

          <Button
            variant="primary"
            style={{ width: '100%', justifyContent: 'center' }}
            loading={generating}
            onClick={handleGenerate}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/>
            </svg>
            Generate Invitation Link
          </Button>

          {generated && (
            <GeneratedLink
              link={generated.link}
              expiresAt={generated.expiresAt}
              orgName={generated.orgName}
            />
          )}
        </div>

        {/* Recent invitations */}
        <div>
          <div className="section-title" style={{ marginBottom: 'var(--space-4)' }}>Recent Invitations</div>
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Organization</th>
                  <th>Role</th>
                  <th>Expires</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {invitations.length === 0 ? (
                  <tr><td colSpan={6} style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>No invitations yet</td></tr>
                ) : invitations.map((inv, i) => (
                  <InvitationRow key={inv.token_id || i} inv={inv} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
