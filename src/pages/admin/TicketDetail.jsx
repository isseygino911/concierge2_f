import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getAdminQueue, getMyTickets, getComments, addComment, updateTicketStatus, assignTicket } from '../../api/tickets';
import { getAssignableUsers } from '../../api/auth';
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
  const [assignableUsers, setAssignableUsers] = useState([]);
  const [selectedAssignees, setSelectedAssignees] = useState([]);
  const [assigning, setAssigning] = useState(false);

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
        const pre = [];
        if (found.assigned_admin_id) pre.push(found.assigned_admin_id);
        if (found.assigned_vendor_id) pre.push(found.assigned_vendor_id);
        setSelectedAssignees(pre);
      }
    });
    getComments(id).then(setComments);
    if (isAdmin) getAssignableUsers().then(setAssignableUsers).catch(() => {});
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

  const handleAssign = async () => {
    setAssigning(true);
    try {
      const adminUser = assignableUsers.find(u => selectedAssignees.includes(u.user_id) && u.role === 'admin');
      const vendorUser = assignableUsers.find(u => selectedAssignees.includes(u.user_id) && u.role === 'vendor');
      const adminId = adminUser?.user_id || null;
      const vendorId = vendorUser?.user_id || null;
      await assignTicket(ticket.ticket_id, adminId, vendorId);
      setTicket(t => ({ ...t, assigned_admin_id: adminId, assigned_vendor_id: vendorId }));
    } finally {
      setAssigning(false);
    }
  };

  const toggleAssignee = (userId) => {
    const user = assignableUsers.find(u => u.user_id === userId);
    if (!user) return;
    setSelectedAssignees(prev => {
      if (prev.includes(userId)) return prev.filter(id => id !== userId);
      // Only one admin and one vendor allowed (schema constraint)
      const filtered = prev.filter(id => {
        const u = assignableUsers.find(u => u.user_id === id);
        return u?.role !== user.role;
      });
      return [...filtered, userId];
    });
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
            <div style={{ marginBottom: 'var(--space-4)' }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 6 }}>Assigned To</div>
              {(() => {
                const assigned = assignableUsers.filter(u =>
                  u.user_id === ticket.assigned_admin_id || u.user_id === ticket.assigned_vendor_id
                );
                if (assigned.length === 0) return <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Unassigned</div>;
                return assigned.map(u => (
                  <div key={u.user_id} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                    <span style={{
                      fontSize: '0.7rem', padding: '1px 7px', borderRadius: 10, fontWeight: 600,
                      background: u.role === 'admin' ? 'var(--status-active-bg)' : 'var(--status-pending-bg)',
                      color: u.role === 'admin' ? 'var(--status-active)' : 'var(--status-pending)',
                    }}>{u.role}</span>
                    <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{u.name}</span>
                  </div>
                ));
              })()}
            </div>
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
                <label>Assign To</label>
                <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', overflow: 'hidden', marginBottom: 'var(--space-2)' }}>
                  {assignableUsers.length === 0 ? (
                    <div style={{ padding: '10px 12px', fontSize: '0.83rem', color: 'var(--text-muted)' }}>No admins or vendors available</div>
                  ) : (
                    assignableUsers.map(u => {
                      const selected = selectedAssignees.includes(u.user_id);
                      return (
                        <div
                          key={u.user_id}
                          onClick={() => toggleAssignee(u.user_id)}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px',
                            cursor: 'pointer', borderBottom: '1px solid var(--border)',
                            background: selected ? 'var(--status-active-bg)' : 'transparent',
                            transition: 'background 0.12s',
                          }}
                        >
                          <div style={{
                            width: 16, height: 16, borderRadius: 4, flexShrink: 0,
                            border: `2px solid ${selected ? 'var(--status-active)' : 'var(--border)'}`,
                            background: selected ? 'var(--status-active)' : 'transparent',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}>
                            {selected && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>}
                          </div>
                          <span style={{ fontSize: '0.875rem', fontWeight: selected ? 600 : 400, flex: 1 }}>{u.name}</span>
                          <span style={{
                            fontSize: '0.68rem', padding: '1px 7px', borderRadius: 10, fontWeight: 600,
                            background: u.role === 'admin' ? 'var(--status-active-bg)' : 'var(--status-pending-bg)',
                            color: u.role === 'admin' ? 'var(--status-active)' : 'var(--status-pending)',
                          }}>{u.role}</span>
                        </div>
                      );
                    })
                  )}
                </div>
                <Button size="sm" variant="secondary" style={{ width: '100%', justifyContent: 'center' }} loading={assigning} onClick={handleAssign}>
                  Save Assignment
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
