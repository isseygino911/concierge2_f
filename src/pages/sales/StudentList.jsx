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
              <th style={{ width: 100 }}>Status</th>
              <th style={{ width: 160 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <tr key={i}>{[1,2,3,4,5,6].map(j => (
                  <td key={j}><div className="skeleton" style={{ height: 16, width: '70%' }} /></td>
                ))}</tr>
              ))
            ) : filtered.length === 0 ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>No students found</td></tr>
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
                  <td><StatusPill status={student.status} /></td>
                  <td>
                    <div className="table-actions">
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
