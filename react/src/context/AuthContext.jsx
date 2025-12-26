import React, { createContext, useState, useContext, useEffect } from 'react';
import { login as loginApi, logout as logoutApi, register as registerApi, getMe } from '../api/auth';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    try {
      setLoading(true);
      const userData = await getMe();
      setUser(userData);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (email, password) => {
    const userData = await loginApi(email, password);
    setUser(userData);
    return userData;
  };

  const logout = async () => {
    await logoutApi();
    setUser(null);
  };

  const register = async (email, password, first_name, last_name) => {
    const userData = await registerApi(email, password, first_name, last_name);
    setUser(userData);
    return userData;
  };

  const value = {
    user,
    loading,
    login,
    logout,
    register,
    checkAuth
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
