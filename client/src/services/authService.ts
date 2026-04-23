import axios from 'axios';
import { UserRole } from '../types';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('business_nexus_token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl: string;
  bio: string;
  isOnline?: boolean;
  createdAt: string;
}

export interface AuthResponse {
  user: AuthUser;
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

export const getMeApi = async (): Promise<{ user: AuthUser }> => {
  const { data } = await API.get<{ user: AuthUser }>('/auth/me');
  return data;
};
