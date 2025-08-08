// src/services/reportService.js
import api from './api'; // Our configured axios instance

const reportService = {
  // Fetches dashboard summary data, which is dynamically tailored by backend based on user's role
  getDashboardSummary: async () => {
    try {
      const response = await api.get('/reports/dashboard-summary');
      return response.data.data; // The backend wraps data in { status, data: { ... } }
    } catch (error) {
      console.error('Error fetching dashboard summary:', error.response ? error.response.data : error.message);
      throw error;
    }
  },

  // Fetches a performance report, filtered by period (day/month) and optionally by teamLeadId
  getPerformanceReport: async (period, teamLeadId) => {
    try {
      const params = { period };
      if (teamLeadId) {
        params.teamLeadId = teamLeadId;
      }
      const response = await api.get('/reports/performance', { params });
      return response.data.data.report;
    } catch (error) {
      console.error('Error fetching performance report:', error.response ? error.response.data : error.message);
      throw error;
    }
  },

  // Fetches manager-specific call report (Manager role only on backend)
  getManagerCallReport: async (filters = {}) => {
    try {
      const response = await api.get('/reports/manager-calls', { params: filters });
      return response.data.data.callLogs;
    } catch (error) {
      console.error('Error fetching manager call report:', error.response ? error.response.data : error.message);
      throw error;
    }
  },

  // Fetches general activity logs (Manager role only on backend)
  getActivityLogs: async () => {
    try {
      const response = await api.get('/reports/activity-logs');
      return response.data.data.activityLogs;
    } catch (error) {
      console.error('Error fetching activity logs:', error.response ? error.response.data : error.message);
      throw error;
    }
  }
};

export default reportService;