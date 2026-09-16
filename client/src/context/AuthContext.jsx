import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(() => {
    try {
      const saved = localStorage.getItem('techfix_admin');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('techfix_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function verifyAuth() {
      if (token) {
        try {
          const res = await api.get('/auth/me');
          if (res.data.success && res.data.admin) {
            setAdmin(res.data.admin);
            localStorage.setItem('techfix_admin', JSON.stringify(res.data.admin));
          } else {
            logout();
          }
        } catch (err) {
          console.warn('Session verification failed, logging out:', err.message);
          logout();
        }
      }
      setLoading(false);
    }
    verifyAuth();
  }, [token]);

  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data && res.data.success) {
        setToken(res.data.token);
        setAdmin(res.data.admin);
        localStorage.setItem('techfix_token', res.data.token);
        localStorage.setItem('techfix_admin', JSON.stringify(res.data.admin));
        return { success: true };
      }
      return { success: false, message: res.data?.message || 'Login failed. Please check your credentials.' };
    } catch (err) {
      console.error('Login request error:', err);
      const msg = err.response?.data?.message || err.message || 'Cannot connect to server. Please verify backend is running.';
      return { success: false, message: msg };
    }
  };

  const logout = () => {
    setToken(null);
    setAdmin(null);
    localStorage.removeItem('techfix_token');
    localStorage.removeItem('techfix_admin');
  };

  const updateAdmin = (updatedAdmin) => {
    setAdmin(updatedAdmin);
    localStorage.setItem('techfix_admin', JSON.stringify(updatedAdmin));
  };

  return (
    <AuthContext.Provider value={{
      admin,
      token,
      isAuthenticated: !!token && !!admin,
      loading,
      login,
      logout,
      updateAdmin
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
