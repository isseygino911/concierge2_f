import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { getOrganizations, createOrganization, updateOrganization } from '../../api/organizations';
import StatusPill from '../../components/ui/StatusPill';
import Button from '../../components/ui/Button';

function OrgPanel({ org, onClose, onSave }) {
  const [form, setForm] = useState(org || { name: '', city: '', province: '', address: '', contact_email: '', contact_phone: '' });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const isNew = !org;

  const validate = () => {
    const e = {};
    if (!form.name) e.name = 'Organization name is required';
    if (!form.contact_email) e.contact_email = 'Contact email is required';
    return e;
  };

  const handleSave = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setSaving(true);
    try {
      await onSave(form);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const f = (field) => ({
    value: form[field] || '',
    onChange: e => { setForm(p => ({ ...p, [field]: e.target.value })); setErrors(p => ({ ...p, [field]: undefined })); },
    className: errors[field] ? 'error' : '',
  });

  return createPortal(
    <>
      <div className="panel-overlay" onClick={onClose} />
      <div className="panel">
        <div className="panel-header">
          <h3 className="panel-title">{isNew ? 'New Organization' : 'Edit Organization'}</h3>
          <button className="btn btn-ghost btn-icon" onClick={onClose} aria-label="Close">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div className="panel-body">
          <div className="form-group">
            <label>Organization Name *</label>
            <input type="text" placeholder="e.g. Shanghai Academy International" {...f('name')} />
            {errors.name && <div className="form-error">{errors.name}</div>}
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>City</label>
              <input type="text" placeholder="e.g. Shanghai" {...f('city')} />
            </div>
            <div className="form-group">
              <label>Province / Region</label>
              <input type="text" placeholder="e.g. 上海 / Guangdong" {...f('province')} />
            </div>
          </div>
          <div className="form-group">
            <label>Address</label>
            <input type="text" placeholder="Full address" {...f('address')} />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Contact Email *</label>
              <input type="email" placeholder="admin@school.cn" {...f('contact_email')} />
              {errors.contact_email && <div className="form-error">{errors.contact_email}</div>}
            </div>
            <div className="form-group">
              <label>Contact Phone</label>
              <input type="text" placeholder="+86 21 xxxx xxxx" {...f('contact_phone')} />
            </div>
          </div>
        </div>
        <div className="panel-footer">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant="primary" loading={saving} onClick={handleSave}>
            {isNew ? 'Create Organization' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </>,
    document.body
  );
}

export default function OrganizationList() {
  const navigate = useNavigate();
  const [orgs, setOrgs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [panelOrg, setPanelOrg] = useState(undefined); // undefined=closed, null=new, obj=edit

  useEffect(() => {
    getOrganizations().then(setOrgs).finally(() => setLoading(false));
  }, []);

  const filtered = orgs.filter(o =>
    o.name.toLowerCase().includes(search.toLowerCase()) ||
    o.city?.toLowerCase().includes(search.toLowerCase())
  );

  const handleSave = async (form) => {
    if (form.org_id) {
      await updateOrganization(form.org_id, form);
      setOrgs(prev => prev.map(o => o.org_id === form.org_id ? { ...o, ...form } : o));
    } else {
      const newOrg = await createOrganization(form);
      setOrgs(prev => [{ ...newOrg, student_count: 0 }, ...prev]);
    }
  };

  return (
    <div className="animate-in">
      <div className="page-header">
        <div className="page-header-text">
          <h2>Organizations</h2>
          <p>Manage partner schools and institutions</p>
        </div>
        <Button variant="primary" onClick={() => setPanelOrg(null)}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          New Organization
        </Button>
      </div>

      {/* Search */}
      <div style={{ marginBottom: 'var(--space-5)' }}>
        <div className="search-wrapper" style={{ maxWidth: 360 }}>
          <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            type="text"
            className="search-input"
            placeholder="Search organizations..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="table-wrapper">
        <table className="table">
          <thead>
            <tr>
              <th>Organization</th>
              <th>Location</th>
              <th style={{ width: 100 }}>Students</th>
              <th style={{ width: 100 }}>Status</th>
              <th style={{ width: 140 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  {[1,2,3,4,5].map(j => (
                    <td key={j}><div className="skeleton" style={{ height: 16, width: j === 5 ? 80 : '70%' }} /></td>
                  ))}
                </tr>
              ))
            ) : filtered.length === 0 ? (
              <tr><td colSpan={5} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>No organizations found</td></tr>
            ) : (
              filtered.map(org => (
                <tr key={org.org_id}>
                  <td>
                    <div style={{ fontWeight: 500 }}>{org.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{org.org_id}</div>
                  </td>
                  <td>
                    <div>{org.city}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{org.province}</div>
                  </td>
                  <td style={{ fontWeight: 600 }}>{org.student_count || 0}</td>
                  <td><StatusPill status={org.status} /></td>
                  <td>
                    <div className="table-actions">
                      <Button size="sm" variant="secondary" onClick={() => navigate(`/sales/organizations/${org.org_id}`)}>
                        View
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setPanelOrg(org)}>
                        Edit
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {panelOrg !== undefined && (
        <OrgPanel
          org={panelOrg}
          onClose={() => setPanelOrg(undefined)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
