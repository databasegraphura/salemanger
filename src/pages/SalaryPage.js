// src/pages/SalaryPage.js - Manager Version (Salary Management)
import React, { useEffect, useState } from 'react';
import salaryService from '../services/salaryService'; // For fetching/creating/updating/deleting payouts
import userService from '../services/userService';   // For fetching users for payout assignment
import LoadingSpinner from '../components/LoadingSpinner/LoadingSpinner';
import Modal from '../components/Modal/Modal';
import styles from '../components/Layout/Layout.module.css'; // General layout styles
import tableStyles from './ReportPage.module.css';        // Reusing table styles
import formStyles from './ProspectFormPage.module.css';   // Reusing form element styles

const SalaryPage = () => {
  const [payouts, setPayouts] = useState([]);
  const [allUsers, setAllUsers] = useState([]); // All sales execs and TLs for dropdown
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State for Add/Edit Payout Modal
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [isEditingPayout, setIsEditingPayout] = useState(false);
  const [selectedPayout, setSelectedPayout] = useState(null); // Payout record being edited
  const [payoutFormData, setPayoutFormData] = useState({
    user: '', // ID of the user receiving payout
    month: new Date().toLocaleString('default', { month: 'long', year: 'numeric' }), // Default to current month/year
    amount: '',
    duration: 'Full Month',
    description: '',
  });
  const [payoutFormLoading, setPayoutFormLoading] = useState(false);
  const [payoutFormError, setPayoutFormError] = useState(null);
  const [payoutFormSuccess, setPayoutFormSuccess] = useState('');


  // Fetch All Payouts and All Eligible Users (Sales Execs & TLs)
  const fetchPayoutsAndUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const fetchedPayouts = await salaryService.getAllPayouts();
      setPayouts(fetchedPayouts);

      // Get all Sales Executives and Team Leads for the payout form dropdown
      const users = await userService.getAllUsers({ role: { $in: ['sales_executive', 'team_lead'] } });
      setAllUsers(users.filter(u => ['sales_executive', 'team_lead'].includes(u.role))); // Ensure relevant roles
    } catch (err) {
      console.error('Failed to fetch payouts/users:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load payout data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayoutsAndUsers();
  }, []);

  // --- Add/Edit Payout Form Handlers ---
  const openPayoutModal = (payout = null) => {
    if (payout) {
      setIsEditingPayout(true);
      setSelectedPayout(payout);
      setPayoutFormData({
        user: payout.user._id, // Pre-select user ID
        month: payout.month,
        amount: payout.amount,
        duration: payout.duration,
        description: payout.description,
      });
    } else {
      setIsEditingPayout(false);
      setSelectedPayout(null);
      setPayoutFormData({ // Reset to default for new payout
        user: '',
        month: new Date().toLocaleString('default', { month: 'long', year: 'numeric' }),
        amount: '',
        duration: 'Full Month',
        description: '',
      });
    }
    setPayoutFormError(null);
    setPayoutFormSuccess('');
    setShowPayoutModal(true);
  };

  const closePayoutModal = () => {
    setShowPayoutModal(false);
    setSelectedPayout(null);
    setIsEditingPayout(false);
    setPayoutFormError(null);
    setPayoutFormSuccess('');
  };

  const handlePayoutFormChange = (e) => {
    setPayoutFormData({
      ...payoutFormData,
      [e.target.name]: e.target.value,
    });
  };

  const handlePayoutSubmit = async (e) => {
    e.preventDefault();
    setPayoutFormLoading(true);
    setPayoutFormError(null);
    setPayoutFormSuccess('');

    try {
      if (isEditingPayout) {
        await salaryService.updatePayout(selectedPayout._id, payoutFormData);
        setPayoutFormSuccess('Payout updated successfully!');
      } else {
        await salaryService.createPayout(payoutFormData);
        setPayoutFormSuccess('Payout added successfully!');
        setPayoutFormData({ // Clear form
          user: '',
          month: new Date().toLocaleString('default', { month: 'long', year: 'numeric' }),
          amount: '',
          duration: 'Full Month',
          description: '',
        });
      }
      fetchPayoutsAndUsers(); // Re-fetch all payouts to update list
      // setTimeout(closePayoutModal, 1500); // Close after success message
    } catch (err) {
      console.error('Failed to save payout:', err.response ? err.response.data : err.message);
      setPayoutFormError(err.response?.data?.message || err.message || 'Failed to save payout.');
    } finally {
      setPayoutFormLoading(false);
    }
  };

  const handleDeletePayout = async (payoutId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this payout record? This action cannot be undone.");
    if (!confirmDelete) return;

    setLoading(true); // Reusing main page loading for delete action
    setError(null);
    try {
      await salaryService.deletePayout(payoutId);
      fetchPayoutsAndUsers(); // Re-fetch list
    } catch (err) {
      console.error('Failed to delete payout:', err.response ? err.response.data : err.message);
      setError(err.response?.data?.message || err.message || 'Failed to delete payout.');
    } finally {
      setLoading(false);
    }
  };


  if (loading && payouts.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <div className={styles.content}>
      <h1 className={tableStyles.pageTitle}>Salary Management</h1>

      {error && <p className={tableStyles.errorMessage}>{error}</p>}

      {/* Payouts List */}
      <div className={tableStyles.reportSection}>
        <div className={tableStyles.sectionHeader}>
          <h2 className={tableStyles.sectionTitle}>Employee Payout Records</h2>
          <button onClick={() => openPayoutModal()} className={tableStyles.searchButton}>Add New Payout</button>
        </div>
        
        {payouts.length === 0 && !loading ? (
          <p>No payout records found.</p>
        ) : (
          <table className={tableStyles.reportTable}>
            <thead>
              <tr>
                <th>Name</th>
                <th>TL Name</th>
                <th>Email ID</th>
                <th>Contact No.</th>
                <th>Month</th>
                <th>Duration</th>
                <th>Amount</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {payouts.map(payout => (
                <tr key={payout._id}>
                  <td>{payout.user ? payout.user.name : 'N/A'}</td>
                  <td>{payout.teamLead ? payout.teamLead.name : 'N/A'}</td>
                  <td>{payout.user ? payout.user.email : 'N/A'}</td>
                  <td>{payout.user ? payout.user.contactNo || 'N/A' : 'N/A'}</td>
                  <td>{payout.month}</td>
                  <td>{payout.duration || 'N/A'}</td>
                  <td>Rs. {payout.amount ? payout.amount.toFixed(2) : '0.00'}</td>
                  <td>
                    <button onClick={() => openPayoutModal(payout)} className={tableStyles.actionButton}>Edit</button>
                    <button onClick={() => handleDeletePayout(payout._id)} className={`${tableStyles.actionButton} ${tableStyles.deleteButton}`}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add/Edit Payout Modal */}
      {showPayoutModal && (
        <Modal onClose={closePayoutModal} title={isEditingPayout ? "Edit Payout" : "Add New Payout"}>
          {payoutFormSuccess && <p className={formStyles.successMessage}>{payoutFormSuccess}</p>}
          {payoutFormError && <p className={formStyles.errorMessage}>{payoutFormError}</p>}
          <form onSubmit={handlePayoutSubmit} className={formStyles.prospectForm}>
            <div className={formStyles.formGroup}>
              <label htmlFor="payoutUser">Employee</label>
              <select
                id="payoutUser"
                name="user"
                value={payoutFormData.user}
                onChange={handlePayoutFormChange}
                className={formStyles.formInput}
                required
                disabled={isEditingPayout} // Cannot change user when editing
              >
                <option value="">Select Employee</option>
                {allUsers.map(user => (
                  <option key={user._id} value={user._id}>{user.name} ({user.role.replace('_', ' ')})</option>
                ))}
              </select>
            </div>
            <div className={formStyles.formGroup}>
              <label htmlFor="payoutMonth">Month</label>
              <input
                type="text"
                id="payoutMonth"
                name="month"
                value={payoutFormData.month}
                onChange={handlePayoutFormChange}
                className={formStyles.formInput}
                required
                placeholder="e.g., July 2025"
              />
            </div>
            <div className={formStyles.formGroup}>
              <label htmlFor="payoutAmount">Amount</label>
              <input
                type="number"
                id="payoutAmount"
                name="amount"
                value={payoutFormData.amount}
                onChange={handlePayoutFormChange}
                className={formStyles.formInput}
                required
                min="0"
              />
            </div>
            <div className={formStyles.formGroup}>
              <label htmlFor="payoutDuration">Duration</label>
              <select
                id="payoutDuration"
                name="duration"
                value={payoutFormData.duration}
                onChange={handlePayoutFormChange}
                className={formStyles.formInput}
              >
                <option value="Full Month">Full Month</option>
                <option value="Half Month">Half Month</option>
                <option value="Bonus">Bonus</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className={formStyles.formGroup}>
              <label htmlFor="payoutDescription">Description</label>
              <textarea
                id="payoutDescription"
                name="description"
                value={payoutFormData.description}
                onChange={handlePayoutFormChange}
                className={formStyles.formTextarea}
                rows="3"
              ></textarea>
            </div>
            <button type="submit" className={formStyles.submitButton} disabled={payoutFormLoading}>
              {payoutFormLoading ? 'Saving...' : (isEditingPayout ? 'Save Changes' : 'Add Payout')}
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default SalaryPage;