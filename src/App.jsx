import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth, getRoleHomePath } from './context/AuthContext';

// Layout
import Layout from './components/layout/Layout';

// Public pages
import Login from './pages/Login';
import Signup from './pages/Signup';
import StudentOnboarding from './pages/student/StudentOnboarding';
import OrgRegister from './pages/organization/OrgRegister';
import ForgotPassword from './pages/ForgotPassword';
import NotFound from './pages/shared/NotFound';

// Sales pages
import SalesDashboard from './pages/sales/SalesDashboard';
import OrganizationList from './pages/sales/OrganizationList';
import OrganizationDetail from './pages/sales/OrganizationDetail';
import StudentList from './pages/sales/StudentList';
import DepositsTab from './pages/sales/DepositsTab';
import InvitationCreate from './pages/sales/InvitationCreate';

// Student pages
import StudentPortal from './pages/student/StudentPortal';

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';
import TicketDetail from './pages/admin/TicketDetail';

// Super Admin pages
import SuperAdminDashboard from './pages/superadmin/SuperAdminDashboard';
import UserManagement from './pages/superadmin/UserManagement';
import CategoryManagement from './pages/superadmin/CategoryManagement';

// Org pages
import OrgDashboard from './pages/organization/OrgDashboard';

// Parent pages
import ParentPortal from './pages/parent/ParentPortal';

// Shared pages
import Inbox from './pages/shared/Inbox';

// Role-based redirect component
function DashboardRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={getRoleHomePath(user.role)} replace />;
}

// Layout wrapper with props
function SalesLayout() {
  return <Layout allowedRoles={['sales']} />;
}
function AdminLayout() {
  return <Layout allowedRoles={['admin', 'super_admin']} />;
}
function SuperAdminLayout() {
  return <Layout allowedRoles={['super_admin']} />;
}
function OrgLayout() {
  return <Layout allowedRoles={['organization']} />;
}
function StudentLayout() {
  return <Layout allowedRoles={['student']} />;
}
function ParentLayout() {
  return <Layout allowedRoles={['parent']} />;
}
function SharedLayout() {
  return <Layout allowedRoles={['sales', 'admin', 'super_admin', 'organization', 'student', 'parent']} />;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/register/:token" element={<StudentOnboarding />} />
      <Route path="/org-register/:token" element={<OrgRegister />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* Root → dashboard redirect */}
      <Route path="/" element={<DashboardRedirect />} />
      <Route path="/dashboard" element={<DashboardRedirect />} />

      {/* Sales routes */}
      <Route element={<SalesLayout />}>
        <Route path="/sales" element={<SalesDashboard />} />
        <Route path="/sales/organizations" element={<OrganizationList />} />
        <Route path="/sales/organizations/:id" element={<OrganizationDetail />} />
        <Route path="/sales/students" element={<StudentList />} />
        <Route path="/sales/deposits" element={<DepositsTab />} />
        <Route path="/sales/invitations" element={<InvitationCreate />} />
      </Route>

      {/* Student routes */}
      <Route element={<StudentLayout />}>
        <Route path="/student" element={<StudentPortal />} />
        <Route path="/student/tickets" element={<StudentPortal />} />
        <Route path="/student/tickets/:id" element={<TicketDetail />} />
      </Route>

      {/* Admin routes (admin + super_admin) */}
      <Route element={<AdminLayout />}>
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/tickets" element={<AdminDashboard />} />
        <Route path="/admin/tickets/:id" element={<TicketDetail />} />
      </Route>

      {/* Super admin routes */}
      <Route element={<SuperAdminLayout />}>
        <Route path="/super-admin" element={<SuperAdminDashboard />} />
        <Route path="/super-admin/tickets" element={<SuperAdminDashboard />} />
        <Route path="/super-admin/users" element={<UserManagement />} />
        <Route path="/super-admin/categories" element={<CategoryManagement />} />
      </Route>

      {/* Org routes */}
      <Route element={<OrgLayout />}>
        <Route path="/org" element={<OrgDashboard />} />
        <Route path="/org/roster" element={<OrgDashboard />} />
      </Route>

      {/* Parent routes */}
      <Route element={<ParentLayout />}>
        <Route path="/parent" element={<ParentPortal />} />
      </Route>

      {/* Shared routes */}
      <Route element={<SharedLayout />}>
        <Route path="/inbox" element={<Inbox />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
