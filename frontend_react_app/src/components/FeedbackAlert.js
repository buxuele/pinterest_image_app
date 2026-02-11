import React from 'react';

const FeedbackAlert = ({ message, variant = 'danger', onClose, className = '' }) => {
  if (!message) return null;

  return (
    <div className={`alert alert-${variant} ${className}`} role="alert">
      <div className="d-flex justify-content-between align-items-start gap-2">
        <div>{message}</div>
        {onClose && (
          <button
            type="button"
            className="btn-close"
            aria-label="Close"
            onClick={onClose}
          ></button>
        )}
      </div>
    </div>
  );
};

export default FeedbackAlert;
