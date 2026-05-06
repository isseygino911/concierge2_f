import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getOrganizations } from '../../api/organizations';
import { getPendingDeposits } from '../../api/deposits';
import { getNotifications } from '../../api/notifications';

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

const activityTypeColor = {
  deposit: 'var(--status-active)',
  ticket: 'var(--status-urgent)',
  onboarding: 'var(--accent)',
  organization: 'var(--status-completed)',
};

export default function SalesDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orgs, setOrgs] = useState([]);
  const [deposits, setDeposits] = useState([]);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getOrganizations(),
      getPendingDeposits(),
      getNotifications(),
    ]).then(([o, d, n]) => {
      setOrgs(o);
      setDeposits(d);
      setActivity(n.slice(0, 6));
    }).finally(() => setLoading(false));
  }, []);

  const stats = [
    { label: 'Organizations', value: loading ? '—' : orgs.length, sub: `${orgs.filter(o => o.status === 'active').length} active`, color: 'var(--accent)' },
    { label: 'Total Students', value: loading ? '—' : orgs.reduce((s, o) => s + (o.student_count || 0), 0), sub: 'across all orgs', color: 'var(--status-active)' },
    { label: 'Pending Deposits', value: loading ? '—' : deposits.filter(d => d.status === 'pending').length, sub: 'awaiting review', color: 'var(--status-pending)' },
    { label: 'New Registrations', value: loading ? '—' : activity.filter(n => n.type === 'onboarding').length, sub: 'recent activity', color: 'var(--status-urgent)' },
  ];

  return (
    <div className="animate-in">
      <div className="page-header">
        <div className="page-header-text">
          <h2>Good morning, {user?.firstName || 'there'}</h2>
          <p>Here's what needs your attention today.</p>
        </div>
      </div>

      {/* Stats */}
      <div className="stat-row">
        {stats.map(s => (
          <div key={s.label} className="stat-card">
            <div className="stat-card-label">{s.label}</div>
            <div className="stat-card-value" style={{ color: s.color }}>
              {loading ? <span className="skeleton" style={{ display: 'inline-block', width: 48, height: 36 }} /> : s.value}
            </div>
            <div className="stat-card-sub">{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Two columns */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 'var(--space-6)', alignItems: 'start' }}>

        {/* Recent Activity */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Recent Activity</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {activity.length === 0 && !loading && (
              <div style={{ padding: 'var(--space-6)', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>No recent activity</div>
            )}
            {activity.map((n, i) => (
              <div key={n.notification_id} style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 'var(--space-4)',
                padding: 'var(--space-4) 0',
                borderBottom: i < activity.length - 1 ? '1px solid var(--border)' : 'none',
              }}>
                <div style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: activityTypeColor[n.type] || 'var(--accent)',
                  marginTop: 6,
                  flexShrink: 0,
                }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.875rem', color: n.is_read ? 'var(--text-muted)' : 'var(--text-primary)', lineHeight: 1.5 }}>
                    {n.message}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>{timeAgo(n.created_at)}</div>
                </div>
                {!n.is_read && (
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', marginTop: 8, flexShrink: 0 }} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div className="card">
            <div className="card-title" style={{ marginBottom: 'var(--space-4)' }}>Quick Actions</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              <button
                className="btn btn-primary"
                style={{ justifyContent: 'flex-start', gap: 'var(--space-3)' }}
                onClick={() => navigate('/sales/organizations')}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                Create Organization
              </button>
              <button
                className="btn btn-secondary"
                style={{ justifyContent: 'flex-start', gap: 'var(--space-3)' }}
                onClick={() => navigate('/sales/invitations')}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.5 2l-19 19M2.5 2l19 19" /></svg>
                Generate Invite Link
              </button>
              <button
                className="btn btn-secondary"
                style={{ justifyContent: 'flex-start', gap: 'var(--space-3)' }}
                onClick={() => navigate('/sales/deposits')}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
                Review Deposits
                {deposits.filter(d => d.status === 'pending').length > 0 && (
                  <span style={{ marginLeft: 'auto', background: 'var(--status-urgent)', color: 'white', borderRadius: 10, padding: '1px 7px', fontSize: '0.7rem', fontWeight: 700 }}>
                    {deposits.filter(d => d.status === 'pending').length}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Org snapshot */}
          <div className="card">
            <div className="card-title" style={{ marginBottom: 'var(--space-4)' }}>Top Organizations</div>
            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 40 }} />)}
              </div>
            ) : (
              orgs.slice(0, 4).map(org => (
                <div key={org.org_id} style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: 'var(--space-3) 0',
                  borderBottom: '1px solid var(--border)',
                }}>
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 500 }}>{org.name}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{org.city}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{org.student_count}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>students</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
