import React from 'react';

const LoadingSpinner = ({ message = 'Freshly preparing your request...' }) => {
  return (
    <div className="d-flex flex-column align-items-center justify-content-center py-5 my-4">
      <div
        className="spinner-border text-bakery-accent"
        style={{ width: '3rem', height: '3rem', color: '#8B4513' }}
        role="status"
      >
        <span className="visually-hidden">Loading...</span>
      </div>
      <p className="mt-3 text-muted fw-semibold">{message}</p>
    </div>
  );
};

export default LoadingSpinner;
