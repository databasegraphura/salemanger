// src/pages/TeamMemberPage.js - Manager Version (All User Management) - FIX for bankName error
import React, { useEffect, useState } from 'react';
import userService from '../services/userService';
import teamService from '../services/teamService';
import LoadingSpinner from '../components/LoadingSpinner/LoadingSpinner';
import Modal from '../components/Modal/Modal';
import styles from '../components/Layout/Layout.module.css';
import tableStyles from './ReportPage.module.css';
import formStyles from './ProspectFormPage.module.css';
import userPageStyles from './UserDataPage.module.css';

const TeamMemberPage = () => {
  const [allUsers, setAllUsers] = useState([]);
  const [allTeams, setAllTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State for Add New Member form (Manager's comprehensive form)
  const [newMemberFormData, setNewMemberFormData] = useState({
    name: '', email: '', password: '', passwordConfirm: '', refId: '',
    role: 'sales_executive',
    contactNo: '', location: '', joiningDate: new Date().toISOString().split('T')[0],
    // --- FIX START: Ensure bankDetails is initialized as an object ---
    bankDetails: {
      bankName: '', accountNo: '', ifscCode: '', upiId: ''
    },
    // --- FIX END ---
    managerId: '',
    teamId: ''
  });
  const [addMemberLoading, setAddMemberLoading] = useState(false);
  const [addMemberError, setAddMemberError] = useState(null);
  const [addMemberSuccess, setAddMemberSuccess] = useState('');

  // State for View/Edit/Delete Member Modal
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [isEditingMember, setIsEditingMember] = useState(false);
  const [editMemberFormData, setEditMemberFormData] = useState({
    name: '', email: '', contactNo: '', location: '', status: '',
    role: '', refId: '', managerId: '', teamId: '',
    // --- FIX START: Ensure bankDetails is initialized as an object here too ---
    bankDetails: { bankName: '', accountNo: '', ifscCode: '', upiId: '' }
    // --- FIX END ---
  });
  const [editMemberLoading, setEditMemberLoading] = useState(false);
  const [editMemberError, setEditMemberError] = useState(null);
  const [editMemberSuccess, setEditMemberSuccess] = useState('');


  // Fetch All Users (Sales Execs + Team Leads) and All Teams
  const fetchAllUsersAndTeams = async () => {
    setLoading(true);
    setError(null);
    try {
      const users = await userService.getAllUsers();
      setAllUsers(users);

      const teams = await teamService.getAllTeams();
      setAllTeams(teams);

    } catch (err) {
      console.error('Failed to fetch all users/teams:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load user and team data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllUsersAndTeams();
  }, []);

  // --- Add New Member Form Handlers ---
  const handleNewMemberChange = (e) => {
    if (e.target.name.startsWith('bankDetails.')) {
      const bankField = e.target.name.split('.')[1];
      setNewMemberFormData(prev => ({
        ...prev,
        bankDetails: {
          // --- FIX START: Safely spread prev.bankDetails ---
          ...(prev.bankDetails || {}), // Ensure prev.bankDetails is an object, or an empty one
          // --- FIX END ---
          [bankField]: e.target.value
        }
      }));
    } else {
      setNewMemberFormData({
        ...newMemberFormData,
        [e.target.name]: e.target.value,
      });
    }
  };

  const handleNewMemberSubmit = async (e) => {
    e.preventDefault();
    setAddMemberLoading(true);
    setAddMemberError(null);
    setAddMemberSuccess('');

    try {
      const newUserData = {
        name: newMemberFormData.name,
        email: newMemberFormData.email,
        password: newMemberFormData.password,
        passwordConfirm: newMemberFormData.passwordConfirm,
        refId: newMemberFormData.refId,
        role: newMemberFormData.role,
        contactNo: newMemberFormData.contactNo,
        location: newMemberFormData.location,
        joiningDate: newMemberFormData.joiningDate,
        bankDetails: newMemberFormData.bankDetails, // Send the nested object
        managerId: newMemberFormData.managerId,
        teamId: newMemberFormData.teamId
      };

      await userService.createUser(newUserData);
      setAddMemberSuccess('New user added successfully!');
      setNewMemberFormData({ // Clear form and reset bankDetails object
        name: '', email: '', password: '', passwordConfirm: '', refId: '',
        role: 'sales_executive', contactNo: '', location: '', joiningDate: new Date().toISOString().split('T')[0],
        bankDetails: { bankName: '', accountNo: '', ifscCode: '', upiId: '' }, // Reset as object
        managerId: '', teamId: ''
      });
      fetchAllUsersAndTeams();
    } catch (err) {
      console.error('Failed to add new user:', err.response ? err.response.data : err.message);
      setAddMemberError(err.response?.data?.message || err.message || 'Failed to add new user.');
    } finally {
      setAddMemberLoading(false);
    }
  };

  // --- View/Edit/Delete Member Modal Handlers ---
  const openMemberModal = (member, editMode = false) => {
    setSelectedMember(member);
    setIsEditingMember(editMode);
    if (editMode) {
      setEditMemberFormData({
        name: member.name || '', email: member.email || '', contactNo: member.contactNo || '',
        location: member.location || '', status: member.status || 'active',
        role: member.role || 'sales_executive', refId: member.refId || '',
        managerId: member.manager?._id || '',
        teamId: member.team?._id || '',
        // --- FIX START: Safely initialize bankDetails object ---
        bankDetails: {
          bankName: member.bankDetails?.bankName || '',
          accountNo: member.bankDetails?.accountNo || '',
          ifscCode: member.bankDetails?.ifscCode || '',
          upiId: member.bankDetails?.upiId || '',
        }
        // --- FIX END ---
      });
      setEditMemberError(null);
      setEditMemberSuccess('');
    }
    setShowMemberModal(true);
  };

  const closeMemberModal = () => {
    setShowMemberModal(false);
    setSelectedMember(null);
    setIsEditingMember(false);
    setEditMemberError(null);
    setEditMemberSuccess('');
  };

  const handleEditMemberChange = (e) => {
    if (e.target.name.startsWith('bankDetails.')) {
      const bankField = e.target.name.split('.')[1];
      setEditMemberFormData(prev => ({
        ...prev,
        bankDetails: {
          // --- FIX START: Safely spread prev.bankDetails ---
          ...(prev.bankDetails || {}),
          // --- FIX END ---
          [bankField]: e.target.value
        }
      }));
    } else {
      setEditMemberFormData({
        ...editMemberFormData,
        [e.target.name]: e.target.value,
      });
    }
  };

  const handleUpdateMemberSubmit = async (e) => {
    e.preventDefault();
    setEditMemberLoading(true);
    setEditMemberError(null);
    setEditMemberSuccess('');

    try {
      const updatePayload = {
        name: editMemberFormData.name,
        email: editMemberFormData.email,
        contactNo: editMemberFormData.contactNo,
        location: editMemberFormData.location,
        status: editMemberFormData.status,
        role: editMemberFormData.role,
        refId: editMemberFormData.refId,
        manager: editMemberFormData.managerId || null,
        team: editMemberFormData.teamId || null,
        bankDetails: editMemberFormData.bankDetails // Send the nested object
      };

      const updatedUser = await userService.updateUser(selectedMember._id, updatePayload);
      setEditMemberSuccess('User updated successfully!');
      setAllUsers(prev => prev.map(u => u._id === updatedUser._id ? updatedUser : u));
    } catch (err) {
      console.error('Failed to update user:', err.response ? err.response.data : err.message);
      setEditMemberError(err.response?.data?.message || err.message || 'Failed to update user.');
    } finally {
      setEditMemberLoading(false);
    }
  };

  const handleDeleteMember = async (memberId) => {
    const confirmDelete = window.confirm(`Are you sure you want to delete ${selectedMember?.name || 'this user'}? This action cannot be undone.`);
    if (!confirmDelete) return;

    setEditMemberLoading(true);
    setEditMemberError(null);
    setEditMemberSuccess('');

    try {
      await userService.deleteUser(memberId);
      setEditMemberSuccess('User deleted successfully!');
      setAllUsers(prev => prev.filter(u => u._id !== memberId));
      setTimeout(closeMemberModal, 1500);
    } catch (err) {
      console.error('Failed to delete user:', err.response ? err.response.data : err.message);
      setEditMemberError(err.response?.data?.message || err.message || 'Failed to delete user.');
    } finally {
      setEditMemberLoading(false);
    }
  };


  if (loading && allUsers.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <div className={styles.content}>
      <h1 className={tableStyles.pageTitle}>Team Member (Manager)</h1>

      {error && <p className={tableStyles.errorMessage}>{error}</p>}

      {/* All Users List */}
      <div className={tableStyles.reportSection}>
        <h2 className={tableStyles.sectionTitle}>All Employees (TLs & Execs)</h2>
        {allUsers.length === 0 && !loading ? (
          <p>No employees found.</p>
        ) : (
          <table className={tableStyles.reportTable}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Role</th>
                <th>Location</th>
                <th>Email ID</th>
                <th>Contact No.</th>
                <th>Joining Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {allUsers.map(user => (
                <tr key={user._id}>
                  <td>{user.name}</td>
                  <td>{user.role.replace('_', ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}</td>
                  <td>{user.location || 'N/A'}</td>
                  <td>{user.email}</td>
                  <td>{user.contactNo || 'N/A'}</td>
                  <td>{user.joiningDate ? new Date(user.joiningDate).toLocaleDateString() : 'N/A'}</td>
                  <td>
                    <span className={`${tableStyles.statusBadge} ${user.status === 'active' ? tableStyles.statusActive : (user.status === 'inactive' ? tableStyles.statusInactive : tableStyles.statusOn_leave)}`}>
                        {user.status}
                    </span>
                  </td>
                  <td>
                    <button onClick={() => openMemberModal(user, false)} className={tableStyles.actionButton}>View</button>
                    <button onClick={() => openMemberModal(user, true)} className={tableStyles.actionButton}>Edit</button>
                    <button onClick={() => handleDeleteMember(user._id)} className={`${tableStyles.actionButton} ${tableStyles.deleteButton}`}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add New Member Form (Manager's Comprehensive Form) */}
      <div className={tableStyles.reportSection}>
        <h2 className={tableStyles.sectionTitle}>Add New Employee</h2>
        {addMemberSuccess && <p className={formStyles.successMessage}>{addMemberSuccess}</p>}
        {addMemberError && <p className={formStyles.errorMessage}>{addMemberError}</p>}
        <form onSubmit={handleNewMemberSubmit} className={formStyles.prospectForm}>
          <div className={formStyles.formGroup}>
            <label htmlFor="newName">Name</label>
            <input type="text" id="newName" name="name" value={newMemberFormData.name} onChange={handleNewMemberChange} className={formStyles.formInput} required />
          </div>
          <div className={formStyles.formGroup}>
            <label htmlFor="newEmail">Email</label>
            <input type="email" id="newEmail" name="email" value={newMemberFormData.email} onChange={handleNewMemberChange} className={formStyles.formInput} required />
          </div>
          <div className={formStyles.formGroup}>
            <label htmlFor="newPassword">Password</label>
            <input type="password" id="newPassword" name="password" value={newMemberFormData.password} onChange={handleNewMemberChange} className={formStyles.formInput} required />
          </div>
          <div className={formStyles.formGroup}>
            <label htmlFor="newPasswordConfirm">Confirm Password</label>
            <input type="password" id="newPasswordConfirm" name="passwordConfirm" value={newMemberFormData.passwordConfirm} onChange={handleNewMemberChange} className={formStyles.formInput} required />
          </div>
          <div className={formStyles.formGroup}>
            <label htmlFor="newRefId">Reference ID</label>
            <input type="text" id="newRefId" name="refId" value={newMemberFormData.refId} onChange={handleNewMemberChange} className={formStyles.formInput} required />
          </div>
          <div className={formStyles.formGroup}>
            <label htmlFor="newRole">Position (Role)</label>
            <select id="newRole" name="role" value={newMemberFormData.role} onChange={handleNewMemberChange} className={formStyles.formInput} required>
              <option value="sales_executive">Sales Executive</option>
              <option value="team_lead">Team Lead</option>
            </select>
          </div>
          {/* Optional fields */}
          <div className={formStyles.formGroup}>
            <label htmlFor="newContactNo">Contact No.</label>
            <input type="text" id="newContactNo" name="contactNo" value={newMemberFormData.contactNo} onChange={handleNewMemberChange} className={formStyles.formInput} />
          </div>
          <div className={formStyles.formGroup}>
            <label htmlFor="newLocation">Location</label>
            <input type="text" id="newLocation" name="location" value={newMemberFormData.location} onChange={handleNewMemberChange} className={formStyles.formInput} />
          </div>
          <div className={formStyles.formGroup}>
            <label htmlFor="newJoiningDate">Joining Date</label>
            <input type="date" id="newJoiningDate" name="joiningDate" value={newMemberFormData.joiningDate} onChange={handleNewMemberChange} className={formStyles.formInput} />
          </div>
          {/* Bank Details */}
          <h3 className={formStyles.sectionTitle} style={{marginTop: '20px', marginBottom: '10px'}}>Bank Details (Optional)</h3>
          <div className={formStyles.formGroup}>
            <label htmlFor="bankName">Bank Name</label>
            <input type="text" id="bankName" name="bankDetails.bankName" value={newMemberFormData.bankDetails.bankName} onChange={handleNewMemberChange} className={formStyles.formInput} />
          </div>
          <div className={formStyles.formGroup}>
            <label htmlFor="accountNo">Account No.</label>
            <input type="text" id="accountNo" name="bankDetails.accountNo" value={newMemberFormData.bankDetails.accountNo} onChange={handleNewMemberChange} className={formStyles.formInput} />
          </div>
          <div className={formStyles.formGroup}>
            <label htmlFor="ifscCode">IFSC Code</label>
            <input type="text" id="ifscCode" name="bankDetails.ifscCode" value={newMemberFormData.bankDetails.ifscCode} onChange={handleNewMemberChange} className={formStyles.formInput} />
          </div>
          <div className={formStyles.formGroup}>
            <label htmlFor="upiId">UPI ID</label>
            <input type="text" id="upiId" name="bankDetails.upiId" value={newMemberFormData.bankDetails.upiId} onChange={handleNewMemberChange} className={formStyles.formInput} />
          </div>

          {/* Manager can assign specific TL to a new Exec */}
          {newMemberFormData.role === 'sales_executive' && (
              <div className={formStyles.formGroup}>
                  <label htmlFor="assignManager">Assign to Team Lead</label>
                  <select
                      id="assignManager"
                      name="managerId" // This field is for the 'manager' field in the User model
                      value={newMemberFormData.managerId}
                      onChange={handleNewMemberChange}
                      className={formStyles.formInput}
                  >
                      <option value="">Select Team Lead (Optional)</option>
                      {allUsers.filter(u => u.role === 'team_lead').map(tl => ( // Filter for only TLs
                          <option key={tl._id} value={tl._id}>{tl.name}</option>
                      ))}
                  </select>
              </div>
          )}
          {/* Manager creating TLs, can assign their manager. This field is for the Manager's Manager. */}
          {newMemberFormData.role === 'team_lead' && (
              <div className={formStyles.formGroup}>
                  <label htmlFor="assignManagerManager">Assign Manager (Optional)</label>
                  <select
                      id="assignManagerManager"
                      name="managerId" // This field is for the 'manager' field in the User model
                      value={newMemberFormData.managerId}
                      onChange={handleNewMemberChange}
                      className={formStyles.formInput}
                  >
                      <option value="">Select Manager (Optional)</option>
                      {allUsers.filter(u => u.role === 'manager').map(m => ( // Filter for only Managers
                          <option key={m._id} value={m._id}>{m.name}</option>
                      ))}
                  </select>
              </div>
          )}


          <button type="submit" className={formStyles.submitButton} disabled={addMemberLoading}>
            {addMemberLoading ? 'Adding...' : 'Add'}
          </button>
        </form>
      </div>

      {/* View/Edit/Delete Member Modal */}
      {showMemberModal && selectedMember && (
        <Modal onClose={closeMemberModal} title={isEditingMember ? "Edit User" : "User Details"}>
          {editMemberSuccess && <p className={formStyles.successMessage}>{editMemberSuccess}</p>}
          {editMemberError && <p className={formStyles.errorMessage}>{editMemberError}</p>}
          {editMemberLoading && <LoadingSpinner />}

          {!isEditingMember ? (
            <>
              <div className={userPageStyles.profileDetail}><strong>Name:</strong> {selectedMember.name}</div>
              <div className={userPageStyles.profileDetail}><strong>Email:</strong> {selectedMember.email}</div>
              <div className={userPageStyles.profileDetail}><strong>Role:</strong> {selectedMember.role.replace('_', ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}</div>
              <div className={userPageStyles.profileDetail}><strong>Ref ID:</strong> {selectedMember.refId || 'N/A'}</div>
              <div className={userPageStyles.profileDetail}><strong>Contact No:</strong> {selectedMember.contactNo || 'N/A'}</div>
              <div className={userPageStyles.profileDetail}><strong>Location:</strong> {selectedMember.location || 'N/A'}</div>
              <div className={userPageStyles.profileDetail}><strong>Joining Date:</strong> {selectedMember.joiningDate ? new Date(selectedMember.joiningDate).toLocaleDateString() : 'N/A'}</div>
              <div className={userPageStyles.profileDetail}><strong>Status:</strong> {selectedMember.status}</div>
              <div className={userPageStyles.profileDetail}><strong>Manager:</strong> {selectedMember.manager?.name || 'N/A'}</div>
              <div className={userPageStyles.profileDetail}><strong>Team:</strong> {selectedMember.team?.name || 'N/A'}</div>

              {/* Bank Details View */}
              {selectedMember.bankDetails && (selectedMember.bankDetails.bankName || selectedMember.bankDetails.accountNo || selectedMember.bankDetails.ifscCode || selectedMember.bankDetails.upiId) && (
                <>
                  <h3 className={formStyles.sectionTitle} style={{marginTop: '20px', marginBottom: '10px'}}>Bank Details</h3>
                  <div className={userPageStyles.profileDetail}><strong>Bank Name:</strong> {selectedMember.bankDetails.bankName || 'N/A'}</div>
                  <div className={userPageStyles.profileDetail}><strong>Account No:</strong> {selectedMember.bankDetails.accountNo || 'N/A'}</div>
                  <div className={userPageStyles.profileDetail}><strong>IFSC Code:</strong> {selectedMember.bankDetails.ifscCode || 'N/A'}</div>
                  <div className={userPageStyles.profileDetail}><strong>UPI ID:</strong> {selectedMember.bankDetails.upiId || 'N/A'}</div>
                </>
              )}
              <div className={tableStyles.formActions}>
                <button onClick={() => setIsEditingMember(true)} className={formStyles.submitButton}>Edit</button>
                <button onClick={() => handleDeleteMember(selectedMember._id)} className={`${tableStyles.actionButton} ${tableStyles.deleteButton}`}>Delete</button>
              </div>
            </>
          ) : (
            <form onSubmit={handleUpdateMemberSubmit} className={formStyles.prospectForm}>
              <div className={formStyles.formGroup}>
                <label htmlFor="editName">Name</label>
                <input type="text" id="editName" name="name" value={editMemberFormData.name} onChange={handleEditMemberChange} className={formStyles.formInput} required />
              </div>
              <div className={formStyles.formGroup}>
                <label htmlFor="editEmail">Email</label>
                <input type="email" id="editEmail" name="email" value={editMemberFormData.email} onChange={handleEditMemberChange} className={formStyles.formInput} required />
              </div>
              <div className={formStyles.formGroup}>
                <label htmlFor="editContactNo">Contact No.</label>
                <input type="text" id="editContactNo" name="contactNo" value={editMemberFormData.contactNo} onChange={handleEditMemberChange} className={formStyles.formInput} />
              </div>
              view
              <div className={formStyles.formGroup}>
                <label htmlFor="editLocation">Location</label>
                <input type="text" id="editLocation" name="location" value={editMemberFormData.location} onChange={handleEditMemberChange} className={formStyles.formInput} />
              </div>
              <div className={formStyles.formGroup}>
                <label htmlFor="editStatus">Status</label>
                <select id="editStatus" name="status" value={editMemberFormData.status} onChange={handleEditMemberChange} className={formStyles.formInput}>
                  <option value="active">active</option>
                  <option value="inactive">inactive</option>
                  <option value="on_leave">on_leave</option>
                </select>
              </div>
              <div className={formStyles.formGroup}>
                <label htmlFor="editRole">Role</label>
                <select id="editRole" name="role" value={editMemberFormData.role} onChange={handleEditMemberChange} className={formStyles.formInput} required>
                  <option value="sales_executive">Sales Executive</option>
                  <option value="team_lead">Team Lead</option>
                  <option value="manager">Manager</option>
                </select>
              </div>
              <div className={formStyles.formGroup}>
                <label htmlFor="editRefId">Reference ID</label>
                <input type="text" id="editRefId" name="refId" value={editMemberFormData.refId} onChange={handleEditMemberChange} className={formStyles.formInput} />
              </div>
              {/* Assign Manager/Team (TL/Exec assignment) */}
              <div className={formStyles.formGroup}>
                <label htmlFor="editManager">Assign Manager/Team Lead</label>
                <select id="editManager" name="managerId" value={editMemberFormData.managerId} onChange={handleEditMemberChange} className={formStyles.formInput}>
                  <option value="">None / Top Level</option>
                  {allUsers.filter(u => u.role === 'manager' || u.role === 'team_lead').map(m => (
                    <option key={m._id} value={m._id}>{m.name} ({m.role.replace('_', ' ')})</option>
                  ))}
                </select>
              </div>
              {editMemberFormData.role === 'sales_executive' && (
                <div className={formStyles.formGroup}>
                  <label htmlFor="editTeam">Assign Team</label>
                  <select id="editTeam" name="teamId" value={editMemberFormData.teamId} onChange={handleEditMemberChange} className={formStyles.formInput}>
                    <option value="">None</option>
                    {allTeams.map(t => (
                      <option key={t._id} value={t._id}>{t.name}</option>
                    ))}
                  </select>
                </div>
              )}
              {/* Bank Details Edit */}
              <h3 className={formStyles.sectionTitle} style={{marginTop: '20px', marginBottom: '10px'}}>Bank Details</h3>
              <div className={formStyles.formGroup}>
                <label htmlFor="editBankName">Bank Name</label>
                <input type="text" id="editBankName" name="bankDetails.bankName" value={editMemberFormData.bankDetails.bankName} onChange={handleEditMemberChange} className={formStyles.formInput} />
              </div>
              <div className={formStyles.formGroup}>
                <label htmlFor="editAccountNo">Account No.</label>
                <input type="text" id="editAccountNo" name="bankDetails.accountNo" value={editMemberFormData.bankDetails.accountNo} onChange={handleEditMemberChange} className={formStyles.formInput} />
              </div>
              <div className={formStyles.formGroup}>
                <label htmlFor="editIfscCode">IFSC Code</label>
                <input type="text" id="editIfscCode" name="bankDetails.ifscCode" value={editMemberFormData.bankDetails.ifscCode} onChange={handleEditMemberChange} className={formStyles.formInput} />
              </div>
              <div className={formStyles.formGroup}>
                <label htmlFor="editUpiId">UPI ID</label>
                <input type="text" id="editUpiId" name="bankDetails.upiId" value={editMemberFormData.bankDetails.upiId} onChange={handleEditMemberChange} className={formStyles.formInput} />
              </div>

              <div className={tableStyles.formActions}>
                <button type="submit" className={formStyles.submitButton} disabled={editMemberLoading}>
                  {editMemberLoading ? 'Saving...' : 'Save Changes'}
                </button>
                <button type="button" onClick={() => setIsEditingMember(false)} className={formStyles.toggleButton}>Cancel</button>
              </div>
            </form>
          )}
        </Modal>
      )}
    </div>
  );
};

export default TeamMemberPage;