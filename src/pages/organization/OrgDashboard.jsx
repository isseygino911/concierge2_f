import { useState, useEffect } from 'react';
import { getOrgRoster, getOrgStats } from '../../api/organizations';
import { getNotifications } from '../../api/notifications';
import StatusPill from '../../components/ui/StatusPill';

export default function OrgDashboard() {
  const [roster, setRoster] = useState([]);
  const [stats, setStats] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getOrgRoster(), getOrgStats(), getNotifications()])
      .then(([r, s, n]) => { setRoster(r); setStats(s); setNotifications(n.slice(0, 5)); })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="animate-in">
      <div className="page-header">
        <div className="page-header-text">
          <h2>Organization Dashboard</h2>
          <p>Student roster and program overview</p>
        </div>
      </div>

      <div className="stat-row" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: 'var(--space-6)' }}>
        {[
          { label: 'Total Students', value: loading ? '—' : roster.length },
          { label: 'Active Tickets', value: loading ? '—' : stats?.ticketCount ?? '—' },
          { label: 'Total Spend', value: loading ? '—' : `$${(stats?.totalSpend || 0).toLocaleString()}` },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className="stat-card-label">{s.label}</div>
            <div className="stat-card-value">{s.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 'var(--space-6)' }}>
        {/* Roster */}
        <div>
          <div className="section-title" style={{ marginBottom: 'var(--space-4)' }}>Student Roster</div>
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th style={{ width: 100 }}>Grade</th>
                  <th style={{ width: 100 }}>Tickets</th>
                  <th style={{ width: 120 }}>Spend</th>
                  <th style={{ width: 100 }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i}>{[1,2,3,4,5].map(j => <td key={j}><div className="skeleton" style={{ height: 16, width: '70%' }} /></td>)}</tr>
                  ))
                ) : roster.length === 0 ? (
                  <tr><td colSpan={5} style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>No students enrolled</td></tr>
                ) : (
                  roster.map(s => (
                    <tr key={s.student_id}>
                      <td>
                        <div style={{ fontWeight: 500 }}>{s.first_name} {s.last_name}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{s.student_id}</div>
                      </td>
                      <td>Grade {s.grade_level}</td>
                      <td style={{ fontWeight: 600 }}>—</td>
                      <td>—</td>
                      <td><StatusPill status={s.status || 'active'} /></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Notifications */}
        <div className="card">
          <div className="card-title" style={{ marginBottom: 'var(--space-4)' }}>Recent Notifications</div>
          {notifications.map((n, i) => (
            <div key={n.notification_id} style={{
              padding: 'var(--space-3) 0',
              borderBottom: i < notifications.length - 1 ? '1px solid var(--border)' : 'none',
              display: 'flex',
              gap: 'var(--space-3)',
            }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: n.is_read ? 'var(--border)' : 'var(--accent)', marginTop: 6, flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: '0.825rem', color: n.is_read ? 'var(--text-muted)' : 'var(--text-primary)', lineHeight: 1.5 }}>
                  {n.message}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 2 }}>
                  {new Date(n.created_at).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
