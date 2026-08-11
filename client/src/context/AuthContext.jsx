import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const { data } = await api.get('/auth/me');
        setUser(data.data);
      } catch (error) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    fetchMe();
  }, []);

  const login = (userData) => {
    setUser(userData);
  };

  const register = (userData) => {
    setUser(userData);
  };

  const logout = async () => {
    try {
      await api.get('/auth/logout');
    } catch (error) {
      console.error('Logout failed', error);
    }
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
