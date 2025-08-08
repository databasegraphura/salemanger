// src/pages/ManagerReportPage.js - Manager Version
import React, { useEffect, useState } from 'react';
import reportService from '../services/reportService';   // For KPIs and specific manager reports
import callLogService from '../services/callLogService'; // For updating call logs
import prospectService from '../services/prospectService'; // For updating prospect related to call logs
import userService from '../services/userService';       // For fetching Team Leads/Executives for filters
import LoadingSpinner from '../components/LoadingSpinner/LoadingSpinner';
import Modal from '../components/Modal/Modal';            // Reusable Modal
import styles from '../components/Layout/Layout.module.css'; // General layout styles
import tableStyles from './ReportPage.module.css';     // Reusing table/form styles
import formStyles from './ProspectFormPage.module.css'; // Reusing form input styles
import dashboardStyles from './DashboardPage.module.css'; // Reusing KPI card styles

const ManagerReportPage = () => {
  const [kpiData, setKpiData] = useState(null);
  const [managerCallLogs, setManagerCallLogs] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);
  const [teamLeads, setTeamLeads] = useState([]); // For filter
  const [salesExecutives, setSalesExecutives] = useState([]); // For filter

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Call Log Filters
  const [callLogFilters, setCallLogFilters] = useState({
    month: '',
    teamLeadId: '',
    executiveId: '',
    companyName: '',
    contactNo: '', // "Contact ID" in screenshot
  });
  const [appliedCallLogFilters, setAppliedCallLogFilters] = useState({
    month: '',
    teamLeadId: '',
    executiveId: '',
    companyName: '',
    contactNo: '',
  });


  // Modal states for 'Update Call'
  const [showUpdateCallModal, setShowUpdateCallModal] = useState(false);
  const [selectedCall, setSelectedCall] = useState(null);
  const [updateCallFormData, setUpdateCallFormData] = useState({ activity: '', comment: '' });
  const [updateCallError, setUpdateCallError] = useState(null);
  const [updateCallSuccess, setUpdateCallSuccess] = useState('');


  // Fetch initial data (KPIs, Team Leads, Executives)
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        setError(null);

        const summary = await reportService.getDashboardSummary();
        // The manager's dashboard summary includes: totalClientsSpoken, totalCalls, lastMonthProspect, totalUntouchedData
        setKpiData(summary);

        const tls = await userService.getAllUsers({ role: 'team_lead' });
        setTeamLeads(tls.filter(user => user.role === 'team_lead'));

        const execs = await userService.getAllUsers({ role: 'sales_executive' });
        setSalesExecutives(execs.filter(user => user.role === 'sales_executive'));

      } catch (err) {
        console.error('Failed to fetch initial manager report data:', err);
        setError(err.response?.data?.message || err.message || 'Failed to load initial report data.');
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  // Fetch Manager Call Logs based on applied filters
  useEffect(() => {
    const fetchManagerCallLogs = async () => {
      setLoading(true);
      setError(null);
      try {
        const calls = await reportService.getManagerCallReport(appliedCallLogFilters);
        setManagerCallLogs(calls);
      } catch (err) {
        console.error('Failed to fetch manager call logs:', err);
        setError(err.response?.data?.message || err.message || 'Failed to load call logs.');
      } finally {
        setLoading(false);
      }
    };

    fetchManagerCallLogs();
  }, [appliedCallLogFilters]); // Re-fetch when applied filters change


  // Fetch Activity Logs (for "Last Update" section)
  useEffect(() => {
    const fetchActivityLogs = async () => {
      try {
        const logs = await reportService.getActivityLogs();
        setActivityLogs(logs);
      } catch (err) {
        console.error('Failed to fetch activity logs:', err);
        // Don't set error for the whole page if just activity logs fail
      }
    };
    fetchActivityLogs();
  }, []);


  // --- Call Log Filter Handlers ---
  const handleCallLogFilterChange = (e) => {
    setCallLogFilters({
      ...callLogFilters,
      [e.target.name]: e.target.value,
    });
  };

  const handleApplyCallLogFilters = (e) => {
    e.preventDefault();
    setAppliedCallLogFilters(callLogFilters); // This will trigger the useEffect
  };


  // --- Modal Logic for Update Call ---
  const openUpdateCallModal = (call) => {
    setSelectedCall(call);
    setUpdateCallFormData({ activity: call.activity, comment: call.comment });
    setUpdateCallError(null);
    setUpdateCallSuccess('');
    setShowUpdateCallModal(true);
  };

  const closeUpdateCallModal = () => {
    setShowUpdateCallModal(false);
    setSelectedCall(null);
    setUpdateCallFormData({ activity: '', comment: '' });
  };

  const handleUpdateCallChange = (e) => {
    setUpdateCallFormData({
      ...updateCallFormData,
      [e.target.name]: e.target.value,
    });
  };

  const handleUpdateCallSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // General loading for the page refresh
    setUpdateCallError(null);
    setUpdateCallSuccess('');

    try {
      const updatedCall = await callLogService.updateCallLog(selectedCall._id, updateCallFormData);
      setUpdateCallSuccess('Call log updated successfully!');
      // Refresh the list after update
      setManagerCallLogs(prev => prev.map(call => call._id === updatedCall._id ? updatedCall : call));
      setTimeout(closeUpdateCallModal, 1500); // Close modal after showing success
    } catch (err) {
      setUpdateCallError(err.response?.data?.message || err.message || 'Failed to update call log.');
    } finally {
      setLoading(false);
    }
  };

  // --- Delete Client's Profile (from Call Log Update Modal) ---
  const handleDeleteClientProfile = async (callId, prospectId) => {
    const confirmDelete = window.confirm("Are you sure you want to mark this client's profile as deleted? This will update the associated prospect.");
    if (!confirmDelete) return;

    setLoading(true);
    setUpdateCallError(null);
    setUpdateCallSuccess('');

    try {
      // Update the call log's activity to 'Delete Client\'s Profile'
      await callLogService.updateCallLog(callId, { activity: 'Delete Client\'s Profile' });
      // The backend prospectController handles updating the prospect's status automatically
      setUpdateCallSuccess("Client's profile marked as deleted!");
      // Refresh relevant lists
      setManagerCallLogs(prev => prev.map(call => call._id === callId ? { ...call, activity: 'Delete Client\'s Profile' } : call));
      setTimeout(closeUpdateCallModal, 1500);
    } catch (err) {
      console.error("Failed to delete client's profile:", err.response?.data?.message || err.message);
      setUpdateCallError(err.response?.data?.message || err.message || "Failed to mark client's profile as deleted.");
    } finally {
      setLoading(false);
    }
  };


  if (loading && !kpiData && !managerCallLogs.length && !activityLogs.length) {
    return <LoadingSpinner />;
  }

  return (
    <div className={styles.content}>
      <h1 className={tableStyles.pageTitle}>Manager Report</h1>

      {error && <p className={tableStyles.errorMessage}>{error}</p>}

      {/* KPI Cards Section */}
      {kpiData && (
        <div className={dashboardStyles.kpiCards}>
          <div className={dashboardStyles.kpiCard}><h3>TOTAL CLIENTS SPOKEN</h3><p>{kpiData.totalClientsSpoken || 0}</p></div>
          <div className={dashboardStyles.kpiCard}><h3>TOTAL CALLS</h3><p>{kpiData.totalCalls || 0}</p></div>
          <div className={dashboardStyles.kpiCard}><h3>LAST MONTH'S PROSPECT</h3><p>{kpiData.lastMonthProspect || 0}</p></div>
          <div className={dashboardStyles.kpiCard}><h3>TOTAL UNTOUCHED DATA</h3><p>{kpiData.totalUntouchedData || 0}</p></div>
        </div>
      )}

      {/* Call Logs Section */}
      <div className={tableStyles.reportSection}>
        <h2 className={tableStyles.sectionTitle}>Call Logs</h2>
        <form onSubmit={handleApplyCallLogFilters} className={tableStyles.filterForm}>
          <div className={formStyles.formGroup}>
            <label htmlFor="month">Month</label>
            <select id="month" name="month" value={callLogFilters.month} onChange={handleCallLogFilterChange} className={formStyles.formInput}>
              <option value="">All</option>
              {Array.from({ length: 12 }, (_, i) => i + 1).map(monthNum => (
                <option key={monthNum} value={monthNum}>{new Date(0, monthNum - 1).toLocaleString('default', { month: 'long' })}</option>
              ))}
            </select>
          </div>
          <div className={formStyles.formGroup}>
            <label htmlFor="teamLeadId">Team Leader Name</label>
            <select id="teamLeadId" name="teamLeadId" value={callLogFilters.teamLeadId} onChange={handleCallLogFilterChange} className={formStyles.formInput}>
              <option value="">All TLs</option>
              {teamLeads.map(tl => (<option key={tl._id} value={tl._id}>{tl.name}</option>))}
            </select>
          </div>
          <div className={formStyles.formGroup}>
            <label htmlFor="executiveId">Sales Executive Name</label>
            <select id="executiveId" name="executiveId" value={callLogFilters.executiveId} onChange={handleCallLogFilterChange} className={formStyles.formInput}>
              <option value="">All Execs</option>
              {salesExecutives.map(exec => (<option key={exec._id} value={exec._id}>{exec.name}</option>))}
            </select>
          </div>
          <div className={formStyles.formGroup}>
            <label htmlFor="companyName">Company Name</label>
            <input type="text" id="companyName" name="companyName" value={callLogFilters.companyName} onChange={handleCallLogFilterChange} className={formStyles.formInput} placeholder="Search Company" />
          </div>
          <div className={formStyles.formGroup}>
            <label htmlFor="contactNo">Contact ID</label>
            <input type="text" id="contactNo" name="contactNo" value={callLogFilters.contactNo} onChange={handleCallLogFilterChange} className={formStyles.formInput} placeholder="Search Contact No" />
          </div>
          <button type="submit" className={tableStyles.searchButton} disabled={loading}>
            {loading ? 'Searching...' : 'Search'}
          </button>
        </form>

        {managerCallLogs.length === 0 && !loading ? (
          <p>No call logs found based on current filters.</p>
        ) : (
          <table className={tableStyles.reportTable}>
            <thead>
              <tr>
                <th>Company Name</th>
                <th>Client Name</th>
                <th>Email ID</th>
                <th>Contact No.</th>
                <th>Activity</th>
                <th>Remarks</th>
                <th>Sales Executive</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {managerCallLogs.map(call => (
                <tr key={call._id}>
                  <td>{call.companyName}</td>
                  <td>{call.clientName}</td>
                  <td>{call.emailId || 'N/A'}</td>
                  <td>{call.contactNo || 'N/A'}</td>
                  <td>{call.activity}</td>
                  <td>{call.comment || 'N/A'}</td>
                  <td>{call.salesExecutive ? call.salesExecutive.name : 'N/A'}</td>
                  <td>
                    <button onClick={() => openUpdateCallModal(call)} className={tableStyles.actionButton}>Update</button>
                    {/* The screenshot shows a "Delete Client's Profile" action here,
                        which we will include in the Update modal */}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Last Update Section */}
      <div className={tableStyles.reportSection}>
        <h2 className={tableStyles.sectionTitle}>Last Update</h2>
        {activityLogs.length === 0 && !loading ? (
          <p>No recent activity logs found.</p>
        ) : (
          <table className={tableStyles.reportTable}>
            <thead>
              <tr>
                <th>Date</th>
                <th>Time</th>
                <th>Description</th>
                <th>User</th>
              </tr>
            </thead>
            <tbody>
              {activityLogs.map((log, index) => (
                <tr key={index}>
                  <td>{log.date ? new Date(log.date).toLocaleDateString() : 'N/A'}</td>
                  <td>{log.date ? new Date(log.date).toLocaleTimeString() : 'N/A'}</td>
                  <td>{log.description}</td>
                  <td>{log.user}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Update Call Modal */}
      {showUpdateCallModal && selectedCall && (
        <Modal onClose={closeUpdateCallModal} title="Update Call Details">
          {updateCallSuccess && <p className={formStyles.successMessage}>{updateCallSuccess}</p>}
          {updateCallError && <p className={formStyles.errorMessage}>{updateCallError}</p>}
          <form onSubmit={handleUpdateCallSubmit} className={tableStyles.modalForm}>
            <div className={tableStyles.formGroup}>
              <label>Company Name</label>
              <input type="text" value={selectedCall.companyName} disabled className={tableStyles.formInput} />
            </div>
            <div className={tableStyles.formGroup}>
              <label>Client Name</label>
              <input type="text" value={selectedCall.clientName} disabled className={tableStyles.formInput} />
            </div>
            <div className={tableStyles.formGroup}>
              <label htmlFor="updateActivity">Activity</label>
              <select
                id="updateActivity"
                name="activity"
                value={updateCallFormData.activity}
                onChange={handleUpdateCallChange}
                className={tableStyles.formInput}
                required
              >
                <option value="">Select Activity</option>
                <option value="Talked">Talked</option>
                <option value="Not Talked">Not Talked</option>
                <option value="Follow Up">Follow Up</option>
                <option value="Delete Client's Profile">Delete Client's Profile</option> {/* As per screenshot */}
              </select>
            </div>
            <div className={tableStyles.formGroup}>
              <label htmlFor="updateComment">Comment</label>
              <textarea
                id="updateComment"
                name="comment"
                value={updateCallFormData.comment}
                onChange={handleUpdateCallChange}
                className={formStyles.formTextarea}
                rows="3"
              ></textarea>
            </div>
            <div className={tableStyles.formActions}> {/* Using formActions for button group */}
              <button type="submit" className={tableStyles.submitButton} disabled={loading}>
                {loading ? 'Updating...' : 'Update'}
              </button>
              {/* "Delete Client's Profile" button as per screenshot, outside the update submit */}
              {updateCallFormData.activity === "Delete Client's Profile" && selectedCall.prospect && (
                <button
                  type="button"
                  onClick={() => handleDeleteClientProfile(selectedCall._id, selectedCall.prospect._id)}
                  className={`${tableStyles.actionButton} ${tableStyles.deleteButton}`} // Add a deleteButton style
                  disabled={loading}
                >
                  Delete Client's Profile
                </button>
              )}
              {/* Optional: Close button if not auto-closing */}
              {/* <button type="button" onClick={closeUpdateCallModal} className={tableStyles.cancelButton}>Close</button> */}
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default ManagerReportPage;