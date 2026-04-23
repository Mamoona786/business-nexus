import { API } from './api';
import { User } from '../types';

export const getMyProfileApi = async (): Promise<{ user: User }> => {
  const { data } = await API.get<{ user: User }>('/profile/me');
  return data;
};

export const updateMyProfileApi = async (
  updates: Partial<User>
): Promise<{ message: string; user: User }> => {
  const { data } = await API.put<{ message: string; user: User }>(
    '/profile/me',
    updates
  );
  return data;
};
