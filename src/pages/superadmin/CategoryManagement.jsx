import { useState, useEffect } from 'react';
import { getAllCategories, createCategory, updateCategory, deleteCategory } from '../../api/tickets';
import Button from '../../components/ui/Button';

export default function CategoryManagement() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', cost: '', description: '' });
  const [editId, setEditId] = useState(null);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    getAllCategories().then(setCategories).finally(() => setLoading(false));
  }, []);

  const validate = () => {
    const e = {};
    if (!form.name) e.name = 'Name is required';
    return e;
  };

  const handleSave = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setSaving(true);
    try {
      const payload = { category_name: form.name, cost: Number(form.cost) || 0, description: form.description };
      if (editId) {
        await updateCategory(editId, payload);
        setCategories(prev => prev.map(c => c.category_id === editId ? { ...c, category_name: form.name, cost: Number(form.cost) } : c));
        setEditId(null);
      } else {
        const result = await createCategory(payload);
        setCategories(prev => [...prev, { category_name: form.name, category_id: result.categoryId || Date.now(), cost: Number(form.cost) || 0, description: form.description }]);
      }
      setForm({ name: '', cost: '', description: '' });
      setErrors({});
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (cat) => {
    setEditId(cat.category_id);
    setForm({ name: cat.category_name, cost: String(cat.cost || ''), description: cat.description || '' });
  };

  const handleDelete = async (id) => {
    setDeleting(id);
    try {
      await deleteCategory(id);
      setCategories(prev => prev.filter(c => c.category_id !== id));
    } finally {
      setDeleting(null);
      setDeleteConfirm(null);
    }
  };

  return (
    <div className="animate-in">
      <div className="page-header">
        <div className="page-header-text">
          <h2>Ticket Categories</h2>
          <p>Manage service categories and their associated costs</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 'var(--space-6)', alignItems: 'start' }}>
        {/* Category list */}
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Category</th>
                <th>Description</th>
                <th style={{ width: 100 }}>Cost (CAD)</th>
                <th style={{ width: 140 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>{[1,2,3,4].map(j => <td key={j}><div className="skeleton" style={{ height: 16, width: '70%' }} /></td>)}</tr>
                ))
              ) : categories.length === 0 ? (
                <tr><td colSpan={4} style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>No categories yet</td></tr>
              ) : (
                categories.map(cat => (
                  <tr key={cat.category_id}>
                    <td style={{ fontWeight: 500 }}>{cat.category_name}</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{cat.description || '—'}</td>
                    <td style={{ fontWeight: 600 }}>{cat.cost > 0 ? `$${cat.cost}` : 'Free'}</td>
                    <td>
                      <div className="table-actions">
                        <Button size="sm" variant="secondary" onClick={() => handleEdit(cat)}>Edit</Button>
                        {deleteConfirm === cat.category_id ? (
                          <div style={{ display: 'flex', gap: 4 }}>
                            <Button size="sm" variant="danger" loading={deleting === cat.category_id} onClick={() => handleDelete(cat.category_id)}>Confirm</Button>
                            <Button size="sm" variant="ghost" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
                          </div>
                        ) : (
                          <Button size="sm" variant="danger" onClick={() => setDeleteConfirm(cat.category_id)}>Delete</Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Add / Edit form */}
        <div className="card">
          <div className="card-title" style={{ marginBottom: 'var(--space-5)' }}>
            {editId ? 'Edit Category' : 'New Category'}
          </div>

          <div className="form-group">
            <label>Category Name *</label>
            <input type="text" placeholder="e.g. Medical, Logistics" value={form.name} onChange={e => { setForm(p => ({ ...p, name: e.target.value })); setErrors(p => ({ ...p, name: undefined })); }} className={errors.name ? 'error' : ''} />
            {errors.name && <div className="form-error">{errors.name}</div>}
          </div>

          <div className="form-group">
            <label>Service Cost (CAD)</label>
            <input type="number" min="0" placeholder="0" value={form.cost} onChange={e => setForm(p => ({ ...p, cost: e.target.value }))} />
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 4 }}>Leave 0 for no charge</div>
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea rows={3} placeholder="Describe what this category covers..." value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} style={{ resize: 'none' }} />
          </div>

          <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
            {editId && (
              <Button variant="ghost" onClick={() => { setEditId(null); setForm({ name: '', cost: '', description: '' }); setErrors({}); }}>
                Cancel
              </Button>
            )}
            <Button variant="primary" style={{ flex: 1, justifyContent: 'center' }} loading={saving} onClick={handleSave}>
              {editId ? 'Save Changes' : 'Add Category'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
