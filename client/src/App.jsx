import React, { useState, useEffect } from 'react';
import FitnessGoalToggle from './components/FitnessGoalToggle';
import CalorieProgressBar from './components/CalorieProgressBar';
import MacronutrientDashboard from './components/MacronutrientDashboard';
import FoodLoggingPanel from './components/FoodLoggingPanel';
import DailyHistoryGrid from './components/DailyHistoryGrid';
import WarningModal from './components/WarningModal';

export default function App() {
  const [summary, setSummary] = useState(null);
  const [meals, setMeals] = useState([]);
  const [currentGoal, setCurrentGoal] = useState('maintenance');
  const [hasGeminiKey, setHasGeminiKey] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showWarningModal, setShowWarningModal] = useState(false);

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

  // Check if budget exceeded to pop up Warning Modal
  useEffect(() => {
    if (summary && summary.budgetExceeded) {
      setShowWarningModal(true);
    } else {
      setShowWarningModal(false);
    }
  }, [summary]);

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

  // Add a new Meal Item
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

  // Delete a Meal Item by ID
  const handleDeleteMeal = async (mealId) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/meals/${mealId}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        setSummary(data.data.summary);
        setMeals(data.data.meals);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to delete meal item.');
    } finally {
      setLoading(false);
    }
  };

  // Clear All Meals
  const handleClearAll = async () => {
    if (!window.confirm('Are you sure you want to clear all logged meals for today?')) return;
    try {
      setLoading(true);
      const res = await fetch('/api/meals', { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setSummary(data.data.summary);
        setMeals(data.data.meals);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to clear meal logs.');
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
          <DailyHistoryGrid 
            meals={meals} 
            onDeleteMeal={handleDeleteMeal} 
            onClearAll={handleClearAll} 
            loading={loading} 
          />

          <WarningModal 
            isOpen={showWarningModal} 
            onClose={() => setShowWarningModal(false)}
            overByCalories={summary.totals.calories - summary.targets.calories}
            totalCalories={summary.totals.calories}
            targetCalories={summary.targets.calories}
          />
        </>
      )}
    </div>
  );
}
