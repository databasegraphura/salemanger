// src/pages/ReportPage.js - Manager Version (Overall Performance Report)
import React, { useEffect, useState } from 'react';
import reportService from '../services/reportService'; // For fetching performance reports
import userService from '../services/userService';   // For fetching Team Leads for filters
import LoadingSpinner from '../components/LoadingSpinner/LoadingSpinner';
import styles from '../components/Layout/Layout.module.css'; // General layout styles
import tableStyles from './ReportPage.module.css';     // Reusing table/form styles
import formStyles from './ProspectFormPage.module.css'; // Reusing form input styles

const ReportPage = () => {
  const [reportData, setReportData] = useState([]);
  const [teamLeads, setTeamLeads] = useState([]); // For 'Team Leader Name' filter dropdown
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter states (for input fields)
  const [selectedPeriod, setSelectedPeriod] = useState('day'); // Default to 'Day' as per screenshot
  const [selectedTeamLeadId, setSelectedTeamLeadId] = useState('');

  // Applied filters (these trigger data fetching)
  const [appliedFilters, setAppliedFilters] = useState({
    period: 'day', // Default applied period
    teamLeadId: '',
  });

  // Fetch Team Leads for the filter dropdown (runs once on mount)
  useEffect(() => {
    const fetchTeamLeads = async () => {
      try {
        setError(null);
        // Managers can get all users, filter to only Team Leads
        const tls = await userService.getAllUsers({ role: 'team_lead' });
        setTeamLeads(tls.filter(user => user.role === 'team_lead')); // Ensure only TLs
      } catch (err) {
        console.error('Failed to fetch Team Leads for filter:', err);
        setError(err.response?.data?.message || err.message || 'Failed to load Team Leaders for filters.');
      }
    };
    fetchTeamLeads();
  }, []);

  // Fetch Report Data based on applied filters
  useEffect(() => {
    const fetchReportData = async () => {
      setLoading(true);
      setError(null);
      try {
        // The backend's getPerformanceReport API for Manager returns data for TLs/Execs, filtered by query params
        const data = await reportService.getPerformanceReport(appliedFilters.period, appliedFilters.teamLeadId);
        setReportData(data);
      } catch (err) {
        console.error('Failed to fetch performance report data:', err);
        setError(err.response?.data?.message || err.message || 'An unexpected error occurred while fetching report data.');
        setReportData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchReportData();
  }, [appliedFilters]); // Dependency array: `appliedFilters` changes trigger re-fetch


  // Handle Search button click
  const handleSearchClick = (e) => {
    e.preventDefault();
    setAppliedFilters({
      period: selectedPeriod,
      teamLeadId: selectedTeamLeadId,
    });
  };


  if (loading && reportData.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <div className={styles.content}>
      <h1 className={tableStyles.pageTitle}>Overall Performance Report</h1>

      {error && <p className={tableStyles.errorMessage}>{error}</p>}

      {/* Filter Section */}
      <div className={tableStyles.reportSection}>
        <form onSubmit={handleSearchClick} className={tableStyles.filterForm}>
          <div className={formStyles.formGroup}>
            <label htmlFor="period">Period</label>
            <select
              id="period"
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className={formStyles.formInput}
            >
              <option value="day">Day</option>
              <option value="month">Month</option>
            </select>
          </div>

          <div className={formStyles.formGroup}>
            <label htmlFor="teamLeadId">Team Leader Name</label>
            <select
              id="teamLeadId"
              value={selectedTeamLeadId}
              onChange={(e) => setSelectedTeamLeadId(e.target.value)}
              className={formStyles.formInput}
            >
              <option value="">All Team Leaders</option>
              {teamLeads.map(tl => (
                <option key={tl._id} value={tl._id}>{tl.name}</option>
              ))}
            </select>
          </div>

          <button type="submit" className={tableStyles.searchButton} disabled={loading}>
            {loading ? 'Searching...' : 'Search'}
          </button>
        </form>
      </div>

      {/* Performance Report Table */}
      <div className={tableStyles.reportSection}>
        <h2 className={tableStyles.sectionTitle}>Performance Data</h2>
        {reportData.length === 0 && !loading ? (
          <p>No performance data found based on current filters.</p>
        ) : (
          <table className={tableStyles.reportTable}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Role</th>
                <th>Today's Calls</th>
                <th>Today's Prospect</th>
                <th>Untouched Data</th>
                <th>Monthly Sales</th>
                <th>Total Sales Count</th> {/* 'Total Sales' column from screenshot */}
              </tr>
            </thead>
            <tbody>
              {reportData.map((row) => (
                <tr key={row.name + row.role}> {/* Using name+role as key, assuming unique */}
                  <td>{row.name}</td>
                  <td>{row.role.replace('_', ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}</td>
                  <td>{row.totalCalls || 0}</td>
                  <td>{row.totalProspects || 0}</td>
                  <td>{row.untouchedData || 0}</td>
                  <td>Rs. {row.monthlySales ? row.monthlySales.toFixed(2) : '0.00'}</td>
                  <td>{row.totalSalesCount || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ReportPage;