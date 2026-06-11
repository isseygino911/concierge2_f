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

export const registerFromInvite = async (payload) => {
  const { data } = await client.post('/api/auth/register-from-invite', payload);
  return data;
};

export const validateToken = async (token) => {
  const { data } = await client.get(`/api/auth/validate-token/${token}`);
  return data;
};

export const resetPasswordVerify = async (payload) => {
  const { data } = await client.post('/api/auth/reset-password-verify', payload);
  return data;
};
