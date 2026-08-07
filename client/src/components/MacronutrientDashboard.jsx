import React from 'react';

export default function MacronutrientDashboard({ summary }) {
  if (!summary) return null;

  const { totals, targets, percentages } = summary;

  const macros = [
    {
      key: 'protein',
      label: 'Protein',
      current: totals.protein,
      target: targets.protein,
      percent: percentages.protein,
      unit: 'g'
    },
    {
      key: 'carbs',
      label: 'Carbs',
      current: totals.carbs,
      target: targets.carbs,
      percent: percentages.carbs,
      unit: 'g'
    },
    {
      key: 'fats',
      label: 'Fats',
      current: totals.fats,
      target: targets.fats,
      percent: percentages.fats,
      unit: 'g'
    }
  ];

  return (
    <div className="glass-card">
      <h3 style={{ fontSize: '1rem', color: 'var(--text-muted)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        Macronutrient Breakdown
      </h3>
      <div className="macro-grid">
        {macros.map((m) => (
          <div key={m.key} className="macro-card">
            <div className="macro-label">
              <span>{m.label}</span>
              <span style={{ color: 'var(--text-muted)' }}>
                {m.current}{m.unit} / {m.target}{m.unit}
              </span>
            </div>
            <div className="macro-track">
              <div 
                className={`macro-fill ${m.key}`} 
                style={{ width: `${m.percent}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
