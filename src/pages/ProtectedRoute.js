// src/pages/ProtectedRoute.js - TEMPORARY DIAGNOSTIC VERSION
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
// import LoadingSpinner from '../components/LoadingSpinner/LoadingSpinner'; // <-- TEMPORARILY COMMENT THIS OUT

const ProtectedRoute = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    // return <LoadingSpinner />; // <-- TEMPORARILY COMMENT THIS OUT
    return <div>Loading authentication...</div>; // <-- ADD THIS TEMPORARY TEXT
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;