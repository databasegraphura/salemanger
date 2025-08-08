// src/context/AuthContext.js - CORRECTED
import React, { createContext, useState, useEffect, use } from 'react';
// import { useNavigate } from 'react-router-dom'; // <-- REMOVE THIS LINE
import authService from '../services/authService';
import { getUser, removeToken, removeUser, clearAuthData } from '../utils/authUtils';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUserState] = useState(null);
  const [loading, setLoading] = useState(true);
  // const navigate = useNavigate(); // <-- REMOVE THIS LINE

  useEffect(() => {
    const storedUser = getUser();
    if (storedUser) {
      setUserState(storedUser);
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const userData = await authService.login(email, password);
      setUserState(userData);
      // REMOVE: navigate('/dashboard'); // <-- REMOVE THIS LINE
      return userData; // Return user data for calling component to handle navigation
    } catch (error) {
      setUserState(null);
      clearAuthData();
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (userData) => {
    setLoading(true);
    try {
      if(userData.password !== userData.passwordConfirm) {
        console.log(userData);
        
        throw new Error("Passwords do not match");
      }
      const newUser = await authService.signup(userData);
      setUserState(newUser);
      // REMOVE: navigate('/dashboard'); // <-- REMOVE THIS LINE
      return newUser; // Return user data for calling component to handle navigation
    } catch (error) {
      setUserState(null);
      clearAuthData();
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await authService.logout();
    } catch (error) {
      console.warn("Logout failed on backend, but clearing client data.", error);
    } finally {
      setUserState(null);
      clearAuthData();
      // REMOVE: navigate('/login'); // <-- REMOVE THIS LINE
      setLoading(false);
    }
  };

  const authContextValue = {
    user,
    isAuthenticated: !!user,
    loading,
    login,
    signup,
    logout,
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};