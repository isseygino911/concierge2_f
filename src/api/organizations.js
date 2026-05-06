import client from './client';

export const getOrganizations = async () => {
  const { data } = await client.get('/api/dashboard/sales/organizations');
  return Array.isArray(data) ? data : (data.organizations ?? data.data ?? []);
};

export const createOrganization = async (payload) => {
  const { data } = await client.post('/api/dashboard/sales/organizations', payload);
  return data;
};

export const updateOrganization = async (id, payload) => {
  const { data } = await client.patch(`/api/dashboard/sales/organizations/${id}`, payload);
  return data;
};

export const updateStudentStatus = async (id, status) => {
  const { data } = await client.patch(`/api/dashboard/sales/students/${id}`, { status });
  return data;
};

export const getOrgRoster = async () => {
  const { data } = await client.get('/api/dashboard/org/roster');
  return Array.isArray(data) ? data : (data.students ?? data.data ?? []);
};

export const getOrgStats = async () => {
  const { data } = await client.get('/api/dashboard/org/stats');
  return data;
};

export const getOrgStudents = async (orgId) => {
  const { data } = await client.get(`/api/dashboard/sales/students?org_id=${orgId}`);
  return Array.isArray(data) ? data : (data.students ?? data.data ?? []);
};
