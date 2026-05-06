import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAdminQueue } from '../../api/tickets';
import StatusPill from '../../components/ui/StatusPill';

const priorityWeight = { urgent: 0, high: 1, medium: 2, low: 3 };

const priorityStyle = {
  urgent: {
    border: '1px solid var(--status-urgent-border)',
    borderLeft: '4px solid var(--status-urgent)',
    background: 'var(--status-urgent-bg)',
  },
  high: {
    border: '1px solid var(--border)',
    borderLeft: '4px solid var(--accent)',
    background: 'var(--surface-raised)',
  },
  medium: {
    border: '1px solid var(--border)',
    borderLeft: '4px solid var(--status-pending)',
    background: 'var(--surface-raised)',
  },
  low: {
    border: '1px solid var(--border)',
    borderLeft: '3px solid var(--border)',
    background: 'var(--surface-raised)',
  },
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');

  useEffect(() => {
    getAdminQueue().then(setTickets).finally(() => setLoading(false));
  }, []);

  const filtered = tickets
    .filter(t => filterStatus === 'all' || t.status === filterStatus)
    .filter(t => filterPriority === 'all' || t.priority === filterPriority)
    .sort((a, b) => (priorityWeight[a.priority] ?? 9) - (priorityWeight[b.priority] ?? 9));

  const openCount = tickets.filter(t => t.status === 'open').length;
  const urgentCount = tickets.filter(t => t.priority === 'urgent').length;

  return (
    <div className="animate-in">
      <div className="page-header">
        <div className="page-header-text">
          <h2>Ticket Queue</h2>
          <p>Tickets assigned to you — {openCount} open, {urgentCount} urgent</p>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 'var(--space-4)', marginBottom: 'var(--space-6)', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Status:</span>
          {['all', 'open', 'in_progress', 'completed'].map(s => (
            <button
              key={s}
              className={`btn btn-sm ${filterStatus === s ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setFilterStatus(s)}
            >
              {s === 'all' ? 'All' : s.replace('_', ' ')}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Priority:</span>
          {['all', 'urgent', 'high', 'medium', 'low'].map(p => (
            <button
              key={p}
              className={`btn btn-sm ${filterPriority === p ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setFilterPriority(p)}
            >
              {p === 'all' ? 'All' : p}
            </button>
          ))}
        </div>
      </div>

      {/* Ticket list — varied layout based on priority */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {[1,2,3,4].map(i => (
            <div key={i} className="skeleton" style={{ height: 80, borderRadius: 'var(--radius-lg)' }} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-title">No tickets found</div>
          <p className="empty-state-desc">Adjust your filters or wait for new assignments.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {filtered.map(ticket => (
            <div
              key={ticket.ticket_id}
              onClick={() => navigate(`/admin/tickets/${ticket.ticket_id}`)}
              style={{
                ...priorityStyle[ticket.priority] || priorityStyle.medium,
                borderRadius: 'var(--radius-lg)',
                padding: ticket.priority === 'urgent' ? 'var(--space-5) var(--space-6)' : 'var(--space-4) var(--space-5)',
                cursor: 'pointer',
                transition: 'box-shadow var(--transition-fast), transform var(--transition-fast)',
                boxShadow: 'var(--shadow-sm)',
              }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = 'var(--shadow-md)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; e.currentTarget.style.transform = ''; }}
            >
              {/* Urgent gets a bigger layout */}
              {ticket.priority === 'urgent' ? (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-3)' }}>
                    <span style={{ fontSize: '0.65rem', fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--status-urgent)', background: 'var(--status-urgent-border)', padding: '2px 8px', borderRadius: 4 }}>URGENT</span>
                    <span style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--text-muted)' }}>{ticket.ticket_id}</span>
                    <StatusPill status={ticket.status} />
                  </div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: 'var(--space-2)', color: 'var(--status-urgent)' }}>{ticket.title}</div>
                  <div style={{ display: 'flex', gap: 'var(--space-5)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    <span>{ticket.student_name}</span>
                    <span>{ticket.org_name}</span>
                    <span>{new Date(ticket.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-5)' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 4 }}>
                      <span style={{ fontWeight: 500, fontSize: '0.925rem' }}>{ticket.title}</span>
                      <span style={{ fontFamily: 'monospace', fontSize: '0.72rem', color: 'var(--text-muted)' }}>{ticket.ticket_id}</span>
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      {ticket.student_name} · {ticket.org_name}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center', flexShrink: 0 }}>
                    <StatusPill status={ticket.priority} />
                    <StatusPill status={ticket.status} />
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{ticket.assigned_to || 'Unassigned'}</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
