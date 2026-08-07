import React, { useState, useEffect } from 'react';
import FitnessGoalToggle from './components/FitnessGoalToggle';
import CalorieProgressBar from './components/CalorieProgressBar';
import MacronutrientDashboard from './components/MacronutrientDashboard';
import FoodLoggingPanel from './components/FoodLoggingPanel';

export default function App() {
  const [summary, setSummary] = useState(null);
  const [meals, setMeals] = useState([]);
  const [currentGoal, setCurrentGoal] = useState('maintenance');
  const [hasGeminiKey, setHasGeminiKey] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch initial daily summary and meals state from server
  const fetchSummary = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/summary');
      const data = await res.json();
      if (data.success) {
        setSummary(data.data.summary);
        setMeals(data.data.meals);
        setCurrentGoal(data.data.summary.goalKey);
        setHasGeminiKey(Boolean(data.data.hasGeminiKey));
        setError(null);
      } else {
        setError('Failed to fetch daily summary.');
      }
    } catch (err) {
      console.error(err);
      setError('Cannot connect to backend server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  // Change Fitness Goal Mode
  const handleGoalChange = async (newGoalKey) => {
    if (newGoalKey === currentGoal) return;
    try {
      setLoading(true);
      const res = await fetch('/api/goal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goalKey: newGoalKey })
      });
      const data = await res.json();
      if (data.success) {
        setSummary(data.data.summary);
        setMeals(data.data.meals);
        setCurrentGoal(newGoalKey);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to update fitness goal.');
    } finally {
      setLoading(false);
    }
  };

  // Add a new Meal Item (Triggers AI / Baseline Nutrient Scaling Algorithm)
  const handleAddMeal = async (foodName, weightGrams, customBase = null) => {
    try {
      setLoading(true);
      const res = await fetch('/api/meals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ foodName, weightGrams, customBase })
      });
      const data = await res.json();
      if (data.success) {
        setSummary(data.data.summary);
        setMeals(data.data.meals);
      } else {
        alert(data.message || 'Failed to log meal.');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to connect to server to log meal.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      {/* Header & Goal Toggle */}
      <header className="app-header">
        <h1 className="app-title">
          <span>⚡</span> NutriPulse Dashboard
        </h1>

        <FitnessGoalToggle 
          currentGoal={currentGoal} 
          onSelectGoal={handleGoalChange} 
          loading={loading}
        />
      </header>

      {/* Main Progress Bar & Macro Breakdown */}
      {error && (
        <div style={{ color: '#ef4444', textAlign: 'center', marginBottom: '1rem' }}>
          {error}
        </div>
      )}

      {summary && (
        <>
          <CalorieProgressBar summary={summary} />
          <MacronutrientDashboard summary={summary} />
          <FoodLoggingPanel onAddMeal={handleAddMeal} loading={loading} hasGeminiKey={hasGeminiKey} />
        </>
      )}
    </div>
  );
}
