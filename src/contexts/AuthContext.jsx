import React, { createContext, useContext, useState } from 'react';
import api from '../api/api';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [isLogin, setIsLogin] = useState(api.isAuthenticated());

  const login = (token) => {
    api.login(token);
    setIsLogin(true);
  };

  const logout = () => {
    api.logout();
    setIsLogin(false);
  };

  const value = {
    isLogin,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};