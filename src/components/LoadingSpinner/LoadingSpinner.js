// src/components/LoadingSpinner/LoadingSpinner.js
import React from 'react';
import './LoadingSpinner.css'; // We'll create this CSS file

const LoadingSpinner = () => {
  return (
    <div className="spinner-overlay">
      <div className="spinner-container">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;