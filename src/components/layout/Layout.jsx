import { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import { getUnreadCount } from '../../api/notifications';

export default function Layout({ allowedRoles, title, breadcrumbs, actions }) {
  const { user, loading, isAuthenticated } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (isAuthenticated) {
      getUnreadCount().then(setUnreadCount).catch(() => {});
      const interval = setInterval(() => {
        getUnreadCount().then(setUnreadCount).catch(() => {});
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  if (loading) {
    return (
      <div className="loading-state" style={{ minHeight: '100vh' }}>
        <div className="loading-spinner" />
        <span>Loading...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="app-shell">
      <Sidebar unreadCount={unreadCount} />
      <main className="app-main">
        <TopBar
          title={title}
          breadcrumbs={breadcrumbs}
          actions={actions}
          unreadCount={unreadCount}
        />
        <div className="app-content">
          <Outlet context={{ unreadCount, setUnreadCount }} />
        </div>
      </main>
    </div>
  );
}
