import React from 'react';
import { useToast } from '../hooks/useToast';

const ToastAlert = () => {
  const { toasts, removeToast } = useToast();

  if (!toasts || toasts.length === 0) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        maxWidth: '380px',
        width: '100%'
      }}
    >
      {toasts.map((toast) => {
        let bg = 'bg-success text-white';
        let icon = 'bi-check-circle-fill';

        if (toast.type === 'error') {
          bg = 'bg-danger text-white';
          icon = 'bi-exclamation-triangle-fill';
        } else if (toast.type === 'warning') {
          bg = 'bg-warning text-dark';
          icon = 'bi-exclamation-circle-fill';
        } else if (toast.type === 'info') {
          bg = 'bg-info text-dark';
          icon = 'bi-info-circle-fill';
        }

        return (
          <div
            key={toast.id}
            className={`toast show shadow-lg border-0 ${bg}`}
            role="alert"
            style={{ borderRadius: '12px' }}
          >
            <div className="d-flex align-items-center p-3">
              <i className={`bi ${icon} fs-5 me-2`}></i>
              <div className="flex-grow-1 fw-medium">{toast.message}</div>
              <button
                type="button"
                className="btn-close btn-close-white ms-2"
                onClick={() => removeToast(toast.id)}
                aria-label="Close"
              ></button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ToastAlert;
