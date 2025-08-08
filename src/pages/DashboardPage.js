// src/pages/DashboardPage.js - Manager Version
import React, { useEffect, useState } from 'react';
import useAuth from '../hooks/useAuth';
import reportService from '../services/reportService';
import LoadingSpinner from '../components/LoadingSpinner/LoadingSpinner';
import styles from '../components/Layout/Layout.module.css';
import dashboardStyles from './DashboardPage.module.css'; // This CSS needs to be copied

const DashboardPage = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        const summary = await reportService.getDashboardSummary();
        setDashboardData(summary);
      } catch (err) {
        console.error('Failed to fetch Manager dashboard data:', err);
        setError(err.response?.data?.message || err.message || 'An unexpected error occurred while loading dashboard.');
      } finally {
        setLoading(false);
      }
    };
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  if (loading) { return <LoadingSpinner />; }
  if (error) { return <div className={`${styles.content} ${dashboardStyles.errorContainer}`}><h2>Error Loading Dashboard</h2><p>{error}</p></div>; }
  if (!dashboardData) { return (<div className={styles.content}><h2>Manager Dashboard</h2><p>No dashboard data available.</p></div>); }

  return (
    <div className={styles.content}>
      <h1 className={dashboardStyles.pageTitle}>Dashboard</h1>
      <div className={dashboardStyles.kpiCards}>
        {/* Manager-specific KPIs */}
        <div className={dashboardStyles.kpiCard}><h3>TOTAL SALES</h3><p>Rs. {dashboardData.totalSales ? dashboardData.totalSales.toFixed(2) : '0.00'}</p></div>
        <div className={dashboardStyles.kpiCard}><h3>LAST MONTH SALES</h3><p>Rs. {dashboardData.lastMonthSales ? dashboardData.lastMonthSales.toFixed(2) : '0.00'}</p></div>
        <div className={dashboardStyles.kpiCard}><h3>THIS MONTH SALES</h3><p>Rs. {dashboardData.thisMonthSales ? dashboardData.thisMonthSales.toFixed(2) : '0.00'}</p></div>
        <div className={dashboardStyles.kpiCard}><h3>TODAY'S SALES</h3><p>Rs. {dashboardData.todaySales ? dashboardData.todaySales.toFixed(2) : '0.00'}</p></div>
        <div className={dashboardStyles.kpiCard}><h3>TOTAL TRANSFER DATA</h3><p>{dashboardData.totalTransferData || 0}</p></div>
        <div className={dashboardStyles.kpiCard}><h3>TOTAL EMPLOYEE</h3><p>{dashboardData.totalEmployees || 0}</p></div>
        <div className={dashboardStyles.kpiCard}><h3>TOTAL TLs</h3><p>{dashboardData.totalTLs || 0}</p></div>
        <div className={dashboardStyles.kpiCard}><h3>TOTAL PROSPECT</h3><p>{dashboardData.totalProspectOverall || 0}</p></div>
        <div className={dashboardStyles.kpiCard}><h3>TODAY'S PROSPECT</h3><p>{dashboardData.todayProspect || 0}</p></div>
        <div className={dashboardStyles.kpiCard}><h3>MONTHLY INCOME</h3><p>Rs. {dashboardData.monthlyIncome ? dashboardData.monthlyIncome.toFixed(2) : '0.00'}</p></div>
        <div className={dashboardStyles.kpiCard}><h3>LAST MONTH INCOME</h3><p>Rs. {dashboardData.lastMonthIncome ? dashboardData.lastMonthIncome.toFixed(2) : '0.00'}</p></div>
        <div className={dashboardStyles.kpiCard}><h3>TOTAL INCOME</h3><p>Rs. {dashboardData.totalIncome ? dashboardData.totalIncome.toFixed(2) : '0.00'}</p></div>
        <div className={dashboardStyles.kpiCard}><h3>TOTAL IMPORT DATA</h3><p>{dashboardData.totalImportData || 0}</p></div>
      </div>
      <h2 className={dashboardStyles.sectionTitle}>FINANCE DEPT.</h2>
      <div className={dashboardStyles.kpiCards}>
        <div className={dashboardStyles.kpiCard}><h3>TOTAL DATA</h3><p>{dashboardData.totalDataFinance || 0}</p></div>
        <div className={dashboardStyles.kpiCard}><h3>LAST MONTH INCOME</h3><p>Rs. {dashboardData.lastMonthIncomeFinance ? dashboardData.lastMonthIncomeFinance.toFixed(2) : '0.00'}</p></div>
        <div className={dashboardStyles.kpiCard}><h3>TOTAL INCOME</h3><p>Rs. {dashboardData.totalIncomeFinance ? dashboardData.totalIncomeFinance.toFixed(2) : '0.00'}</p></div>
        <div className={dashboardStyles.kpiCard}><h3>TOTAL IMPORT DATA</h3><p>{dashboardData.totalImportDataFinance || 0}</p></div>
      </div>
    </div>
  );
};
export default DashboardPage;