import client from './client';

export const login = async (email, password) => {
  const { data } = await client.post('/api/auth/login', { email, password });
  return data;
};

export const signup = async (payload) => {
  const { data } = await client.post('/api/auth/signup', payload);
  return data;
};

export const createInvitation = async (payload) => {
  const { data } = await client.post('/api/auth/invite', payload);
  return data;
};

export const acceptInvitation = async (payload) => {
  const { data } = await client.post('/api/auth/accept-invitation', payload);
  return data;
};
