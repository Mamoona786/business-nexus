import axios from 'axios';

export const API = axios.create({
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
