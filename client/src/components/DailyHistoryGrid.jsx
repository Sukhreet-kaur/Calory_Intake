import React from 'react';

export default function DailyHistoryGrid({ meals, onDeleteMeal, onClearAll, loading }) {
  return (
    <div className="glass-card history-card">
      <div className="history-header">
        <h3 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span>📋</span> Daily Meal History ({meals.length})
        </h3>
        {meals.length > 0 && (
          <button
            type="button"
            className="btn-clear-all"
            onClick={onClearAll}
            disabled={loading}
          >
            Clear All
          </button>
        )}
      </div>

      {meals.length === 0 ? (
        <div className="empty-history">
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🍽️</div>
          <div>No meals logged yet for today.</div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Type a food name or upload a photo using the AI scanner above!
          </div>
        </div>
      ) : (
        <div className="meals-list">
          {meals.map((meal) => (
            <div key={meal.id} className="meal-item-row">
              <div className="meal-info">
                <div className="meal-name">{meal.foodName}</div>
                <div className="meal-weight">{meal.weightGrams}g portion</div>
              </div>

              <div className="meal-macros">
                <span className="macro-badge kcal">{meal.calories} kcal</span>
                <span className="macro-badge p">P: {meal.protein}g</span>
                <span className="macro-badge c">C: {meal.carbs}g</span>
                <span className="macro-badge f">F: {meal.fats}g</span>
              </div>

              <button
                type="button"
                className="btn-delete"
                onClick={() => onDeleteMeal(meal.id)}
                disabled={loading}
                title="Delete meal item"
              >
                🗑️
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
