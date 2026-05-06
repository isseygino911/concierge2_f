import client from './client';

export const getNotifications = async () => {
  const { data } = await client.get('/api/notifications');
  return Array.isArray(data) ? data : (data.data ?? []);
};

export const getUnreadCount = async () => {
  const { data } = await client.get('/api/notifications/unread-count');
  return data.count || 0;
};

export const markAsRead = async (ids) => {
  const { data } = await client.patch('/api/notifications/read', { notification_ids: ids });
  console.log(id)
  return data;
};

export const markAllAsRead = async () => {
  const { data } = await client.patch('/api/notifications/read', { all: true });
  return data;
};
