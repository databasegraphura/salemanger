// src/pages/TotalProspectPage.js - Manager Version
import React, { useEffect, useState } from 'react';
import prospectService from '../services/prospectService'; // For fetching/updating prospects
import userService from '../services/userService';       // For fetching Team Leads for filters
import LoadingSpinner from '../components/LoadingSpinner/LoadingSpinner';
import Modal from '../components/Modal/Modal';            // Reusable Modal component
import ProspectUpdateModal from '../components/ProspectUpdateModal/ProspectUpdateModal'; // For updating prospects
import styles from '../components/Layout/Layout.module.css'; // General layout styles
import tableStyles from './ReportPage.module.css';        // Reusing table/form styles
import formStyles from './ProspectFormPage.module.css';   // Reusing form element styles

const TotalProspectPage = () => {
  const [prospects, setProspects] = useState([]);
  const [teamLeads, setTeamLeads] = useState([]); // For 'Team Leader Name' filter dropdown
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter states (for input fields)
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedTeamLeadId, setSelectedTeamLeadId] = useState('');

  // Applied filters (these trigger data fetching)
  const [appliedFilters, setAppliedFilters] = useState({
    month: '',
    teamLeadId: '',
  });

  // Modal states for 'Update' and 'View'
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedProspect, setSelectedProspect] = useState(null); // The prospect selected for update/view


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
        setError(err.response?.data?.message || err.message || 'Failed to load Team Leads for filters.');
      }
    };
    fetchTeamLeads();
  }, []);

  // Fetch Prospects based on applied filters
  useEffect(() => {
    const fetchProspects = async () => {
      setLoading(true);
      setError(null);
      try {
        // The backend's getAllProspects API for Manager returns all prospects, filtered by query params
        const data = await prospectService.getAllProspects(appliedFilters);
        setProspects(data);
      } catch (err) {
        console.error('Failed to fetch prospects data:', err);
        setError(err.response?.data?.message || err.message || 'An unexpected error occurred while fetching prospects.');
        setProspects([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProspects();
  }, [appliedFilters]); // Dependency array: `appliedFilters` changes trigger re-fetch


  // Handle Search button click
  const handleSearchClick = (e) => {
    e.preventDefault();
    setAppliedFilters({
      month: selectedMonth,
      teamLeadId: selectedTeamLeadId,
    });
  };

  // --- Modal Logic for Update (Reusing ProspectUpdateModal) ---
  const openUpdateModal = (prospect) => {
    setSelectedProspect(prospect);
    setShowUpdateModal(true);
  };

  const closeUpdateModal = () => {
    setShowUpdateModal(false);
    setSelectedProspect(null);
  };

  // This function will be passed to the modal and called when its form is submitted
  const handleUpdateProspect = async (prospectId, formData) => {
    setLoading(true); // Can manage a separate modal-specific loading if needed
    try {
      const updatedProspect = await prospectService.updateProspect(prospectId, formData);
      setProspects(prev => prev.map(p => p._id === updatedProspect._id ? updatedProspect : p));
      closeUpdateModal(); // Close modal on successful update
      return updatedProspect; // Return for success message in modal
    } catch (err) {
      console.error('Failed to update prospect from modal:', err);
      throw err; // Re-throw to be handled by the modal component
    } finally {
      setLoading(false);
    }
  };

  // --- Modal Logic for View ---
  const openViewModal = (prospect) => {
    setSelectedProspect(prospect);
    setShowViewModal(true);
  };

  const closeViewModal = () => {
    setShowViewModal(false);
    setSelectedProspect(null);
  };


  if (loading && prospects.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <div className={styles.content}>
      <h1 className={tableStyles.pageTitle}>Total Prospect (Manager)</h1>

      {error && <p className={tableStyles.errorMessage}>{error}</p>}

      {/* Filter Section */}
      <div className={tableStyles.reportSection}>
        <h2 className={tableStyles.sectionTitle}>Filter Prospect Records</h2>
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

      {/* Prospect Records Table */}
      <div className={tableStyles.reportSection}>
        <h2 className={tableStyles.sectionTitle}>All Prospect Records</h2>
        {prospects.length === 0 && !loading ? (
          <p>No prospect records found based on current filters.</p>
        ) : (
          <table className={tableStyles.reportTable}>
            <thead>
              <tr>
                <th>Company Name</th>
                <th>Client Name</th>
                <th>Email ID</th>
                <th>Contact No.</th>
                <th>TL Name</th>
                <th>Sales Executive</th>
                <th>Activity</th>
                <th>Last Update</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {prospects.map((prospect) => (
                <tr key={prospect._id}>
                  <td>{prospect.companyName}</td>
                  <td>{prospect.clientName}</td>
                  <td>{prospect.emailId || 'N/A'}</td>
                  <td>{prospect.contactNo || 'N/A'}</td>
                  <td>{prospect.teamLead ? prospect.teamLead.name : 'N/A'}</td>
                  <td>{prospect.salesExecutive ? prospect.salesExecutive.name : 'N/A'}</td>
                  <td>{prospect.activity}</td>
                  <td>{prospect.lastUpdate ? new Date(prospect.lastUpdate).toLocaleDateString() : 'N/A'}</td>
                  <td>
                    <button onClick={() => openUpdateModal(prospect)} className={tableStyles.actionButton}>Update</button>
                    <button onClick={() => openViewModal(prospect)} className={tableStyles.actionButton}>View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Update Prospect Modal */}
      {showUpdateModal && selectedProspect && (
        <ProspectUpdateModal
          prospect={selectedProspect}
          onClose={closeUpdateModal}
          onUpdateSuccess={handleUpdateProspect}
          isLoading={loading}
        />
      )}

      {/* View Prospect Modal */}
      {showViewModal && selectedProspect && (
        <Modal onClose={closeViewModal} title="Prospect Details">
          <div className={tableStyles.detailItem}><strong>Company Name:</strong> {selectedProspect.companyName}</div>
          <div className={tableStyles.detailItem}><strong>Client Name:</strong> {selectedProspect.clientName}</div>
          <div className={tableStyles.detailItem}><strong>Email ID:</strong> {selectedProspect.emailId || 'N/A'}</div>
          <div className={tableStyles.detailItem}><strong>Contact No.:</strong> {selectedProspect.contactNo || 'N/A'}</div>
          <div className={tableStyles.detailItem}><strong>Reminder Date:</strong> {selectedProspect.reminderDate ? new Date(selectedProspect.reminderDate).toLocaleDateString() : 'N/A'}</div>
          <div className={tableStyles.detailItem}><strong>Current Activity:</strong> {selectedProspect.activity}</div>
          <div className={tableStyles.detailItem}><strong>Last Update:</strong> {selectedProspect.lastUpdate ? new Date(selectedProspect.lastUpdate).toLocaleString() : 'N/A'}</div>
          <div className={tableStyles.detailItem}><strong>Comment:</strong> {selectedProspect.comment || 'No comment'}</div>
          <div className={tableStyles.detailItem}><strong>Sales Executive:</strong> {selectedProspect.salesExecutive?.name || 'N/A'}</div>
          <div className={tableStyles.detailItem}><strong>Team Lead:</strong> {selectedProspect.teamLead?.name || 'N/A'}</div>
        </Modal>
      )}
    </div>
  );
};

export default TotalProspectPage;