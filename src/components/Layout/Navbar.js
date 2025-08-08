// src/components/Layout/Navbar.js
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import styles from './Layout.module.css';
import useAuth from '../../hooks/useAuth';

const Navbar = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.navbarLeft}>
        <span className={styles.appName}>GRAPHURA CRM</span>
        {user && <span className={styles.userName}>Hello, {user.name}!</span>}
      </div>
      <div className={styles.navbarRight}>
        <button className={styles.navButton}>Proposals</button>
        <button className={styles.navButton}>Custom Plan</button>
        <button className={styles.navButton}>Work Order</button>
        <div className={styles.profileDropdown}>
          <button className={styles.profileButton}>My Profile ▼</button>
          <div className={styles.dropdownContent}>
            <NavLink to="/my-profile" className={styles.dropdownLink}>Profile</NavLink>
            <button onClick={handleLogout} className={styles.dropdownButton}>Logout</button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;