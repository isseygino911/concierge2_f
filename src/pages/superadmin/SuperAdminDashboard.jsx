import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAdminQueue, assignTicket } from '../../api/tickets';
import StatusPill from '../../components/ui/StatusPill';
import Button from '../../components/ui/Button';

export default function SuperAdminDashboard() {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterOrg, setFilterOrg] = useState('all');
  const [assigning, setAssigning] = useState(null);

  useEffect(() => {
    getAdminQueue().then(setTickets).finally(() => setLoading(false));
  }, []);

  const orgs = [...new Set(tickets.map(t => t.org_name).filter(Boolean))];

  const filtered = tickets
    .filter(t => filterStatus === 'all' || t.status === filterStatus)
    .filter(t => filterOrg === 'all' || t.org_name === filterOrg);

  const handleAssign = async (ticketId, adminId) => {
    if (!adminId) return;
    setAssigning(ticketId);
    try {
      await assignTicket(ticketId, adminId);
      setTickets(prev => prev.map(t => t.ticket_id === ticketId ? { ...t, assigned_admin_id: Number(adminId) } : t));
    } finally {
      setAssigning(null);
    }
  };

  return (
    <div className="animate-in">
      <div className="page-header">
        <div className="page-header-text">
          <h2>All Tickets</h2>
          <p>System-wide ticket view — all organizations</p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          <Button variant="secondary" onClick={() => navigate('/super-admin/users')}>User Management</Button>
          <Button variant="secondary" onClick={() => navigate('/super-admin/categories')}>Categories</Button>
        </div>
      </div>

      {/* Summary */}
      <div className="stat-row" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: 'var(--space-6)' }}>
        {[
          ['Total', tickets.length, 'all tickets'],
          ['Open', tickets.filter(t => t.status === 'open').length, 'awaiting action'],
          ['Urgent', tickets.filter(t => t.priority === 'urgent').length, 'require immediate attention'],
          ['Unassigned', tickets.filter(t => !t.assigned_to).length, 'no admin assigned'],
        ].map(([label, val, sub]) => (
          <div key={label} className="stat-card">
            <div className="stat-card-label">{label}</div>
            <div className="stat-card-value">{loading ? '—' : val}</div>
            <div className="stat-card-sub">{sub}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 'var(--space-5)', marginBottom: 'var(--space-5)', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Status:</span>
          {['all', 'open', 'in_progress', 'completed'].map(s => (
            <button key={s} className={`btn btn-sm ${filterStatus === s ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setFilterStatus(s)}>
              {s === 'all' ? 'All' : s.replace('_', ' ')}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Org:</span>
          <select value={filterOrg} onChange={e => setFilterOrg(e.target.value)} style={{ width: 'auto' }}>
            <option value="all">All organizations</option>
            {orgs.map(o => <option key={o}>{o}</option>)}
          </select>
        </div>
      </div>

      <div className="table-wrapper">
        <table className="table">
          <thead>
            <tr>
              <th>Ticket ID</th>
              <th>Title</th>
              <th>Student</th>
              <th>Organization</th>
              <th style={{ width: 100 }}>Priority</th>
              <th style={{ width: 100 }}>Status</th>
              <th style={{ width: 160 }}>Assigned To</th>
              <th style={{ width: 80 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>{[1,2,3,4,5,6,7,8].map(j => (
                  <td key={j}><div className="skeleton" style={{ height: 16, width: '70%' }} /></td>
                ))}</tr>
              ))
            ) : filtered.length === 0 ? (
              <tr><td colSpan={8} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>No tickets found</td></tr>
            ) : (
              filtered.map(ticket => (
                <tr key={ticket.ticket_id}>
                  <td style={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>{ticket.ticket_id}</td>
                  <td style={{ maxWidth: 200 }}>
                    <div style={{ fontWeight: 500, fontSize: '0.875rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {ticket.title}
                    </div>
                  </td>
                  <td style={{ fontSize: '0.875rem' }}>{ticket.student_name}</td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{ticket.org_name}</td>
                  <td><StatusPill status={ticket.priority} /></td>
                  <td><StatusPill status={ticket.status} /></td>
                  <td>
                    <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                      <input
                        type="number"
                        placeholder="User ID"
                        defaultValue={ticket.assigned_admin_id || ''}
                        id={`assign-${ticket.ticket_id}`}
                        style={{ fontSize: '0.8rem', padding: '4px 8px', width: 80 }}
                        disabled={assigning === ticket.ticket_id}
                      />
                      <Button size="sm" variant="ghost" disabled={assigning === ticket.ticket_id} onClick={() => {
                        const val = document.getElementById(`assign-${ticket.ticket_id}`)?.value;
                        handleAssign(ticket.ticket_id, val);
                      }}>Set</Button>
                    </div>
                  </td>
                  <td>
                    <Button size="sm" variant="ghost" onClick={() => navigate(`/admin/tickets/${ticket.ticket_id}`)}>
                      View
                    </Button>
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
