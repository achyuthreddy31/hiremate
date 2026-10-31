import React, { createContext, useContext, useEffect, useState } from 'react';
import { apiClient } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session from MongoDB backend on initial load / refresh
  useEffect(() => {
    let isMounted = true;

    const restoreSession = async () => {
      const token = localStorage.getItem('hiremate_token');
      if (!token) {
        if (isMounted) {
          setCurrentUser(null);
          setLoading(false);
        }
        return;
      }

      try {
        const res = await apiClient.get('/auth/me');
        if (res.data?.user && isMounted) {
          const u = res.data.user;
          setCurrentUser({
            ...u,
            displayName: u.name || (u.email ? u.email.split('@')[0] : 'Candidate')
          });
        }
      } catch (err) {
        console.warn('Session verification failed, logging out:', err.message);
        localStorage.removeItem('hiremate_token');
        if (isMounted) {
          setCurrentUser(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    restoreSession();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = async (email, password) => {
    const res = await apiClient.post('/auth/login', { email, password });
    const { token, user } = res.data;
    if (token) {
      localStorage.setItem('hiremate_token', token);
    }
    const normalizedUser = {
      ...user,
      displayName: user.name || (user.email ? user.email.split('@')[0] : 'Candidate')
    };
    setCurrentUser(normalizedUser);
    return normalizedUser;
  };

  const register = async (name, email, password, confirmPassword) => {
    const res = await apiClient.post('/auth/register', {
      name,
      email,
      password,
      confirmPassword: confirmPassword || password
    });
    const { token, user } = res.data;
    if (token) {
      localStorage.setItem('hiremate_token', token);
    }
    const normalizedUser = {
      ...user,
      displayName: user.name || (user.email ? user.email.split('@')[0] : 'Candidate')
    };
    setCurrentUser(normalizedUser);
    return normalizedUser;
  };

  const logout = async () => {
    try {
      await apiClient.post('/auth/logout');
    } catch (e) {
      // Ignore network errors during logout
    } finally {
      localStorage.removeItem('hiremate_token');
      setCurrentUser(null);
    }
  };

  const resetPassword = async (email, password, confirmPassword) => {
    const res = await apiClient.post('/auth/reset-password', {
      email,
      password,
      confirmPassword
    });
    return res.data;
  };

  return (
    <AuthContext.Provider value={{ currentUser, loading, login, register, logout, resetPassword }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
