import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthForm from '../components/AuthForm/AuthForm';
import useAuth from '../hooks/useAuth';
import './AuthPage.css';

const AuthPage = () => {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [successMsg, setSuccessMsg] = useState('');
  const { login, signup, loading, user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Redirect to dashboard if logged in
  useEffect(() => {
    if (isAuthenticated && user) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const handleAuthSubmit = async (formData) => {
    try {
      if (isLoginMode) {
        await login(formData.email, formData.password);
        // Redirect handled by useEffect above
      } else {
        const res=await signup(formData);
        console.log(res);
        
        setIsLoginMode(true); // Switch to login after signup
        setSuccessMsg('Signup successful! Please log in.');
      }
    } catch (err) {
      console.error("AuthPage caught an error:", err.response?.data?.message || err.message);
      // Optionally handle/display error here
    }
    setIsLoginMode(true); // Reset to login mode after submission
  };

  const toggleModeHandler = () => {
    setIsLoginMode(prev => !prev);
    setSuccessMsg('');
  };

  if (isAuthenticated && user) {
    return null; // Or a spinner/loading placeholder
  }

  return (
    <div className="auth-page-container">
      {successMsg && isLoginMode && (
        <div className="auth-success-msg">{successMsg}</div>
      )}
      <AuthForm
        isLogin={isLoginMode}
        onSubmit={handleAuthSubmit}
        onToggleMode={toggleModeHandler}
        isLoading={loading}
      />
    </div>
  );
};

export default AuthPage;
