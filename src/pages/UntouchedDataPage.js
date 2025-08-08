// src/pages/UntouchedDataPage.js - Manager Version (Untouched Data)
import React, { useEffect, useState } from 'react';
import userService from '../services/userService';           // To get list of all users for filter
import prospectService from '../services/prospectService';   // For fetching untouched prospects
import reportService from '../services/reportService';       // For KPIs
import transferService from '../services/transferService';   // For transferring data
import LoadingSpinner from '../components/LoadingSpinner/LoadingSpinner';
import Modal from '../components/Modal/Modal';                // Reusable Modal component
import styles from '../components/Layout/Layout.module.css'; // General layout styles
import tableStyles from './ReportPage.module.css';            // Reusing table/form styles
import formStyles from './ProspectFormPage.module.css';       // Reusing form element styles
import dashboardStyles from './DashboardPage.module.css';     // Reusing KPI card styles

const UntouchedDataPage = () => {
  const [untouchedProspects, setUntouchedProspects] = useState([]);
  const [allSalesPersonnel, setAllSalesPersonnel] = useState([]); // All TLs/Execs for 'Member Name' filter
  const [dashboardKpis, setDashboardKpis] = useState(null); // Manager dashboard KPIs
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter states (for input fields)
  const [memberFilter, setMemberFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  // Applied filters (these trigger data fetching)
  const [appliedFilters, setAppliedFilters] = useState({
    memberId: '',
    date: '',
  });

  // Modal states for 'Transfer Data' action (reused)
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [selectedProspectForTransfer, setSelectedProspectForTransfer] = useState(null);
  const [targetExecutiveForTransfer, setTargetExecutiveForTransfer] = useState('');
  const [transferLoading, setTransferLoading] = useState(false);
  const [transferError, setTransferError] = useState(null);
  const [transferSuccess, setTransferSuccess] = useState('');


  // Fetch initial data (KPIs, All Sales Personnel)
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch Manager dashboard KPIs for the top section
        const kpis = await reportService.getDashboardSummary();
        setDashboardKpis(kpis);

        // Fetch all Sales Executives and Team Leads for the filter dropdown
        const users = await userService.getAllUsers(); // Manager gets all relevant users
        setAllSalesPersonnel(users);
        
      } catch (err) {
        console.error('Failed to fetch initial untouched data page info:', err);
        setError(err.response?.data?.message || err.message || 'Failed to load initial untouched data.');
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  // Fetch untouched prospects based on applied filters
  useEffect(() => {
    const fetchFilteredUntouchedProspects = async () => {
      setLoading(true); // Set loading specific to prospect table fetch
      setError(null);
      try {
        const data = await prospectService.getUntouchedProspects(appliedFilters);
        setUntouchedProspects(data);
      } catch (err) {
        console.error('Failed to fetch filtered untouched prospects:', err);
        setError(err.response?.data?.message || err.message || 'Failed to apply filter for prospects.');
      } finally {
        setLoading(false);
      }
    };

    fetchFilteredUntouchedProspects();
  }, [appliedFilters]); // Trigger fetch when appliedFilters change (i.e., when search button is clicked)


  // Handler for the "Search" button click
  const handleSearchClick = (e) => {
    e.preventDefault();
    setAppliedFilters({
      memberId: memberFilter,
      date: dateFilter,
    });
  };


  // --- Transfer Modal Logic (remains same as TL version) ---
  const openTransferModal = (prospect) => {
    setSelectedProspectForTransfer(prospect);
    setTargetExecutiveForTransfer('');
    setTransferError(null);
    setTransferSuccess('');
    setShowTransferModal(true);
  };

  const closeTransferModal = () => {
    setShowTransferModal(false);
    setSelectedProspectForTransfer(null);
    setTargetExecutiveForTransfer('');
  };

  const handleTransferSubmit = async (e) => {
    e.preventDefault();
    setTransferLoading(true);
    setTransferError(null);
    setTransferSuccess('');

    if (!targetExecutiveForTransfer) {
      setTransferError('Please select an executive to transfer to.');
      setTransferLoading(false);
      return;
    }
    // Check if prospect is already assigned to the target (optional chaining for safety)
    if (selectedProspectForTransfer.salesExecutive?._id === targetExecutiveForTransfer) { 
        setTransferError('Prospect is already assigned to the target executive.');
        setTransferLoading(false);
        return;
    }

    try {
      await transferService.transferInternalData({
        sourceUserId: selectedProspectForTransfer.salesExecutive?._id, // Current executive who owns it
        targetUserId: targetExecutiveForTransfer,
        dataIds: [selectedProspectForTransfer._id], // Transfer just this one prospect
        dataType: 'prospects',
      });
      setTransferSuccess('Prospect transferred successfully!');
      // Remove transferred prospect from the list
      setUntouchedProspects(prev => prev.filter(p => p._id !== selectedProspectForTransfer._id));
      closeTransferModal(); // Close modal after successful transfer
    } catch (err) {
      setTransferError(err.response?.data?.message || err.message || 'Failed to transfer prospect.');
    } finally {
      setTransferLoading(false);
    }
  };


  // --- "Import Data" Placeholder ---
  const handleImportData = () => {
    alert('Import Data functionality will be implemented here (e.g., CSV upload).');
    // In a real app, this would trigger a file upload input and a call to a backend import API
  };


  if (loading && !untouchedProspects.length && !dashboardKpis && !allSalesPersonnel.length) {
    return <LoadingSpinner />;
  }

  return (
    <div className={styles.content}>
      <h1 className={tableStyles.pageTitle}>Untouched Data (Manager)</h1>

      {error && <p className={tableStyles.errorMessage}>{error}</p>}

      {/* KPI Cards Section */}
      {dashboardKpis && (
        <div className={dashboardStyles.kpiCards}>
          {/* Manager's dashboard KPIs might be different from simple TL untouched data ones */}
          <div className={dashboardStyles.kpiCard}>
            <h3>Total Data</h3>
            <p>{dashboardKpis.totalProspectOverall || 0}</p> {/* Manager's Total Prospect */}
          </div>
          <div className={dashboardStyles.kpiCard}>
            <h3>TODAY CALLS</h3>
            <p>{dashboardKpis.totalCalls || 0}</p> {/* Manager's Total Calls */}
          </div>
          <div className={dashboardStyles.kpiCard}>
            <h3>TOTAL PROSPECT</h3>
            <p>{dashboardKpis.totalProspectOverall || 0}</p> {/* Manager's Total Prospect */}
          </div>
          <div className={dashboardStyles.kpiCard}>
            <h3>TOTAL UNTOUCHED DATA</h3>
            <p>{dashboardKpis.totalUntouchedData || 0}</p> {/* This specific KPI should be provided by backend for Manager */}
          </div>
        </div>
      )}

      {/* Filters and Import Button */}
      <div className={tableStyles.reportSection}>
        <div className={tableStyles.sectionHeader}>
          <h2 className={tableStyles.sectionTitle}>Filter Untouched Prospects</h2>
          <button onClick={handleImportData} className={tableStyles.searchButton}>Import Data</button>
        </div>
        
        <form onSubmit={handleSearchClick} className={tableStyles.filterForm}>
          <div className={formStyles.formGroup}>
            <label htmlFor="memberId">Member Name</label>
            <select
              id="memberId"
              name="memberId"
              value={memberFilter}
              onChange={(e) => setMemberFilter(e.target.value)}
              className={formStyles.formInput}
            >
              <option value="">All Members</option>
              {allSalesPersonnel.map(member => (
                <option key={member._id} value={member._id}>{member.name} ({member.role.replace('_', ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')})</option>
              ))}
            </select>
          </div>
          <div className={formStyles.formGroup}>
            <label htmlFor="selectDate">Select Date</label>
            <input
              type="date"
              id="selectDate"
              name="selectDate"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className={formStyles.formInput}
            />
          </div>
          <button type="submit" className={tableStyles.searchButton} disabled={loading}>
            {loading ? 'Searching...' : 'Search'}
          </button>
        </form>
      </div>

      {/* Untouched Prospects Table */}
      <div className={tableStyles.reportSection}>
        <h2 className={tableStyles.sectionTitle}>All Untouched Prospects</h2>
        {loading && <LoadingSpinner />}
        {untouchedProspects.length === 0 && !loading && <p>No untouched prospects found based on current filters.</p>}
        {untouchedProspects.length > 0 && (
          <table className={tableStyles.reportTable}>
            <thead>
              <tr>
                <th>Company Name</th>
                <th>Client Name</th>
                <th>Email ID</th>
                <th>Last Call</th>
                <th>Sales Executive Name</th>
                <th>Team Lead Name</th> {/* Added TL Name for Manager's view */}
                <th>Transfer Data</th>
              </tr>
            </thead>
            <tbody>
              {untouchedProspects.map(prospect => (
                <tr key={prospect._id}>
                  <td>{prospect.companyName}</td>
                  <td>{prospect.clientName}</td>
                  <td>{prospect.emailId || 'N/A'}</td>
                  <td>{prospect.lastUpdate ? new Date(prospect.lastUpdate).toLocaleDateString() : 'N/A'}</td>
                  <td>{prospect.salesExecutive ? prospect.salesExecutive.name : 'N/A'}</td>
                  <td>{prospect.teamLead ? prospect.teamLead.name : 'N/A'}</td>
                  <td>
                    <button onClick={() => openTransferModal(prospect)} className={tableStyles.actionButton}>Select</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Transfer Prospect Modal (remains same as TL version) */}
      {showTransferModal && selectedProspectForTransfer && (
        <Modal onClose={closeTransferModal} title="Transfer Prospect">
          {transferSuccess && <p className={formStyles.successMessage}>{transferSuccess}</p>}
          {transferError && <p className={formStyles.errorMessage}>{transferError}</p>}
          <form onSubmit={handleTransferSubmit} className={formStyles.prospectForm}>
            <div className={formStyles.formGroup}>
              <label>Prospect:</label>
              <input type="text" value={`${selectedProspectForTransfer.clientName} (${selectedProspectForTransfer.companyName})`} disabled className={formStyles.formInput} />
            </div>
            <div className={formStyles.formGroup}>
              <label htmlFor="targetExecutive">Transfer To Executive:</label>
              <select
                id="targetExecutive"
                value={targetExecutiveForTransfer}
                onChange={(e) => setTargetExecutiveForTransfer(e.target.value)}
                className={formStyles.formInput}
                required
              >
                <option value="">Select Executive</option>
                {allSalesPersonnel.filter(member => member.role === 'sales_executive').map(member => ( // Filter for only executives
                  <option key={member._id} value={member._id}>{member.name}</option>
                ))}
              </select>
            </div>
            <button type="submit" className={formStyles.submitButton} disabled={transferLoading}>
              {transferLoading ? 'Transferring...' : 'Transfer'}
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default UntouchedDataPage;