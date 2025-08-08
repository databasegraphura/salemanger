// src/pages/TeamManagementPage.js - Manager Version (Team Management)
import React, { useEffect, useState } from 'react';
import teamService from '../services/teamService'; // For fetching/creating/updating/deleting teams
import userService from '../services/userService';   // For fetching users (Team Leads, Sales Executives)
import LoadingSpinner from '../components/LoadingSpinner/LoadingSpinner';
import Modal from '../components/Modal/Modal';
import styles from '../components/Layout/Layout.module.css'; // General layout styles
import tableStyles from './ReportPage.module.css';        // Reusing table styles
import formStyles from './ProspectFormPage.module.css';   // Reusing form element styles

const TeamManagementPage = () => {
  const [teams, setTeams] = useState([]);
  const [allUsers, setAllUsers] = useState([]); // All users (TLs, Execs) for dropdowns
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State for Add/Edit Team Modal
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [isEditingTeam, setIsEditingTeam] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null); // Team record being edited
  const [teamFormData, setTeamFormData] = useState({
    name: '',
    teamLeadId: '', // ID of the user who will be the Team Lead
    addMembers: [],    // IDs of new members to add
    removeMembers: [], // IDs of members to remove
  });
  const [teamFormLoading, setTeamFormLoading] = useState(false);
  const [teamFormError, setTeamFormError] = useState(null);
  const [teamFormSuccess, setTeamFormSuccess] = useState('');


  // Fetch All Teams and All Users (for dropdowns)
  const fetchAllTeamsAndUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const fetchedTeams = await teamService.getAllTeams();
      setTeams(fetchedTeams);

      // Get all users for assigning Team Leads and members
      const users = await userService.getAllUsers(); // Manager can see all relevant users
      setAllUsers(users);

    } catch (err) {
      console.error('Failed to fetch teams/users:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load team data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllTeamsAndUsers();
  }, []);


  // --- Add/Edit Team Form Handlers ---
  const openTeamModal = (team = null) => {
    if (team) {
      setIsEditingTeam(true);
      setSelectedTeam(team);
      setTeamFormData({
        name: team.name,
        teamLeadId: team.teamLead ? team.teamLead._id : '',
        addMembers: [], // Reset for edit mode, will be selected via multi-select in form
        removeMembers: [], // Reset for edit mode
      });
    } else {
      setIsEditingTeam(false);
      setSelectedTeam(null);
      setTeamFormData({ // Reset for new team
        name: '',
        teamLeadId: '',
        addMembers: [],
        removeMembers: [],
      });
    }
    setTeamFormError(null);
    setTeamFormSuccess('');
    setShowTeamModal(true);
  };

  const closeTeamModal = () => {
    setShowTeamModal(false);
    setSelectedTeam(null);
    setIsEditingTeam(false);
    setTeamFormError(null);
    setTeamFormSuccess('');
  };

  const handleTeamFormChange = (e) => {
    const { name, value, options } = e.target;
    if (name === 'addMembers' || name === 'removeMembers') {
      // Handle multi-select dropdown
      const selectedValues = Array.from(options)
        .filter(option => option.selected)
        .map(option => option.value);
      setTeamFormData(prev => ({ ...prev, [name]: selectedValues }));
    } else {
      setTeamFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleTeamSubmit = async (e) => {
    e.preventDefault();
    setTeamFormLoading(true);
    setTeamFormError(null);
    setTeamFormSuccess('');

    try {
      if (isEditingTeam) {
        // For updating, send only fields that are provided
        const updatePayload = {
          name: teamFormData.name,
          teamLeadId: teamFormData.teamLeadId,
          addMembers: teamFormData.addMembers,
          removeMembers: teamFormData.removeMembers,
        };
        await teamService.updateTeam(selectedTeam._id, updatePayload);
        setTeamFormSuccess('Team updated successfully!');
      } else {
        await teamService.createTeam(teamFormData);
        setTeamFormSuccess('Team added successfully!');
        setTeamFormData({ // Clear form
          name: '', teamLeadId: '', addMembers: [], removeMembers: [],
        });
      }
      fetchAllTeamsAndUsers(); // Re-fetch all teams to update list
      // setTimeout(closeTeamModal, 1500); // Close after success message
    } catch (err) {
      console.error('Failed to save team:', err.response ? err.response.data : err.message);
      setTeamFormError(err.response?.data?.message || err.message || 'Failed to save team.');
    } finally {
      setTeamFormLoading(false);
    }
  };

  const handleDeleteTeam = async (teamId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this team? This will also unassign its Team Lead and Sales Executives.");
    if (!confirmDelete) return;

    setLoading(true); // Reusing main page loading for delete action
    setError(null);
    try {
      await teamService.deleteTeam(teamId);
      fetchAllTeamsAndUsers(); // Re-fetch list
    } catch (err) {
      console.error('Failed to delete team:', err.response ? err.response.data : err.message);
      setError(err.response?.data?.message || err.message || 'Failed to delete team.');
    } finally {
      setLoading(false);
    }
  };


  if (loading && teams.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <div className={styles.content}>
      <h1 className={tableStyles.pageTitle}>Team Management</h1>

      {error && <p className={tableStyles.errorMessage}>{error}</p>}

      {/* Teams List */}
      <div className={tableStyles.reportSection}>
        <div className={tableStyles.sectionHeader}>
          <h2 className={tableStyles.sectionTitle}>Sales Teams Overview</h2>
          <button onClick={() => openTeamModal()} className={tableStyles.searchButton}>Add New Team</button>
        </div>
        
        {teams.length === 0 && !loading ? (
          <p>No sales teams found.</p>
        ) : (
          <table className={tableStyles.reportTable}>
            <thead>
              <tr>
                <th>Team Name</th>
                <th>Team Lead</th>
                <th>Members Count</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {teams.map(team => (
                <tr key={team._id}>
                  <td>{team.name}</td>
                  <td>{team.teamLead ? team.teamLead.name : 'N/A (Unassigned)'}</td>
                  <td>{team.members ? team.members.length : 0}</td> {/* Virtual populate 'members' */}
                  <td>
                    <button onClick={() => openTeamModal(team)} className={tableStyles.actionButton}>Edit</button>
                    <button onClick={() => handleDeleteTeam(team._id)} className={`${tableStyles.actionButton} ${tableStyles.deleteButton}`}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add/Edit Team Modal */}
      {showTeamModal && (
        <Modal onClose={closeTeamModal} title={isEditingTeam ? "Edit Team" : "Add New Team"}>
          {teamFormSuccess && <p className={formStyles.successMessage}>{teamFormSuccess}</p>}
          {teamFormError && <p className={formStyles.errorMessage}>{teamFormError}</p>}
          <form onSubmit={handleTeamSubmit} className={formStyles.prospectForm}>
            <div className={formStyles.formGroup}>
              <label htmlFor="teamName">Team Name</label>
              <input
                type="text"
                id="teamName"
                name="name"
                value={teamFormData.name}
                onChange={handleTeamFormChange}
                className={formStyles.formInput}
                required
              />
            </div>
            <div className={formStyles.formGroup}>
              <label htmlFor="teamLeadId">Team Lead</label>
              <select
                id="teamLeadId"
                name="teamLeadId"
                value={teamFormData.teamLeadId}
                onChange={handleTeamFormChange}
                className={formStyles.formInput}
                required
                disabled={isEditingTeam && selectedTeam?.teamLead?._id === teamFormData.teamLeadId} // Disable if editing and TL is already set
              >
                <option value="">Select a Team Lead</option>
                {allUsers.filter(user => user.role === 'team_lead' && !user.team).map(tl => ( // Show only unassigned TLs or the current TL
                  <option key={tl._id} value={tl._id}>{tl.name}</option>
                ))}
                {isEditingTeam && selectedTeam?.teamLead && ( // Also show current TL if editing
                    <option key={selectedTeam.teamLead._id} value={selectedTeam.teamLead._id}>
                        {selectedTeam.teamLead.name} (Current)
                    </option>
                )}
              </select>
              {isEditingTeam && selectedTeam?.teamLead && teamFormData.teamLeadId !== selectedTeam.teamLead._id && (
                  <p style={{fontSize: '12px', color: 'orange'}}>Changing TL will unassign previous TL from this team.</p>
              )}
            </div>

            {isEditingTeam && (
              <>
                {/* Add Members Multi-select */}
                <div className={formStyles.formGroup}>
                  <label htmlFor="addMembers">Add Members (Sales Executives)</label>
                  <select
                    id="addMembers"
                    name="addMembers"
                    multiple // Allow multiple selections
                    value={teamFormData.addMembers}
                    onChange={handleTeamFormChange}
                    className={formStyles.formInput}
                    size="5" // Show multiple options at once
                  >
                    {allUsers.filter(user => user.role === 'sales_executive' && user.team !== selectedTeam._id).map(exec => ( // Show only unassigned or not in this team
                      <option key={exec._id} value={exec._id}>{exec.name}</option>
                    ))}
                  </select>
                  <p style={{fontSize: '12px', color: '#666', marginTop: '5px'}}>Hold Ctrl/Cmd to select multiple.</p>
                </div>

                {/* Remove Members Multi-select */}
                <div className={formStyles.formGroup}>
                  <label htmlFor="removeMembers">Remove Members (Sales Executives)</label>
                  <select
                    id="removeMembers"
                    name="removeMembers"
                    multiple // Allow multiple selections
                    value={teamFormData.removeMembers}
                    onChange={handleTeamFormChange}
                    className={formStyles.formInput}
                    size="5"
                  >
                    {allUsers.filter(user => user.team === selectedTeam._id).map(exec => ( // Show only members currently in this team
                      <option key={exec._id} value={exec._id}>{exec.name}</option>
                    ))}
                  </select>
                  <p style={{fontSize: '12px', color: '#666', marginTop: '5px'}}>Hold Ctrl/Cmd to select multiple.</p>
                </div>
              </>
            )}

            <button type="submit" className={formStyles.submitButton} disabled={teamFormLoading}>
              {teamFormLoading ? 'Saving...' : (isEditingTeam ? 'Save Changes' : 'Add Team')}
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default TeamManagementPage;