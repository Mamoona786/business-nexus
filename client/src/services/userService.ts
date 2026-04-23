import { API } from './api';
import { Entrepreneur, Investor, User } from '../types';

export const getInvestorsApi = async (params?: {
  search?: string;
  stage?: string;
  interest?: string;
}): Promise<{ users: Investor[] }> => {
  const { data } = await API.get<{ users: Investor[] }>('/users/investors', {
    params
  });
  return data;
};

export const getEntrepreneursApi = async (params?: {
  search?: string;
  industry?: string;
}): Promise<{ users: Entrepreneur[] }> => {
  const { data } = await API.get<{ users: Entrepreneur[] }>('/users/entrepreneurs', {
    params
  });
  return data;
};

export const getUserByIdApi = async (id: string): Promise<{ user: User }> => {
  const { data } = await API.get<{ user: User }>(`/users/${id}`);
  return data;
};
