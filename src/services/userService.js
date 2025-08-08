// src/services/userService.js
import api from './api'; // Our configured axios instance

const userService = {
  // --- For any logged-in user to get/update their own profile ---
  getMe: async () => {
    try {
      const response = await api.get('/users/getMe'); // Backend uses JWT to identify user
      return response.data.data.user; // Backend sends { status, data: { user } }
    } catch (error) {
      console.error('Error fetching user profile (getMe):', error.response ? error.response.data : error.message);
      throw error;
    }
  },

  updateMe: async (userData) => { // User updates their own profile
    try {
      // Backend uses JWT to identify user, so no ID needed in URL
      const response = await api.patch('/users/getMe', userData);
      return response.data.data.user;
    } catch (error) {
      console.error('Error updating user profile (updateMe):', error.response ? error.response.data : error.message);
      throw error;
    }
  },

  // --- For Managers/Team Leads to manage other users ---
  getAllUsers: async (filters = {}) => { // Manager gets all, TL gets their execs (backend filters)
    try {
        const response = await api.get('/users', { params: filters });
        return response.data.data.users; // Backend sends { status, data: { users: [...] } }
    } catch (error) {
        console.error('Error fetching all users:', error.response ? error.response.data : error.message);
        throw error;
    }
  },

  getUserById: async (id) => { // Manager gets any, TL gets their execs (backend checks permissions)
    try {
        const response = await api.get(`/users/${id}`);
        return response.data.data.user;
    } catch (error) {
        console.error('Error fetching user by ID:', error.response ? error.response.data : error.message);
        throw error;
    }
  },

  updateUser: async (id, userData) => { // Manager/TL updates other users (backend checks permissions)
    try {
        const response = await api.patch(`/users/${id}`, userData);
        return response.data.data.user;
    } catch (error) {
        console.error('Error updating user by ID:', error.response ? error.response.data : error.message);
        throw error;
    }
  },

  deleteUser: async (id) => { // Manager deletes users (backend checks permissions)
    try {
        await api.delete(`/users/${id}`);
        return true; // Indicate success
    } catch (error) {
        console.error('Error deleting user:', error.response ? error.response.data : error.message);
        throw error;
    }
  },

  createUser: async (userData) => { // Manager/TL creates users (backend checks permissions)
    try {
        const response = await api.post('/users/createUser', userData);
        return response.data.data.user;
    } catch (error) {
        console.error('Error creating user:', error.response ? error.response.data : error.message);
        throw error;
    }
  }

};

export default userService;