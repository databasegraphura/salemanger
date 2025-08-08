// src/components/Layout/Sidebar.js - MODIFIED FOR MANAGER
import React from 'react';
import { NavLink } from 'react-router-dom';
import styles from './Layout.module.css';
import useAuth from '../../hooks/useAuth';

const Sidebar = () => {
  const { user } = useAuth();

  // Manager specific navigation items based on screenshots (all modules)
  const navItems = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Total Sales', path: '/total-sales' },
    { name: 'Total Prospect', path: '/total-prospect' },
    { name: 'Report', path: '/report' }, // Overall Performance Report
    { name: 'Manager Report', path: '/manager-report' }, // Specific Manager reports (call logs, last update)
    { name: 'Team Member', path: '/team-member' }, // All users management
    { name: 'Transfer Data', path: '/transfer-data' }, // Internal and Finance transfer
    { name: 'Untouched Data', path: '/untouched-data' },
    { name: 'Prospect Form', path: '/prospect-form' },
    { name: 'Salary', path: '/salary' }, // Salary management
    { name: 'Team Management', path: '/team-management' }, // Specific team management (CRUD teams)
  ];

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logoSection}>
        <img src="/logo.png" alt="Graphura Logo" className={styles.logo} /> {/* Place your logo in public/logo.png */}
        <div className={styles.userInfo}>
          <div className={styles.userIcon}>👤</div>
          <span className={styles.userNameSidebar}>{user ? user.name : 'Name'}</span>
          <span className={styles.userRole}>{user ? user.role.replace('_', ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') : 'Role'}</span>
        </div>
      </div>
      <nav className={styles.navbarNav}>
        {navItems.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              isActive ? `${styles.navItem} ${styles.activeNavItem}` : styles.navItem
            }
          >
            {item.name}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;