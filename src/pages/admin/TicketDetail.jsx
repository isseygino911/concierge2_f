import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getAdminQueue, getMyTickets, getComments, addComment, updateTicketStatus, assignTicket } from '../../api/tickets';
import StatusPill from '../../components/ui/StatusPill';
import Button from '../../components/ui/Button';

function initials(name) {
  if (!name) return '?';
  const parts = name.trim().split(' ');
  return (parts[0]?.[0] || '') + (parts[1]?.[0] || '');
}

function roleColor(role) {
  if (role === 'student') return 'var(--accent-light)';
  if (role === 'admin' || role === 'super_admin') return 'var(--status-active-bg)';
  if (role === 'vendor') return 'var(--status-pending-bg)';
  return 'var(--content-bg)';
}

function roleFontColor(role) {
  if (role === 'student') return 'var(--accent-text)';
  if (role === 'admin' || role === 'super_admin') return 'var(--status-active)';
  if (role === 'vendor') return 'var(--status-pending)';
  return 'var(--text-primary)';
}

function timeStr(dateStr) {
  return new Date(dateStr).toLocaleString('en', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

const priorityBorderColor = {
  urgent: 'var(--status-urgent)',
  high: 'var(--accent)',
  medium: 'var(--status-pending)',
  low: 'var(--border)',
};

export default function TicketDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [ticket, setTicket] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [sending, setSending] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [commentError, setCommentError] = useState('');
  const commentEndRef = useRef(null);

  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';
  const backPath = isAdmin ? '/admin' : '/student';
  const ticketId = parseInt(id, 10) || id;

  useEffect(() => {
    const fetchTicket = isAdmin ? getAdminQueue : getMyTickets;
    fetchTicket().then(tickets => {
      const found = tickets.find(t => t.ticket_id === ticketId || String(t.ticket_id) === id);
      if (found) {
        setTicket(found);
        setSelectedStatus(found.status || '');
      }
    });
    getComments(id).then(setComments);
  }, [id, isAdmin, ticketId]);

  useEffect(() => {
    commentEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [comments]);

  const handleSendComment = async () => {
    if (!newComment.trim()) return;
    setSending(true);
    setCommentError('');
    try {
      await addComment(id, newComment);
      setComments(prev => [...prev, {
        comment_id: Date.now(),
        user_role: user?.role,
        comment: newComment,
        created_at: new Date().toISOString(),
      }]);
      setNewComment('');
    } catch (err) {
      setCommentError(err.response?.data?.error || 'Failed to send comment');
    } finally {
      setSending(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    setUpdatingStatus(true);
    try {
      await updateTicketStatus(ticket.ticket_id, newStatus);
      setTicket(t => ({ ...t, status: newStatus }));
      setSelectedStatus(newStatus);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleAssign = async (adminId) => {
    if (!adminId) return;
    await assignTicket(ticket.ticket_id, adminId);
    setTicket(t => ({ ...t, assigned_admin_id: Number(adminId) }));
  };

  if (!ticket) return <div className="loading-state"><div className="loading-spinner" /><span>Loading...</span></div>;

  return (
    <div className="animate-in">
      <button className="btn btn-ghost btn-sm" style={{ marginBottom: 'var(--space-4)' }} onClick={() => navigate(backPath)}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
        Back
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 'var(--space-6)', alignItems: 'start' }}>
        <div>
          <div className="card" style={{ marginBottom: 'var(--space-5)', borderLeft: `4px solid ${priorityBorderColor[ticket.priority] || 'var(--border)'}` }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
              <div>
                <div style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: 'var(--text-muted)', marginBottom: 'var(--space-2)' }}>
                  #{ticket.ticket_id}
                </div>
                <h2 style={{ marginBottom: 'var(--space-3)', fontSize: '1.3rem' }}>{ticket.title}</h2>
                <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
                  <StatusPill status={ticket.status} />
                  <StatusPill status={ticket.priority} label={`${ticket.priority} priority`} />
                </div>
              </div>
            </div>

            <div style={{ background: 'var(--content-bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: 'var(--space-4)', lineHeight: 1.7, fontSize: '0.9rem' }}>
              {ticket.description}
            </div>
          </div>

          <div className="card">
            <div className="card-title" style={{ marginBottom: 'var(--space-5)' }}>Discussion</div>

            <div className="comment-thread" style={{ marginBottom: 'var(--space-6)' }}>
              {comments.length === 0 ? (
                <div style={{ padding: 'var(--space-6)', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                  No comments yet. Be the first to respond.
                </div>
              ) : (
                comments.map((c, i) => (
                  <div key={c.comment_id || i} className="comment" style={{ animationDelay: `${i * 0.05}s` }}>
                    <div className="comment-avatar" style={{ background: roleColor(c.user_role), color: roleFontColor(c.user_role) }}>
                      {initials(c.user_role)}
                    </div>
                    <div className="comment-body">
                      <div className="comment-meta">
                        <span style={{ fontSize: '0.72rem', padding: '1px 8px', borderRadius: 10, background: roleColor(c.user_role), color: roleFontColor(c.user_role), fontWeight: 600 }}>
                          {c.user_role?.replace('_', ' ')}
                        </span>
                        <span className="comment-time">{timeStr(c.created_at)}</span>
                      </div>
                      <div className="comment-text">{c.comment}</div>
                    </div>
                  </div>
                ))
              )}
              <div ref={commentEndRef} />
            </div>

            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 'var(--space-5)' }}>
              {commentError && (
                <div style={{ padding: 'var(--space-3) var(--space-4)', background: 'var(--status-urgent-bg)', border: '1px solid var(--status-urgent-border)', borderRadius: 'var(--radius-md)', fontSize: '0.8rem', color: 'var(--status-urgent)', marginBottom: 'var(--space-3)' }}>
                  {commentError}
                </div>
              )}
              <div className="comment" style={{ alignItems: 'flex-end' }}>
                <div className="comment-avatar" style={{ background: 'var(--accent-light)', color: 'var(--accent-text)' }}>
                  {initials(`${user?.firstName} ${user?.lastName}`)}
                </div>
                <div style={{ flex: 1 }}>
                  <textarea
                    rows={3}
                    placeholder="Add a comment..."
                    value={newComment}
                    onChange={e => setNewComment(e.target.value)}
                    style={{ resize: 'none', width: '100%' }}
                    onKeyDown={e => { if (e.key === 'Enter' && e.metaKey) handleSendComment(); }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'var(--space-3)' }}>
                    <Button variant="primary" size="sm" loading={sending} onClick={handleSendComment}>
                      Send Comment
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div className="card">
            <div className="card-title" style={{ marginBottom: 'var(--space-4)' }}>Ticket Details</div>
            {[
              ['Ticket ID', `#${ticket.ticket_id}`],
              ['Status', ticket.status],
              ['Priority', ticket.priority],
              ['Created', new Date(ticket.created_at).toLocaleDateString()],
            ].map(([label, value]) => (
              <div key={label} style={{ marginBottom: 'var(--space-4)' }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 2 }}>{label}</div>
                <div style={{ fontSize: '0.875rem', fontWeight: 500 }}>{value || '—'}</div>
              </div>
            ))}
          </div>

          {isAdmin && (
            <div className="card">
              <div className="card-title" style={{ marginBottom: 'var(--space-4)' }}>Admin Controls</div>
              <div className="form-group">
                <label>Update Status</label>
                <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                  <select value={selectedStatus} onChange={e => setSelectedStatus(e.target.value)} style={{ flex: 1 }}>
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                  <Button size="sm" variant="secondary" loading={updatingStatus} disabled={selectedStatus === ticket.status} onClick={() => handleStatusChange(selectedStatus)}>
                    Set
                  </Button>
                </div>
              </div>
              <div className="form-group">
                <label>Assign Admin (by user ID)</label>
                <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                  <input
                    type="number"
                    placeholder="Admin user ID"
                    defaultValue={ticket.assigned_admin_id || ''}
                    id="assign-admin-input"
                    style={{ flex: 1 }}
                  />
                  <Button size="sm" variant="secondary" onClick={() => {
                    const val = document.getElementById('assign-admin-input').value;
                    if (val) handleAssign(val);
                  }}>
                    Assign
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
