// src/services/salesService.js
import api from './api'; // Our configured axios instance

const salesService = {
  // Creates a new sales record
  createSale: async (saleData) => {
    try {
      const response = await api.post('/sales', saleData);
      return response.data.data.sale;
    } catch (error) {
      console.error('Error creating sale:', error.response ? error.response.data : error.message);
      throw error;
    }
  },

  // Fetches all sales records (backend filters by role: Executive sees own, TL sees team's, Manager sees all)
  getAllSales: async (filters = {}) => {
    try {
      const response = await api.get('/sales', { params: filters });
      return response.data.data.sales; // Ensure this matches backend response structure
    } catch (error) {
      console.error('Error fetching all sales:', error.response ? error.response.data : error.message);
      throw error;
    }
  },

  // Fetches a single sales record by ID (backend checks permissions)
  getSale: async (id) => {
    try {
      const response = await api.get(`/sales/${id}`);
      return response.data.data.sale;
    } catch (error) {
      console.error('Error fetching sale:', error.response ? error.response.data : error.message);
      throw error;
    }
  },

  // Fetches aggregated sales summary report (typically for TLs/Managers)
  getSalesSummaryReport: async (filters) => {
    try {
      const response = await api.get('/sales/report/summary', { params: filters });
      return response.data.data.summary; // Adjust based on your backend response structure for this
    } catch (error) {
      console.error('Error fetching sales summary report:', error.response ? error.response.data : error.message);
      throw error;
    }
  }
};

export default salesService;