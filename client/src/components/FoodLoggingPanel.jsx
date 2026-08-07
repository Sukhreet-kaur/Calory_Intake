import React, { useState, useRef } from 'react';

export default function FoodLoggingPanel({ onAddMeal, loading, hasGeminiKey }) {
  const [foodName, setFoodName] = useState('');
  const [weightGrams, setWeightGrams] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  // Custom Macro Override state
  const [customCalories, setCustomCalories] = useState('');
  const [customProtein, setCustomProtein] = useState('');
  const [customCarbs, setCustomCarbs] = useState('');
  const [customFats, setCustomFats] = useState('');

  const [isScanning, setIsScanning] = useState(false);
  const [scanMessage, setScanMessage] = useState('');
  const [scanStatus, setScanStatus] = useState('info'); // 'info', 'scanning', 'success', 'error'
  
  const fileInputRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!foodName.trim() || !weightGrams || Number(weightGrams) <= 0) {
      alert('Please enter a valid food name and portion weight (> 0g).');
      return;
    }

    let customBase = null;
    if (showAdvanced && customCalories) {
      customBase = {
        caloriesPer100g: Number(customCalories) || 0,
        proteinPer100g: Number(customProtein) || 0,
        carbsPer100g: Number(customCarbs) || 0,
        fatsPer100g: Number(customFats) || 0
      };
    }

    onAddMeal(foodName.trim(), Number(weightGrams), customBase);
    
    // Clear inputs
    setFoodName('');
    setWeightGrams('');
    setCustomCalories('');
    setCustomProtein('');
    setCustomCarbs('');
    setCustomFats('');
    setShowAdvanced(false);
  };

  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    setIsScanning(true);
    setScanStatus('scanning');
    setScanMessage(`🔍 Gemini AI scanning "${file.name}"...`);

    try {
      const res = await fetch('/api/scan-image', {
        method: 'POST',
        body: formData
      });

      const result = await res.json();

      if (result.success) {
        const { foodName: detectedName, estimatedWeightGrams, caloriesPer100g, proteinPer100g, carbsPer100g, fatsPer100g } = result.data;
        
        setFoodName(detectedName);
        setWeightGrams(estimatedWeightGrams);
        setCustomCalories(caloriesPer100g);
        setCustomProtein(proteinPer100g);
        setCustomCarbs(carbsPer100g);
        setCustomFats(fatsPer100g);
        setShowAdvanced(true);

        setScanStatus('success');
        setScanMessage(`✨ Gemini AI Detected: "${detectedName}" (~${estimatedWeightGrams}g). Auto-filled inputs!`);
      } else {
        setScanStatus('error');
        setScanMessage(result.message || 'Image scanning failed.');
      }
    } catch (err) {
      console.error(err);
      setScanStatus('error');
      setScanMessage('Failed to send image to server for AI scanning.');
    } finally {
      setIsScanning(false);
      // reset file input
      e.target.value = '';
    }
  };

  return (
    <div className="glass-card logging-panel">
      <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span>🥗</span> Log Meal & Food Scanner
        </span>
        {!hasGeminiKey && (
          <span style={{ fontSize: '0.75rem', color: '#f59e0b', background: 'rgba(245, 158, 11, 0.15)', padding: '0.2rem 0.6rem', borderRadius: '999px', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
            ⚠️ Gemini Key Optional
          </span>
        )}
      </h3>

      {/* Hidden File Input for Real Image Upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        style={{ display: 'none' }}
      />

      <form onSubmit={handleSubmit} className="logging-form">
        <div className="form-group">
          <label htmlFor="foodName">Food Name (Standard dish or custom dish)</label>
          <input
            id="foodName"
            type="text"
            placeholder="e.g. Paneer Butter Masala, Salmon, Pizza..."
            value={foodName}
            onChange={(e) => setFoodName(e.target.value)}
            disabled={loading || isScanning}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="portionWeight">Portion Weight (grams)</label>
          <input
            id="portionWeight"
            type="number"
            min="1"
            max="2000"
            placeholder="e.g. 200"
            value={weightGrams}
            onChange={(e) => setWeightGrams(e.target.value)}
            disabled={loading || isScanning}
            required
          />
        </div>

        {/* Collapsible Advanced Nutrition Override */}
        <div style={{ margin: '0.25rem 0' }}>
          <button
            type="button"
            style={{ background: 'none', border: 'none', color: '#38bdf8', fontSize: '0.85rem', cursor: 'pointer', padding: 0 }}
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            {showAdvanced ? '▼ Hide Custom Macro Override (per 100g)' : '▶ Specify Custom Nutrients (per 100g) [Optional]'}
          </button>
        </div>

        {showAdvanced && (
          <div className="advanced-macros-grid">
            <div className="form-group">
              <label>Calories (100g)</label>
              <input type="number" placeholder="kcal" value={customCalories} onChange={(e) => setCustomCalories(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Protein (g)</label>
              <input type="number" step="0.1" placeholder="g" value={customProtein} onChange={(e) => setCustomProtein(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Carbs (g)</label>
              <input type="number" step="0.1" placeholder="g" value={customCarbs} onChange={(e) => setCustomCarbs(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Fats (g)</label>
              <input type="number" step="0.1" placeholder="g" value={customFats} onChange={(e) => setCustomFats(e.target.value)} />
            </div>
          </div>
        )}

        <div className="button-group">
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading || isScanning}
          >
            ➕ Log Meal
          </button>

          <button
            type="button"
            className="btn btn-ai"
            onClick={handleUploadClick}
            disabled={loading || isScanning}
          >
            {isScanning ? '⏳ Analyzing Photo...' : '📸 Upload Food Image (Gemini AI Scanner)'}
          </button>
        </div>

        {scanMessage && (
          <div className={`scan-badge ${scanStatus}`}>
            {scanMessage}
          </div>
        )}
      </form>
    </div>
  );
}
