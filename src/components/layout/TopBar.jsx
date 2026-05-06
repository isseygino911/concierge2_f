import { useNavigate } from 'react-router-dom';

export default function TopBar({ title, breadcrumbs = [], actions, unreadCount = 0 }) {
  const navigate = useNavigate();

  return (
    <header className="app-topbar">
      <div className="topbar-left">
        {breadcrumbs.length > 0 ? (
          <nav className="topbar-breadcrumb">
            {breadcrumbs.map((crumb, i) => (
              <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                {i > 0 && <span className="topbar-breadcrumb-sep">/</span>}
                {crumb.href ? (
                  <a href={crumb.href} onClick={e => { e.preventDefault(); navigate(crumb.href); }}>
                    {crumb.label}
                  </a>
                ) : (
                  <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{crumb.label}</span>
                )}
              </span>
            ))}
          </nav>
        ) : (
          <h1 className="topbar-page-title">{title}</h1>
        )}
      </div>

      <div className="topbar-right">
        {actions}
        <button
          className="topbar-bell"
          onClick={() => navigate('/inbox')}
          title="Notifications"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          {unreadCount > 0 && (
            <span className="topbar-bell-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
          )}
        </button>
      </div>
    </header>
  );
}
