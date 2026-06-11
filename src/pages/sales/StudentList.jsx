import { useState, useEffect } from 'react';
import { getAllStudents, updateStudentStatus as apiUpdateStatus } from '../../api/students';
import StatusPill from '../../components/ui/StatusPill';

export default function StudentList() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [toggling, setToggling] = useState(null);

  useEffect(() => {
    getAllStudents().then(setStudents).finally(() => setLoading(false));
  }, []);

  const filtered = students.filter(s => {
    const q = search.toLowerCase();
    return (
      s.first_name?.toLowerCase().includes(q) ||
      s.last_name?.toLowerCase().includes(q) ||
      s.org_name?.toLowerCase().includes(q) ||
      s.student_id?.toLowerCase().includes(q)
    );
  });

  const handleToggleStatus = async (student) => {
    const newStatus = student.status === 'active' ? 'inactive' : 'active';
    setToggling(student.student_id);
    try {
      await apiUpdateStatus(student.student_id, newStatus);
      setStudents(prev => prev.map(s =>
        s.student_id === student.student_id ? { ...s, status: newStatus } : s
      ));
    } finally {
      setToggling(null);
    }
  };

  return (
    <div className="animate-in">
      {confirmDelete && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          background: 'rgba(0,0,0,0.45)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }} onClick={() => setConfirmDelete(null)}>
          <div style={{
            background: 'var(--surface-raised)', borderRadius: 'var(--radius-lg)',
            padding: 'var(--space-8)', maxWidth: 420, width: '90%',
            boxShadow: 'var(--shadow-lg)', border: '1px solid var(--border)',
          }} onClick={e => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 var(--space-2)', color: 'var(--text-primary)' }}>Delete Student</h3>
            <p style={{ margin: '0 0 var(--space-6)', color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.6 }}>
              This will permanently delete <strong>{confirmDelete.first_name} {confirmDelete.last_name}</strong>, their account,
              all deposits, tickets, intake records, and S3 files. If they are the only child linked to a parent, the parent account will also be removed.
              <br /><br />This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary btn-sm" onClick={() => setConfirmDelete(null)}>Cancel</button>
              <button
                className="btn btn-sm"
                style={{ background: 'var(--status-urgent)', color: '#fff', border: 'none' }}
                disabled={deleting === confirmDelete.student_id}
                onClick={() => handleDelete(confirmDelete)}
              >
                {deleting === confirmDelete.student_id ? 'Deleting…' : 'Delete permanently'}
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="page-header">
        <div className="page-header-text">
          <h2>Students</h2>
          <p>Manage student accounts, status, and balances</p>
        </div>
      </div>

      <div style={{ marginBottom: 'var(--space-5)' }}>
        <div className="search-wrapper" style={{ maxWidth: 360 }}>
          <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            type="text"
            className="search-input"
            placeholder="Search by name, org, or ID..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="table-wrapper">
        <table className="table">
          <thead>
            <tr>
              <th>Student</th>
              <th>Organization</th>
              <th>Grade</th>
              <th style={{ width: 120 }}>Balance</th>
              <th style={{ width: 100 }}>Intake</th>
              <th style={{ width: 100 }}>Status</th>
              <th style={{ width: 160 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <tr key={i}>{[1,2,3,4,5,6,7].map(j => (
                  <td key={j}><div className="skeleton" style={{ height: 16, width: '70%' }} /></td>
                ))}</tr>
              ))
            ) : filtered.length === 0 ? (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>No students found</td></tr>
            ) : (
              filtered.map(student => (
                <tr key={student.student_id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: '50%',
                        background: 'var(--accent-light)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-text)',
                        flexShrink: 0,
                      }}>
                        {student.first_name?.[0]}{student.last_name?.[0]}
                      </div>
                      <div>
                        <div style={{ fontWeight: 500 }}>{student.first_name} {student.last_name}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{student.external_student_id}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ fontSize: '0.85rem' }}>{student.org_name}</td>
                  <td>Gr. {student.grade_level}</td>
                  <td>
                    <span style={{
                      fontWeight: 600,
                      color: student.balance < 500 ? 'var(--status-urgent)' : student.balance > 2000 ? 'var(--status-active)' : 'var(--text-primary)',
                    }}>
                      ${student.balance?.toLocaleString('en', { minimumFractionDigits: 2 })}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center' }}>
                      {student.intake_pdf_url ? (
                        <a href={student.intake_pdf_url} target="_blank" rel="noopener noreferrer" title="Download intake PDF"
                          style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: '0.75rem', fontWeight: 600, color: 'var(--accent-text)', textDecoration: 'none' }}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                          PDF
                        </a>
                      ) : null}
                      {student.intake_voice_url ? (
                        <a href={student.intake_voice_url} target="_blank" rel="noopener noreferrer" title="Play voice recording"
                          style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textDecoration: 'none' }}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/></svg>
                          Voice
                        </a>
                      ) : null}
                      {!student.intake_pdf_url && !student.intake_voice_url && (
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>—</span>
                      )}
                    </div>
                  </td>
                  <td><StatusPill status={student.status} /></td>
                  <td>
                    <div className="table-actions" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                      <label className="toggle-wrapper" style={{ cursor: 'pointer' }}>
                        <div className="toggle">
                          <input
                            type="checkbox"
                            checked={student.status === 'active'}
                            onChange={() => handleToggleStatus(student)}
                            disabled={toggling === student.student_id}
                          />
                          <div className="toggle-track" />
                          <div className="toggle-thumb" />
                        </div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {toggling === student.student_id ? 'Saving...' : (student.status === 'active' ? 'Active' : 'Inactive')}
                        </span>
                      </label>
                      <button
                        title="Delete student"
                        disabled={deleting === student.student_id}
                        onClick={() => setConfirmDelete(student)}
                        style={{
                          background: 'none', border: 'none', cursor: 'pointer',
                          color: 'var(--status-urgent)', opacity: deleting === student.student_id ? 0.4 : 0.7,
                          padding: '4px', borderRadius: 'var(--radius-sm)',
                          display: 'flex', alignItems: 'center',
                        }}
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
