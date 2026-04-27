import { API } from './api';
import { AppNotification } from '../types';

export const getNotificationsApi = async (): Promise<{
  notifications: AppNotification[];
}> => {
  const { data } = await API.get('/notifications');
  return data;
};

export const getUnreadNotificationCountApi = async (): Promise<{
  unreadCount: number;
}> => {
  const { data } = await API.get('/notifications/unread-count');
  return data;
};

export const markNotificationAsReadApi = async (
  id: string
): Promise<{ message: string; notification: AppNotification }> => {
  const { data } = await API.patch(`/notifications/${id}/read`);
  return data;
};

export const markAllNotificationsAsReadApi = async (): Promise<{
  message: string;
}> => {
  const { data } = await API.patch('/notifications/mark-all-read');
  return data;
};

export const deleteNotificationApi = async (
  id: string
): Promise<{ message: string }> => {
  const { data } = await API.delete(`/notifications/${id}`);
  return data;
};
