import client from './client';

export const getPendingDeposits = async () => {
  const { data } = await client.get('/api/dashboard/sales/deposits');
  return Array.isArray(data) ? data : (data.deposits ?? data.data ?? []);
};

export const updateDepositStatus = async (id, status, reason) => {
  const { data } = await client.patch(`/api/dashboard/sales/deposits/${id}`, { status, reason });
  return data;
};

export const getChildrenStats = async () => {
  const { data } = await client.get('/api/dashboard/parent/children');
  return Array.isArray(data) ? data : (data.children ?? data.data ?? []);
};

export const createDeposit = async (formData) => {
  const { data } = await client.post('/api/dashboard/parent/deposit', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};
