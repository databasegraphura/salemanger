// src/pages/TransferDataPage.js - Manager Version (Internal & Finance Transfers)
import React, { useEffect, useState } from 'react';
import userService from '../services/userService';           // To get list of all users for dropdowns
import prospectService from '../services/prospectService';   // To fetch prospects for internal transfer
import salesService from '../services/salesService';         // To fetch sales for internal/finance transfer
import transferService from '../services/transferService';   // For initiating transfers and fetching history
import LoadingSpinner from '../components/LoadingSpinner/LoadingSpinner';
import styles from '../components/Layout/Layout.module.css'; // General layout styles
import tableStyles from './ReportPage.module.css';            // Reusing table styles
import formStyles from './ProspectFormPage.module.css';       // Reusing form element styles

const TransferDataPage = () => {
  const [allUsers, setAllUsers] = useState([]); // All TLs and Execs for source/target dropdowns
  const [internalTransferHistory, setInternalTransferHistory] = useState([]);
  const [financeTransferHistory, setFinanceTransferHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Internal Transfer Form states
  const [sourceUserId, setSourceUserId] = useState('');
  const [targetUserId, setTargetUserId] = useState('');
  const [transferDataType, setTransferDataType] = useState('prospects');
  const [transferCount, setTransferCount] = useState('');
  const [internalTransferLoading, setInternalTransferLoading] = useState(false);
  const [internalTransferError, setInternalTransferError] = useState(null);
  const [internalTransferSuccess, setInternalTransferSuccess] = useState('');

  // Finance Transfer Section states
  const [availableSales, setAvailableSales] = useState([]); // Sales not yet transferred to finance
  const [selectedSalesForFinance, setSelectedSalesForFinance] = useState([]); // IDs of sales selected for finance transfer
  const [financeTransferLoading, setFinanceTransferLoading] = useState(false);
  const [financeTransferError, setFinanceTransferError] = useState(null);
  const [financeTransferSuccess, setFinanceTransferSuccess] = useState('');


  // Fetch all users and transfer histories on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch all users (TLs and Execs) for internal transfer dropdowns
        const users = await userService.getAllUsers();
        setAllUsers(users);

        // Fetch histories
        const internalHistory = await transferService.getInternalTransferHistory();
        setInternalTransferHistory(internalHistory);

        const financeHistory = await transferService.getFinanceTransferHistory();
        setFinanceTransferHistory(financeHistory);

        // Fetch sales available for finance transfer (e.g., not yet transferred)
        const allSales = await salesService.getAllSales(); // Backend should return all sales for Manager
        // Filter out sales already marked as transferred to finance (assuming a flag in data)
        const notTransferredSales = allSales.filter(sale => !sale.isTransferredToFinance);
        setAvailableSales(notTransferredSales);

      } catch (err) {
        console.error('Failed to fetch transfer data page info:', err);
        setError(err.response?.data?.message || err.message || 'Failed to load transfer page data.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // --- INTERNAL DATA TRANSFER HANDLERS ---
  const handleInternalTransferSubmit = async (e) => {
    e.preventDefault();
    setInternalTransferLoading(true);
    setInternalTransferError(null);
    setInternalTransferSuccess('');

    if (!sourceUserId || !targetUserId || !transferCount || !transferDataType) {
      setInternalTransferError('Please select source, target, data type, and count.');
      setInternalTransferLoading(false);
      return;
    }
    if (sourceUserId === targetUserId) {
        setInternalTransferError('Source and target members cannot be the same.');
        setInternalTransferLoading(false);
        return;
    }
    if (isNaN(transferCount) || parseInt(transferCount, 10) <= 0) {
        setInternalTransferError('Transfer count must be a positive number.');
        setInternalTransferLoading(false);
        return;
    }

    try {
      let recordsToTransfer = [];
      if (transferDataType === 'prospects') {
        const sourceProspects = await prospectService.getAllProspects({ salesExecutive: sourceUserId });
        recordsToTransfer = sourceProspects.slice(0, parseInt(transferCount, 10));
      } else if (transferDataType === 'sales') {
        const sourceSales = await salesService.getAllSales({ salesExecutive: sourceUserId });
        recordsToTransfer = sourceSales.slice(0, parseInt(transferCount, 10));
      }

      if (recordsToTransfer.length === 0) {
        setInternalTransferError(`No ${transferDataType} found for the source member to transfer, or less than specified count.`);
        setInternalTransferLoading(false);
        return;
      }

      const dataIds = recordsToTransfer.map(rec => rec._id);

      await transferService.transferInternalData({
        sourceUserId,
        targetUserId,
        dataIds,
        dataType: transferDataType,
      });

      setInternalTransferSuccess(`${recordsToTransfer.length} ${transferDataType} transferred successfully!`);
      // Clear form and re-fetch history
      setSourceUserId('');
      setTargetUserId('');
      setTransferCount('');
      setInternalTransferHistory(await transferService.getInternalTransferHistory()); // Update history

      // Also refresh the affected list if needed (e.g., Prospect list for new owner)
      // For Manager, simply re-fetching all prospects/sales would reflect changes.
      // E.g., await prospectService.getAllProspects(); // If current page displayed this.

    } catch (err) {
      console.error('Internal Transfer failed:', err.response ? err.response.data : err.message);
      setInternalTransferError(err.response?.data?.message || err.message || 'Internal data transfer failed.');
    } finally {
      setInternalTransferLoading(false);
    }
  };

  // --- FINANCE TRANSFER HANDLERS ---
  const handleSelectSaleForFinance = (e) => {
    const saleId = e.target.value;
    if (e.target.checked) {
      setSelectedSalesForFinance(prev => [...prev, saleId]);
    } else {
      setSelectedSalesForFinance(prev => prev.filter(id => id !== saleId));
    }
  };

  const handleTransferToFinanceSubmit = async () => {
    setFinanceTransferLoading(true);
    setFinanceTransferError(null);
    setFinanceTransferSuccess('');

    if (selectedSalesForFinance.length === 0) {
      setFinanceTransferError('Please select at least one sale to transfer to finance.');
      setFinanceTransferLoading(false);
      return;
    }

    try {
      await transferService.transferToFinance(selectedSalesForFinance);
      setFinanceTransferSuccess(`${selectedSalesForFinance.length} sale(s) successfully transferred to Finance!`);
      setSelectedSalesForFinance([]); // Clear selection

      // Re-fetch available sales (should update to remove transferred ones)
      const allSales = await salesService.getAllSales();
      const notTransferredSales = allSales.filter(sale => !sale.isTransferredToFinance);
      setAvailableSales(notTransferredSales);
      
      // Re-fetch finance transfer history
      setFinanceTransferHistory(await transferService.getFinanceTransferHistory());

    } catch (err) {
      console.error('Transfer to Finance failed:', err.response ? err.response.data : err.message);
      setFinanceTransferError(err.response?.data?.message || err.message || 'Transfer to Finance failed.');
    } finally {
      setFinanceTransferLoading(false);
    }
  };


  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className={`${styles.content} ${tableStyles.errorContainer}`}>
        <h2>Error Loading Transfer Data Page</h2>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className={styles.content}>
      <h1 className={tableStyles.pageTitle}>Transfer Data (Manager)</h1>

      {/* Internal Data Transfer Section */}
      <div className={tableStyles.reportSection}>
        <h2 className={tableStyles.sectionTitle}>Internal Data Transfer</h2>
        {internalTransferSuccess && <p className={formStyles.successMessage}>{internalTransferSuccess}</p>}
        {internalTransferError && <p className={formStyles.errorMessage}>{internalTransferError}</p>}

        <form onSubmit={handleInternalTransferSubmit} className={tableStyles.filterForm}>
          <div className={formStyles.formGroup}>
            <label htmlFor="sourceMember">Source Member</label>
            <select
              id="sourceMember"
              value={sourceUserId}
              onChange={(e) => setSourceUserId(e.target.value)}
              className={formStyles.formInput}
              required
            >
              <option value="">Select Source</option>
              {allUsers.map((user) => (
                <option key={user._id} value={user._id}>{user.name} ({user.role.replace('_', ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')})</option>
              ))}
            </select>
          </div>

          <div className={formStyles.formGroup}>
            <label htmlFor="targetMember">Target Member</label>
            <select
              id="targetMember"
              value={targetUserId}
              onChange={(e) => setTargetUserId(e.target.value)}
              className={formStyles.formInput}
              required
            >
              <option value="">Select Target</option>
              {allUsers.map((user) => (
                <option key={user._id} value={user._id}>{user.name} ({user.role.replace('_', ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')})</option>
              ))}
            </select>
          </div>
          
          <div className={formStyles.formGroup}>
            <label htmlFor="dataType">Data Type</label>
            <select
              id="dataType"
              value={transferDataType}
              onChange={(e) => setTransferDataType(e.target.value)}
              className={formStyles.formInput}
              required
            >
              <option value="prospects">Prospects</option>
              <option value="sales">Sales</option>
            </select>
          </div>

          <div className={formStyles.formGroup}>
            <label htmlFor="transferCount">Transfer Data in No.</label>
            <input
              type="number"
              id="transferCount"
              value={transferCount}
              onChange={(e) => setTransferCount(e.target.value)}
              className={formStyles.formInput}
              min="1"
              required
            />
          </div>

          <button type="submit" className={tableStyles.searchButton} disabled={internalTransferLoading}>
            {internalTransferLoading ? 'Transferring...' : 'Transfer'}
          </button>
        </form>
      </div>

      {/* Internal Transfer History */}
      <div className={tableStyles.reportSection}>
        <h2 className={tableStyles.sectionTitle}>Internal Transfer History</h2>
        {internalTransferHistory.length === 0 && !loading ? (
          <p>No internal transfer history found.</p>
        ) : (
          <table className={tableStyles.reportTable}>
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>From</th>
                <th>To</th>
                <th>Count</th>
                <th>Transferred By</th>
              </tr>
            </thead>
            <tbody>
              {internalTransferHistory.map((log) => (
                <tr key={log._id}>
                  <td>{new Date(log.transferDate).toLocaleDateString()}</td>
                  <td>{log.transferType.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</td>
                  <td>{log.transferredFrom ? log.transferredFrom.name : 'N/A'}</td>
                  <td>{log.transferredTo ? log.transferredTo.name : 'N/A'}</td>
                  <td>{log.dataCount}</td>
                  <td>{log.transferredBy ? log.transferredBy.name : 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Transfer Data to Fin. Section */}
      <div className={tableStyles.reportSection}>
        <h2 className={tableStyles.sectionTitle}>Transfer Data to Fin.</h2>
        {financeTransferSuccess && <p className={formStyles.successMessage}>{financeTransferSuccess}</p>}
        {financeTransferError && <p className={formStyles.errorMessage}>{financeTransferError}</p>}

        <button onClick={handleTransferToFinanceSubmit} className={tableStyles.searchButton} disabled={financeTransferLoading || selectedSalesForFinance.length === 0}>
          {financeTransferLoading ? 'Transferring to Finance...' : `Transfer ${selectedSalesForFinance.length} Selected to Finance`}
        </button>
        
        {availableSales.length === 0 && !loading ? (
          <p>No sales available for transfer to finance.</p>
        ) : (
          <table className={tableStyles.reportTable}>
            <thead>
              <tr>
                <th><input type="checkbox" onChange={(e) => { // Select/Deselect All
                  if (e.target.checked) {
                    setSelectedSalesForFinance(availableSales.map(s => s._id));
                  } else {
                    setSelectedSalesForFinance([]);
                  }
                }}
                checked={selectedSalesForFinance.length === availableSales.length && availableSales.length > 0}
                /></th>
                <th>Company Name</th>
                <th>Client Name</th>
                <th>Email ID</th>
                <th>Contact No.</th>
                <th>Amount</th>
                <th>TL Name</th>
                <th>Sales Executive</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {availableSales.map((sale) => (
                <tr key={sale._id}>
                  <td><input type="checkbox" value={sale._id} onChange={handleSelectSaleForFinance} checked={selectedSalesForFinance.includes(sale._id)} /></td>
                  <td>{sale.companyName}</td>
                  <td>{sale.clientName}</td>
                  <td>{sale.emailId || 'N/A'}</td>
                  <td>{sale.contactNo || 'N/A'}</td>
                  <td>Rs. {sale.amount ? sale.amount.toFixed(2) : '0.00'}</td>
                  <td>{sale.teamLead ? sale.teamLead.name : 'N/A'}</td>
                  <td>{sale.salesExecutive ? sale.salesExecutive.name : 'N/A'}</td>
                  <td>{sale.saleDate ? new Date(sale.saleDate).toLocaleDateString() : 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Finance Transfer History */}
      <div className={tableStyles.reportSection}>
        <h2 className={tableStyles.sectionTitle}>Finance Transfer History</h2>
        {financeTransferHistory.length === 0 && !loading ? (
          <p>No finance transfer history found.</p>
        ) : (
          <table className={tableStyles.reportTable}>
            <thead>
              <tr>
                <th>Date</th>
                <th>Total Amount</th>
                <th>Transferred By</th>
                <th>Companies</th>
                <th>Clients</th>
                <th>Count</th>
              </tr>
            </thead>
            <tbody>
              {financeTransferHistory.map((log) => (
                <tr key={log._id}>
                  <td>{new Date(log.transferDate).toLocaleDateString()}</td>
                  <td>Rs. {log.amount ? log.amount.toFixed(2) : '0.00'}</td>
                  <td>{log.transferredBy ? log.transferredBy.name : 'N/A'}</td>
                  <td>{log.companyName || 'N/A'}</td>
                  <td>{log.clientName || 'N/A'}</td>
                  <td>{log.dataCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default TransferDataPage;