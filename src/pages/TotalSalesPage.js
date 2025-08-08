// src/pages/TotalSalesPage.js - Manager Version - FIX FOR CONTINUOUS LOADING

import React, { useEffect, useState } from 'react';
import salesService from '../services/salesService';
import userService from '../services/userService';
import LoadingSpinner from '../components/LoadingSpinner/LoadingSpinner';
import styles from '../components/Layout/Layout.module.css';
import tableStyles from './ReportPage.module.css';
import formStyles from './ProspectFormPage.module.css';

const TotalSalesPage = () => {
  const [salesData, setSalesData] = useState([]);
  const [teamLeads, setTeamLeads] = useState([]);
  const [loading, setLoading] = useState(true); // Keep initial loading true for page
  const [error, setError] = useState(null);

  // Filter states (for input fields)
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedTeamLeadId, setSelectedTeamLeadId] = useState('');

  // Applied filters (these trigger data fetching)
  const [appliedFilters, setAppliedFilters] = useState({
    month: '',
    teamLeadId: '',
  });

  // Fetch Team Leads for the filter dropdown (runs once on mount)
  useEffect(() => {
    const fetchTeamLeads = async () => {
      try {
        setError(null);
        const tls = await userService.getAllUsers({ role: 'team_lead' });
        setTeamLeads(tls.filter(user => user.role === 'team_lead'));
      } catch (err) {
        console.error('Failed to fetch Team Leads for filter:', err);
        setError(err.response?.data?.message || err.message || 'Failed to load Team Leads for filters.');
      }
    };
    fetchTeamLeads();
  }, []); // Empty dependency array means this runs once on mount


  // Fetch Sales Data based on applied filters
  useEffect(() => {
    const fetchSalesData = async () => {
      setLoading(true); // <-- This sets loading to true when a fetch starts
      setError(null);
      try {
        const data = await salesService.getAllSales(appliedFilters);
        setSalesData(data);
      } catch (err) {
        console.error('Failed to fetch sales data:', err);
        setError(err.response?.data?.message || err.message || 'An unexpected error occurred while fetching sales.');
        setSalesData([]);
      } finally {
        setLoading(false); // <-- This sets loading to false when fetch finishes
      }
    };

    fetchSalesData(); // <-- Call the fetch function directly
  }, [appliedFilters]); // <-- DEPENDENCY ARRAY: ONLY `appliedFilters`. This useEffect runs on mount and when `appliedFilters` change.

  // Handle Search button click
  const handleSearchClick = (e) => {
    e.preventDefault();
    // No need to set loading here, `setAppliedFilters` will trigger the `useEffect`,
    // and the `useEffect` will set loading correctly.
    setAppliedFilters({
      month: selectedMonth,
      teamLeadId: selectedTeamLeadId,
    });
  };

  const handleAddNewClick = () => {
    alert('Add New Sale functionality will be implemented here (e.g., redirect to Prospect Form or Add Sale Form).');
  };


  if (loading && salesData.length === 0) { // Show full spinner only if no data at all yet
    return <LoadingSpinner />;
  }

  return (
    <div className={styles.content}>
      <h1 className={tableStyles.pageTitle}>Total Sales (Manager)</h1>

      {error && <p className={tableStyles.errorMessage}>{error}</p>}

      {/* Filter and Add New Section */}
      <div className={tableStyles.reportSection}>
        <div className={tableStyles.sectionHeader}>
          <h2 className={tableStyles.sectionTitle}>Filter Sales Records</h2>
          <button onClick={handleAddNewClick} className={tableStyles.searchButton}>Add New</button>
        </div>
        
        <form onSubmit={handleSearchClick} className={tableStyles.filterForm}>
          <div className={formStyles.formGroup}>
            <label htmlFor="month">Month</label>
            <select
              id="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className={formStyles.formInput}
            >
              <option value="">All Months</option>
              {
                // Note: Months in JS are 0-indexed (Jan is 0, Dec is 11)
                // Your backend expects 1-indexed months for `req.query.month`.
                // So, value should be monthNum, not monthNum - 1
              }
              {Array.from({ length: 12 }, (_, i) => i + 1).map(monthNum => (
                <option key={monthNum} value={monthNum}>
                  {new Date(0, monthNum - 1).toLocaleString('default', { month: 'long' })}
                </option>
              ))}
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

      {/* Sales Records Table */}
      <div className={tableStyles.reportSection}>
        <h2 className={tableStyles.sectionTitle}>All Sales Records</h2>
        {salesData.length === 0 && !loading ? (
          <p>No sales records found based on current filters.</p>
        ) : (
          <table className={tableStyles.reportTable}>
            <thead>
              <tr>
                <th>Company Name</th>
                <th>Client Name</th>
                <th>Email ID</th>
                <th>Contact No.</th>
                <th>Amount</th>
                <th>TL Name</th>
                <th>Sales Executive</th>
                <th>Services</th>
                <th>Date</th>
                <th>Activity</th>
              </tr>
            </thead>
            <tbody>
              {salesData.map((sale) => (
                <tr key={sale._id}>
                  <td>{sale.companyName}</td>
                  <td>{sale.clientName}</td>
                  <td>{sale.emailId || 'N/A'}</td>
                  <td>{sale.contactNo || 'N/A'}</td>
                  <td>Rs. {sale.amount ? sale.amount.toFixed(2) : '0.00'}</td>
                  <td>{sale.teamLead ? sale.teamLead.name : 'N/A'}</td>
                  <td>{sale.salesExecutive ? sale.salesExecutive.name : 'N/A'}</td>
                  <td>{sale.services || 'N/A'}</td>
                  <td>{sale.saleDate ? new Date(sale.saleDate).toLocaleDateString() : 'N/A'}</td>
                  <td>{sale.activity || 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default TotalSalesPage;