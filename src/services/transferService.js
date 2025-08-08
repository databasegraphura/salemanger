// src/services/transferService.js
import api from './api';

const transferService = {
  transferInternalData: async (transferData) => {
    try {
      const response = await api.post('/transfer/internal', transferData);
      return response.data; // Backend returns { status, message }
    } catch (error) {
      console.error('Error transferring internal data:', error.response ? error.response.data : error.message);
      throw error;
    }
  },

  getInternalTransferHistory: async (filters = {}) => {
    try {
      const response = await api.get('/transfer/internal-history', { params: filters });
      return response.data.data.history;
    } catch (error) {
      console.error('Error fetching internal transfer history:', error.response ? error.response.data : error.message);
      throw error;
    }
  },

  transferToFinance: async (salesIds) => {
    try {
      const response = await api.post('/transfer/finance', { salesIds });
      return response.data;
    } catch (error) {
      console.error('Error transferring to finance:', error.response ? error.response.data : error.message);
      throw error;
    }
  },

  getFinanceTransferHistory: async (filters = {}) => {
    try {
      const response = await api.get('/transfer/finance-history', { params: filters });
      return response.data.data.history;
    } catch (error) {
      console.error('Error fetching finance transfer history:', error.response ? error.response.data : error.message);
      throw error;
    }
  }
};

export default transferService;