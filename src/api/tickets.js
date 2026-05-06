import client from './client';

export const getMyTickets = async () => {
  const { data } = await client.get('/api/tickets/my-tickets');
  return Array.isArray(data) ? data : (data.tickets ?? data.data ?? []);
};

export const getAdminQueue = async () => {
  const { data } = await client.get('/api/tickets/admin/queue');
  return Array.isArray(data) ? data : (data.tickets ?? data.data ?? []);
};

export const createTicket = async (payload) => {
  const { data } = await client.post('/api/tickets/create', payload);
  return data;
};

export const createEmergencyTicket = async (payload) => {
  const { data } = await client.post('/api/tickets/emergency', payload);
  return data;
};

export const updateTicketStatus = async (ticketId, status) => {
  const { data } = await client.patch('/api/tickets/status', { ticket_id: ticketId, status });
  return data;
};

export const assignTicket = async (ticketId, adminId, vendorId) => {
  const { data } = await client.patch('/api/tickets/assign', { ticket_id: ticketId, admin_id: adminId, vendor_id: vendorId });
  return data;
};

export const getComments = async (ticketId) => {
  const { data } = await client.get(`/api/tickets/comments/${ticketId}`);
  return Array.isArray(data) ? data : [];
};

export const addComment = async (ticketId, comment) => {
  const { data } = await client.post('/api/tickets/comments', { ticket_id: ticketId, comment });
  return data;
};

export const getAllCategories = async () => {
  const { data } = await client.get('/api/tickets/categories');
  return Array.isArray(data) ? data : (data.categories ?? data.data ?? []);
};

export const createCategory = async (payload) => {
  const { data } = await client.post('/api/tickets/categories', payload);
  return data;
};

export const updateCategory = async (id, payload) => {
  const { data } = await client.put(`/api/tickets/categories/${id}`, payload);
  return data;
};

export const deleteCategory = async (id) => {
  const { data } = await client.delete(`/api/tickets/categories/${id}`);
  return data;
};
