// src/services/salaryService.js
import api from './api';

const salaryService = {
  createPayout: async (payoutData) => {
    try {
      const response = await api.post('/salary', payoutData);
      return response.data.data.payout;
    } catch (error) {
      console.error('Error creating payout:', error.response ? error.response.data : error.message);
      throw error;
    }
  },

  getAllPayouts: async (filters = {}) => {
    try {
      const response = await api.get('/salary', { params: filters });
      return response.data.data.payouts;
    } catch (error) {
      console.error('Error fetching all payouts:', error.response ? error.response.data : error.message);
      throw error;
    }
  },

  getPayout: async (id) => {
    try {
      const response = await api.get(`/salary/${id}`);
      return response.data.data.payout;
    } catch (error) {
      console.error('Error fetching payout:', error.response ? error.response.data : error.message);
      throw error;
    }
  },

  updatePayout: async (id, payoutData) => {
    try {
      const response = await api.patch(`/salary/${id}`, payoutData);
      return response.data.data.payout;
    } catch (error) {
      console.error('Error updating payout:', error.response ? error.response.data : error.message);
      throw error;
    }
  },

  deletePayout: async (id) => {
    try {
      await api.delete(`/salary/${id}`);
      return true;
    } catch (error) {
      console.error('Error deleting payout:', error.response ? error.response.data : error.message);
      throw error;
    }
  }
};

export default salaryService;