// API client: Axios setup with API base URL and auth token interceptors.

import axios from 'axios';

export const API_BASE_URL = 'http://localhost:5000/api';
export const API_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, '');

const api = axios.create({
  baseURL: API_BASE_URL
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('customerToken');
  const adminToken = localStorage.getItem('adminToken');

  const url = config.url || '';
  const isAdminPage = typeof window !== 'undefined' && window.location.pathname.startsWith('/admin');
  const isAdminEndpoint = url.includes('/admin') || url.includes('/reports');

  if ((isAdminEndpoint || isAdminPage) && adminToken) {
    config.headers.Authorization = `Bearer ${adminToken}`;
  } else if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;


