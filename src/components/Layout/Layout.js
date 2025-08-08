// src/components/Layout/Layout.js
import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import styles from './Layout.module.css';

const Layout = () => {
  return (
    <div className={styles.layoutContainer}>
      <Sidebar />
      <div className={styles.mainContentArea}>
        <Navbar />
        <main className={styles.pageContent}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;