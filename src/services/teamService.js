// src/services/teamService.js
import api from './api';

const teamService = {
  createTeam: async (teamData) => {
    try {
      const response = await api.post('/teams', teamData);
      return response.data.data.team;
    } catch (error) {
      console.error('Error creating team:', error.response ? error.response.data : error.message);
      throw error;
    }
  },

  getAllTeams: async (filters = {}) => {
    try {
      const response = await api.get('/teams', { params: filters });
      return response.data.data.teams;
    } catch (error) {
      console.error('Error fetching all teams:', error.response ? error.response.data : error.message);
      throw error;
    }
  },

  getTeam: async (id) => {
    try {
      const response = await api.get(`/teams/${id}`);
      return response.data.data.team;
    } catch (error) {
      console.error('Error fetching team:', error.response ? error.response.data : error.message);
      throw error;
    }
  },

  updateTeam: async (id, teamData) => {
    try {
      const response = await api.patch(`/teams/${id}`, teamData);
      return response.data.data.team;
    } catch (error) {
      console.error('Error updating team:', error.response ? error.response.data : error.message);
      throw error;
    }
  },

  deleteTeam: async (id) => {
    try {
      await api.delete(`/teams/${id}`);
      return true;
    } catch (error) {
      console.error('Error deleting team:', error.response ? error.response.data : error.message);
      throw error;
    }
  }
};

export default teamService;