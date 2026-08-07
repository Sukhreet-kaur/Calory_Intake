import React from 'react';

export default function CalorieProgressBar({ summary }) {
  if (!summary) return null;

  const { totals, targets, caloriesRemaining, budgetExceeded, percentages } = summary;
  const isCrimson = budgetExceeded;

  return (
    <div className={`glass-card budget-card ${isCrimson ? 'exceeded' : ''}`}>
      <div className="budget-header">
        <div>
          <div className="budget-title">Daily Calorie Budget</div>
          <div className="budget-numbers">
            <span style={{ color: isCrimson ? '#ef4444' : '#38bdf8' }}>
              {totals.calories.toLocaleString()}
            </span>
            <span className="budget-target"> / {targets.calories.toLocaleString()} kcal</span>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div className="budget-title">{isCrimson ? 'OVER BUDGET BY' : 'REMAINING'}</div>
          <div style={{ 
            fontSize: '1.25rem', 
            fontWeight: '700', 
            color: isCrimson ? '#ef4444' : '#10b981' 
          }}>
            {isCrimson 
              ? `${(totals.calories - targets.calories).toLocaleString()} kcal` 
              : `${caloriesRemaining.toLocaleString()} kcal`}
          </div>
        </div>
      </div>

      <div className="progress-track">
        <div 
          className={`progress-fill ${isCrimson ? 'crimson' : ''}`}
          style={{ width: `${percentages.calories}%` }}
        />
      </div>
    </div>
  );
}
