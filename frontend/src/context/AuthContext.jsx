// React context: shared state/actions provider for AuthContext.

import { createContext, useContext, useMemo, useState } from 'react';
import api from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [customer, setCustomer] = useState(() => {
    const stored = localStorage.getItem('customerProfile');
    return stored ? JSON.parse(stored) : null;
  });
  const [admin, setAdmin] = useState(() => {
    const stored = localStorage.getItem('adminProfile');
    return stored ? JSON.parse(stored) : null;
  });

  const loginCustomer = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('customerToken', data.data.token);
    localStorage.setItem('customerProfile', JSON.stringify(data.data.customer));
    setCustomer(data.data.customer);
    return data.data.customer;
  };

  const registerCustomer = async (payload) => {
    const { data } = await api.post('/auth/register', payload);
    return data.data.customer;
  };

  const loginAdmin = async (email, password) => {
    const { data } = await api.post('/admin/auth/login', { email, password });
    localStorage.setItem('adminToken', data.data.token);
    localStorage.setItem('adminProfile', JSON.stringify(data.data.admin));
    setAdmin(data.data.admin);
    return data.data.admin;
  };

  const logoutCustomer = () => {
    localStorage.removeItem('customerToken');
    localStorage.removeItem('customerProfile');
    setCustomer(null);
  };

  const logoutAdmin = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminProfile');
    setAdmin(null);
  };

  const value = useMemo(
    () => ({
      customer,
      admin,
      loginCustomer,
      registerCustomer,
      loginAdmin,
      logoutCustomer,
      logoutAdmin
    }),
    [customer, admin]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}


