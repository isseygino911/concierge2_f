import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getOrganizations, updateOrganization } from '../../api/organizations';
import { getAllStudents } from '../../api/students';
import StatusPill from '../../components/ui/StatusPill';
import Button from '../../components/ui/Button';

export default function OrganizationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [org, setOrg] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const numId = parseInt(id, 10);
    Promise.allSettled([
      getOrganizations(),
      getAllStudents(),
    ]).then(([orgsRes, studentsRes]) => {
      const orgs = orgsRes.status === 'fulfilled' ? orgsRes.value : [];
      const allStudents = studentsRes.status === 'fulfilled' ? studentsRes.value : [];

      const found = orgs.find(o => o.org_id === numId || String(o.org_id) === id);
      setOrg(found || null);
      setForm(found || {});
      setStudents(allStudents.filter(s => s.org_id === numId || String(s.org_id) === id));
    }).finally(() => setLoading(false));
  }, [id]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateOrganization(id, form);
      setOrg(p => ({ ...p, ...form }));
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="loading-state"><div className="loading-spinner" /><span>Loading...</span></div>;
  if (!org) return <div style={{ padding: 40, color: 'var(--text-muted)' }}>Organization not found.</div>;

  const activeStudents = students.filter(s => s.status === 'active').length;

  return (
    <div className="animate-in">
      <button className="btn btn-ghost btn-sm" style={{ marginBottom: 'var(--space-4)' }} onClick={() => navigate('/sales/organizations')}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
        Back to Organizations
      </button>

      <div className="page-header">
        <div className="page-header-text">
          <h2>{org.name}</h2>
          <p>{[org.city, org.province].filter(Boolean).join(', ')} · ID {org.org_id}</p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          <StatusPill status={org.status} />
          <Button variant="secondary" onClick={() => setEditing(e => !e)}>
            {editing ? 'Cancel' : 'Edit'}
          </Button>
        </div>
      </div>

      {editing && (
        <div className="card" style={{ marginBottom: 'var(--space-6)', animation: 'fadeSlideIn 0.25s both' }}>
          <div className="card-header">
            <span className="card-title">Edit Organization</span>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Name</label>
              <input value={form.name || ''} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
            </div>
            <div className="form-group">
              <label>Contact Email</label>
              <input value={form.contact_email || ''} onChange={e => setForm(p => ({ ...p, contact_email: e.target.value }))} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>City</label>
              <input value={form.city || ''} onChange={e => setForm(p => ({ ...p, city: e.target.value }))} />
            </div>
            <div className="form-group">
              <label>Province</label>
              <input value={form.province || ''} onChange={e => setForm(p => ({ ...p, province: e.target.value }))} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Contact Phone</label>
              <input value={form.contact_phone || ''} onChange={e => setForm(p => ({ ...p, contact_phone: e.target.value }))} />
            </div>
            <div className="form-group">
              <label>Address</label>
              <input value={form.address || ''} onChange={e => setForm(p => ({ ...p, address: e.target.value }))} />
            </div>
          </div>
          <Button variant="primary" loading={saving} onClick={handleSave}>Save Changes</Button>
        </div>
      )}

      <div className="stat-row" style={{ gridTemplateColumns: 'repeat(2, 1fr)', marginBottom: 'var(--space-6)' }}>
        <div className="stat-card">
          <div className="stat-card-label">Total Students</div>
          <div className="stat-card-value">{students.length}</div>
          <div className="stat-card-sub">enrolled</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-label">Active Students</div>
          <div className="stat-card-value">{activeStudents}</div>
          <div className="stat-card-sub">{students.length - activeStudents} inactive</div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-6)' }}>
          {[
            ['Email', org.contact_email],
            ['Phone', org.contact_phone],
            ['Address', org.address],
          ].map(([label, value]) => (
            <div key={label}>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 4 }}>{label}</div>
              <div style={{ fontSize: '0.9rem' }}>{value || '—'}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="table-wrapper">
        <table className="table">
          <thead>
            <tr>
              <th>Student</th>
              <th>Grade</th>
              <th>Balance</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {students.length === 0 ? (
              <tr><td colSpan={4} style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>No students enrolled</td></tr>
            ) : students.map(s => (
              <tr key={s.student_id}>
                <td>
                  <div style={{ fontWeight: 500 }}>{s.first_name} {s.last_name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{s.email}</div>
                </td>
                <td>{s.grade_level ? `Grade ${s.grade_level}` : '—'}</td>
                <td style={{ fontWeight: 600 }}>${parseFloat(s.balance || 0).toLocaleString()}</td>
                <td><StatusPill status={s.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
