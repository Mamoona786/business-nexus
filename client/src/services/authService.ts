import { API } from './api';
import { User, UserRole } from '../types';

export interface AuthResponse {
  user: User;
  token: string;
}

export const registerUserApi = async (
  name: string,
  email: string,
  password: string,
  role: UserRole
): Promise<AuthResponse> => {
  const { data } = await API.post<AuthResponse>('/auth/register', {
    name,
    email,
    password,
    role
  });

  return data;
};

export const loginUserApi = async (
  email: string,
  password: string,
  role: UserRole
): Promise<AuthResponse> => {
  const { data } = await API.post<AuthResponse>('/auth/login', {
    email,
    password,
    role
  });

  return data;
};

export const forgotPasswordApi = async (
  email: string
): Promise<{ message: string }> => {
  const { data } = await API.post<{ message: string }>('/auth/forgot-password', {
    email
  });

  return data;
};

export const resetPasswordApi = async (
  token: string,
  password: string
): Promise<{ message: string }> => {
  const { data } = await API.post<{ message: string }>(
    `/auth/reset-password/${token}`,
    { password }
  );

  return data;
};

export const logoutApi = async (): Promise<{ message: string }> => {
  const { data } = await API.post<{ message: string }>('/auth/logout');

  return data;
};

export const getMeApi = async (): Promise<{ user: User }> => {
  const { data } = await API.get<{ user: User }>('/auth/me');

  return data;
};
