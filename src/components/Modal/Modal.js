// src/components/Modal/Modal.js
import React from 'react';
import ReactDOM from 'react-dom';
import styles from './Modal.module.css';

const Backdrop = ({ onClose }) => {
  return <div className={styles.backdrop} onClick={onClose} />;
};

const ModalOverlay = ({ children, title, onClose }) => {
  return (
    <div className={styles.modal}>
      <header className={styles.modalHeader}>
        <h2>{title}</h2>
        <button onClick={onClose} className={styles.closeButton}>&times;</button>
      </header>
      <div className={styles.modalContent}>{children}</div>
    </div>
  );
};

const Modal = ({ children, title, onClose }) => {
  return (
    <>
      {ReactDOM.createPortal(<Backdrop onClose={onClose} />, document.getElementById('backdrop-root'))}
      {ReactDOM.createPortal(
        <ModalOverlay title={title} onClose={onClose}>{children}</ModalOverlay>,
        document.getElementById('overlay-root')
      )}
    </>
  );
};

export default Modal;