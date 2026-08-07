import React from 'react';

export default function FitnessGoalToggle({ currentGoal, onSelectGoal, loading }) {
  const goals = [
    { key: 'weight_loss', label: 'Weight Loss' },
    { key: 'maintenance', label: 'Maintenance' },
    { key: 'muscle_gain', label: 'Muscle Gain' }
  ];

  return (
    <div className="goal-toggle-container">
      {goals.map((goal) => (
        <button
          key={goal.key}
          className={`goal-btn ${currentGoal === goal.key ? 'active' : ''}`}
          onClick={() => onSelectGoal(goal.key)}
          disabled={loading}
          type="button"
        >
          {goal.label}
        </button>
      ))}
    </div>
  );
}
