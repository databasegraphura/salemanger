// src/hooks/useAuth.js
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    // This check helps ensure the hook is used within an AuthProvider
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default useAuth;