import React, { createContext, useState, useEffect, useCallback } from 'react';
import { registerUser, loginUser, logoutUser, getMe } from '../services/auth.api';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Check current session on initial load
  const checkSession = useCallback(async () => {
    try {
      setLoading(true);
      const currentUser = await getMe();
      setUser(currentUser);
      setAuthError(null);
    } catch (err) {
      // 401 simply means not logged in
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  const login = async (email, password) => {
    setLoading(true);
    setAuthError(null);
    try {
      const loggedUser = await loginUser(email, password);
      setUser(loggedUser);
      return loggedUser;
    } catch (err) {
      setAuthError(err.message || 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password) => {
    setLoading(true);
    setAuthError(null);
    try {
      const newUser = await registerUser(name, email, password);
      setUser(newUser);
      return newUser;
    } catch (err) {
      setAuthError(err.message || 'Registration failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await logoutUser();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        authError,
        setAuthError,
        login,
        register,
        logout,
        checkSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
