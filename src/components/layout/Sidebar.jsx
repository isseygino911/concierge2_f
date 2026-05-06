import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// Icons as inline SVG components
const Icon = ({ d, ...props }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="sidebar-nav-icon" {...props}>
    <path d={d} />
  </svg>
);

const DashboardIcon = () => <Icon d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />;
const OrgIcon = () => <Icon d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />;
const StudentsIcon = () => <Icon d="M12 2a5 5 0 1 1 0 10A5 5 0 0 1 12 2zm0 12c-5.33 0-8 2.67-8 4v2h16v-2c0-1.33-2.67-4-8-4z" />;
const TicketIcon = () => <Icon d="M2 9V7a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v2M2 9h20M2 9l2 11h16l2-11" />;
const DepositIcon = () => <Icon d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />;
const InviteIcon = () => <Icon d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M21 15l-5 5-3-3M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" />;
const InboxIcon = () => <Icon d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z M22 6l-10 7L2 6" />;
const SettingsIcon = () => <Icon d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 0 0-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 0 0-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 0 0-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 0 0-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 0 0 1.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" />;
const LogoutIcon = () => <Icon d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />;
const UsersIcon = () => <Icon d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M23 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75" />;

function NavItem({ to, icon, label, badge }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) => `sidebar-nav-link${isActive ? ' active' : ''}`}
    >
      {icon}
      <span>{label}</span>
      {badge > 0 && <span className="sidebar-nav-badge">{badge}</span>}
    </NavLink>
  );
}

const NAV_LINKS = {
  sales: [
    { to: '/sales', icon: <DashboardIcon />, label: 'Dashboard' },
    { to: '/sales/organizations', icon: <OrgIcon />, label: 'Organizations' },
    { to: '/sales/students', icon: <StudentsIcon />, label: 'Students' },
    { to: '/sales/deposits', icon: <DepositIcon />, label: 'Deposits' },
    { to: '/sales/invitations', icon: <InviteIcon />, label: 'Invitations' },
  ],
  admin: [
    { to: '/admin', icon: <DashboardIcon />, label: 'Dashboard' },
    { to: '/admin/tickets', icon: <TicketIcon />, label: 'Ticket Queue' },
  ],
  super_admin: [
    { to: '/super-admin', icon: <DashboardIcon />, label: 'Dashboard' },
    { to: '/super-admin/tickets', icon: <TicketIcon />, label: 'All Tickets' },
    { to: '/super-admin/users', icon: <UsersIcon />, label: 'User Management' },
    { to: '/super-admin/categories', icon: <SettingsIcon />, label: 'Categories' },
  ],
  organization: [
    { to: '/org', icon: <DashboardIcon />, label: 'Dashboard' },
    { to: '/org/roster', icon: <StudentsIcon />, label: 'Student Roster' },
  ],
  student: [
    { to: '/student', icon: <DashboardIcon />, label: 'My Portal' },
    { to: '/student/tickets', icon: <TicketIcon />, label: 'My Tickets' },
  ],
  parent: [
    { to: '/parent', icon: <DashboardIcon />, label: 'Parent Portal' },
  ],
};

export default function Sidebar({ unreadCount = 0 }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const role = user?.role || 'student';
  const links = NAV_LINKS[role] || [];
  const initials = user ? `${(user.firstName || user.email || 'U')[0].toUpperCase()}` : 'U';
  const displayName = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email : 'User';
  const roleLabel = role.replace('_', ' ');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="app-sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-wordmark">Voices</div>
        <div className="sidebar-logo-sub">Education Concierge</div>
      </div>

      {/* Nav */}
      <nav className="sidebar-nav">
        <div className="sidebar-nav-section">
          <div className="sidebar-nav-section-label">Navigation</div>
          {links.map(link => (
            <NavItem key={link.to} {...link} />
          ))}
        </div>

        <div className="sidebar-nav-section">
          <div className="sidebar-nav-section-label">General</div>
          <NavItem
            to="/inbox"
            icon={<InboxIcon />}
            label="Inbox"
            badge={unreadCount}
          />
        </div>
      </nav>

      {/* User footer */}
      <div className="sidebar-footer">
        <div className="sidebar-user" onClick={handleLogout} title="Sign out">
          <div className="sidebar-user-avatar">{initials}</div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{displayName}</div>
            <div className="sidebar-user-role">{roleLabel}</div>
          </div>
          <LogoutIcon />
        </div>
      </div>
    </aside>
  );
}
