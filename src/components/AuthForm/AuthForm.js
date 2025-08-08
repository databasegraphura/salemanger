// src/components/AuthForm/AuthForm.js
import React, { useState } from 'react';
import styles from './AuthForm.module.css';

const AuthForm = ({ isLogin, onSubmit, onToggleMode, isLoading, error }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    passwordConfirm: '',
    refId: '',
    role: 'manager', // default for signup
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className={styles.authCard}>
      <h2 className={styles.authTitle}>{isLogin ? 'Login' : 'Sign Up'}</h2>
      <form onSubmit={handleSubmit} className={styles.authForm} noValidate>
        {!isLogin && (
          <>
            <div className={styles.formGroup}>
              <label htmlFor="name">Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={styles.formInput}
                required
                disabled={isLoading}
              />
            </div>
          </>
        )}

        <div className={styles.formGroup}>
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={styles.formInput}
            required
            disabled={isLoading}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className={styles.formInput}
            required
            disabled={isLoading}
          />
        </div>

        {!isLogin && (
          <>
            <div className={styles.formGroup}>
              <label htmlFor="passwordConfirm">Confirm Password</label>
              <input
                type="password"
                id="passwordConfirm"
                name="passwordConfirm"
                value={formData.passwordConfirm}
                onChange={handleChange}
                className={styles.formInput}
                required
                disabled={isLoading}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="role">Role</label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className={styles.formInput}
                required
                disabled={isLoading}
              >
                <option value="sales_executive">Sales Executive</option>
                <option value="team_lead">Team Lead</option>
                <option value="manager">Manager</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="refId">Reference ID</label>
              <input
                type="text"
                id="refId"
                name="refId"
                value={formData.refId}
                onChange={handleChange}
                className={styles.formInput}
                required
                disabled={isLoading}
              />
            </div>
          </>
        )}

        {error && (
          <p className={styles.errorMessage}>
            {error.message || 'An error occurred.'}
          </p>
        )}

        <button
          type="submit"
          className={styles.submitButton}
          disabled={isLoading}
        >
          {isLoading
            ? isLogin
              ? 'Logging In...'
              : 'Signing Up...'
            : isLogin
            ? 'Login'
            : 'Sign Up'}
        </button>
      </form>

      <button
        type="button"
        onClick={onToggleMode}
        className={styles.toggleButton}
        disabled={isLoading}
      >
        {isLogin ? 'Create new account' : 'Login with existing account'}
      </button>
    </div>
  );
};

export default AuthForm;
