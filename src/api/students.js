import client from './client';

// role_name → role_id matches DB seed order:
// super_admin=1, admin=2, vendor=3, sales=4, organization=5, parent=6, student=7
const ROLE_ID_MAP = { super_admin: 1, admin: 2, vendor: 3, sales: 4, organization: 5, parent: 6, student: 7 };

export const getAllStudents = async () => {
  const { data } = await client.get('/api/dashboard/sales/students');
  return Array.isArray(data) ? data : (data.students ?? data.data ?? []);
};

export const updateStudentStatus = async (id, status) => {
  const { data } = await client.patch(`/api/dashboard/sales/students/${id}`, { status });
  return data;
};

export const getStudentBalance = async () => {
  const { data } = await client.get('/api/dashboard/student/balance');
  return data;
};

export const getEmergencyContacts = async () => {
  const { data } = await client.get('/api/dashboard/student/emergency-contacts');
  return Array.isArray(data) ? data : [];
};

export const addEmergencyContact = async (payload) => {
  const { data } = await client.post('/api/dashboard/student/emergency-contacts', payload);
  return data;
};

export const deleteEmergencyContact = async (id) => {
  const { data } = await client.delete(`/api/dashboard/student/emergency-contacts/${id}`);
  return data;
};

export const getInvitations = async () => {
  const { data } = await client.get('/api/auth/invitations');
  return Array.isArray(data) ? data : (data.invitations ?? []);
};

export const generateInvitation = async (email, orgId, role = 'student') => {
  const role_id = ROLE_ID_MAP[role] ?? ROLE_ID_MAP.student;
  const { data } = await client.post('/api/auth/invite', { email, org_id: orgId, role_id });
  return {
    ...data,
    link: `${window.location.origin}/register/${data.token}`,
  };
};
