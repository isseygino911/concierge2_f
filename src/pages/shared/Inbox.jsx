import { useState, useEffect } from 'react';
import { getNotifications, markAsRead, markAllAsRead } from '../../api/notifications';
import Button from '../../components/ui/Button';

const typeIcon = {
  deposit: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
    </svg>
  ),
  ticket: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 9V7a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v2"/>
    </svg>
  ),
  onboarding: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
    </svg>
  ),
  organization: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
    </svg>
  ),
};

const typeColor = {
  deposit: 'var(--status-active)',
  ticket: 'var(--status-urgent)',
  onboarding: 'var(--accent)',
  organization: 'var(--status-completed)',
};

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function Inbox() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    getNotifications().then(setNotifications).finally(() => setLoading(false));
  }, []);

  const handleToggleRead = async (notif) => {
    const newIsRead = !notif.is_read;
    await markAsRead([notif.notification_id], newIsRead);
    setNotifications(prev => prev.map(n =>
      n.notification_id === notif.notification_id ? { ...n, is_read: newIsRead } : n
    ));
  };

  const handleMarkAll = async () => {
    setMarkingAll(true);
    try {
      await markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } finally {
      setMarkingAll(false);
    }
  };

  const filtered = notifications.filter(n => {
    if (filter === 'unread') return !n.is_read;
    if (filter === 'read') return n.is_read;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="animate-in" style={{ maxWidth: 720, margin: '0 auto' }}>
      <div className="page-header">
        <div className="page-header-text">
          <h2>Inbox</h2>
          <p>{unreadCount > 0 ? `${unreadCount} unread notifications` : 'All notifications read'}</p>
        </div>
        {unreadCount > 0 && (
          <Button variant="secondary" size="sm" loading={markingAll} onClick={handleMarkAll}>
            Mark all as read
          </Button>
        )}
      </div>

      {/* Filter */}
      <div className="tabs" style={{ marginBottom: 'var(--space-6)' }}>
        {[['all', 'All'], ['unread', 'Unread'], ['read', 'Read']].map(([val, label]) => (
          <button key={val} className={`tab${filter === val ? ' active' : ''}`} onClick={() => setFilter(val)}>
            {label}
            {val === 'unread' && unreadCount > 0 && ` (${unreadCount})`}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="loading-state"><div className="loading-spinner" /><span>Loading...</span></div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-title">{filter === 'unread' ? 'All caught up' : 'No notifications'}</div>
          <p className="empty-state-desc">You have no {filter === 'unread' ? 'unread ' : ''}notifications at this time.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {filtered.map((notif, i) => (
            <div
              key={notif.notification_id}
              onClick={() => handleToggleRead(notif)}
              style={{
                display: 'flex',
                gap: 'var(--space-4)',
                padding: 'var(--space-5)',
                background: notif.is_read ? 'var(--surface-raised)' : 'var(--content-bg-elevated)',
                borderBottom: '1px solid var(--border)',
                cursor: 'pointer',
                transition: 'background var(--transition-fast)',
                borderRadius: i === 0 ? 'var(--radius-lg) var(--radius-lg) 0 0' : (i === filtered.length - 1 ? '0 0 var(--radius-lg) var(--radius-lg)' : 0),
                borderLeft: notif.is_read ? '3px solid transparent' : `3px solid ${typeColor[notif.type] || 'var(--accent)'}`,
                border: '1px solid var(--border)',
                marginBottom: 2,
                borderRadius: 'var(--radius-md)',
              }}
            >
              {/* Type icon */}
              <div style={{
                width: 36,
                height: 36,
                borderRadius: 'var(--radius-md)',
                background: `${typeColor[notif.type] || 'var(--accent)'}20`,
                color: typeColor[notif.type] || 'var(--accent)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                {typeIcon[notif.type] || typeIcon.ticket}
              </div>

              <div style={{ flex: 1 }}>
                <div style={{
                  fontSize: '0.9rem',
                  color: notif.is_read ? 'var(--text-muted)' : 'var(--text-primary)',
                  lineHeight: 1.5,
                  fontWeight: notif.is_read ? 400 : 500,
                  marginBottom: 'var(--space-1)',
                }}>
                  {notif.message}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  {timeAgo(notif.created_at)}
                </div>
              </div>

              {!notif.is_read && (
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)', marginTop: 6, flexShrink: 0 }} />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
