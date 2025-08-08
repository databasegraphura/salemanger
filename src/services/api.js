// src/services/api.js
import axios from 'axios';
import { getToken } from '../utils/authUtils'; // We will create this utility function next

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for sending cookies (like our JWT cookie)
});

// Request interceptor to add the token to headers
api.interceptors.request.use(
  (config) => {
    const token = getToken(); // Get token from localStorage (if not using HttpOnly cookies exclusively)
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling global errors (e.g., 401 Unauthorized)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Check if the error is due to token expiration or invalidity
    if (error.response && error.response.status === 401) {
      // You might want to automatically redirect to login or show a session expired message
      console.log('Authentication failed or token expired. Redirecting to login...');
      // IMPORTANT: If using HttpOnly cookies, the server might return 401 without specific token expiration msg
      // In that case, checking for 401 and redirecting is sufficient.
      // You could also trigger a logout action from AuthContext here.
      // For now, we'll just log, but in a real app, redirect or dispatch logout.
      // window.location.href = '/login'; // Or use react-router-dom's navigate
    }
    return Promise.reject(error);
  }
);

export default api;