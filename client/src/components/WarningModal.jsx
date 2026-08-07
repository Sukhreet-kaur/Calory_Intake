import React from 'react';

export default function WarningModal({ isOpen, onClose, overByCalories, totalCalories, targetCalories }) {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop">
      <div className="glass-card modal-content">
        <div className="modal-icon">⚠️</div>
        <h2 className="modal-title">Daily Budget Exceeded!</h2>
        <p className="modal-description">
          You have consumed <strong>{totalCalories.toLocaleString()} kcal</strong>, exceeding your daily limit of <strong>{targetCalories.toLocaleString()} kcal</strong> by <span style={{ color: '#ef4444', fontWeight: 700 }}>{overByCalories.toLocaleString()} kcal</span>.
        </p>
        <button type="button" className="btn btn-danger-modal" onClick={onClose}>
          Got it, I'll watch my intake
        </button>
      </div>
    </div>
  );
}
