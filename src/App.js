// src/App.js - CORRECTED FOR MANAGER FRONTEND (useLocation removed from App.js)
import React from 'react';
// REMOVED useLocation import from here:
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Import all page components for Manager
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import TotalSalesPage from './pages/TotalSalesPage';
import TotalProspectPage from './pages/TotalProspectPage'; // Manager's full prospect list
import ReportPage from './pages/ReportPage';
import ManagerReportPage from './pages/ManagerReportPage';
import TeamMemberPage from './pages/TeamMemberPage';
import TransferDataPage from './pages/TransferDataPage';
import UntouchedDataPage from './pages/UntouchedDataPage';
import ProspectFormPage from './pages/ProspectFormPage';
import SalaryPage from './pages/SalaryPage';
import TeamManagementPage from './pages/TeamManagementPage';
import UserDataPage from './pages/UserDataPage'; // For My Profile
import NotFoundPage from './pages/NotFoundPage';
import ProtectedRoute from './pages/ProtectedRoute';
import Layout from './components/Layout/Layout';

function App() {
  // REMOVED: const location = useLocation(); // This line caused the error!

  return (
    <Router>
      <Routes>
        {/* Public route for Authentication */}
        <Route path="/login" element={<AuthPage />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            {/* Manager Specific Pages */}
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/total-sales" element={<TotalSalesPage />} />
            {/* REMOVED: key={location.key} from TotalProspectPage */}
            <Route path="/total-prospect" element={<TotalProspectPage />} />
            <Route path="/report" element={<ReportPage />} />
            <Route path="/manager-report" element={<ManagerReportPage />} />
            <Route path="/team-member" element={<TeamMemberPage />} />
            <Route path="/transfer-data" element={<TransferDataPage />} />
            <Route path="/untouched-data" element={<UntouchedDataPage />} />
            <Route path="/prospect-form" element={<ProspectFormPage />} />
            <Route path="/salary" element={<SalaryPage />} />
            <Route path="/team-management" element={<TeamManagementPage />} />
            <Route path="/my-profile" element={<UserDataPage />} />
          </Route>
        </Route>

        {/* Catch-all route */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
}

export default App;