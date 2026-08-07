import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { baselineFoods } from './data/foods.js';
import { scaleNutrients, calculateDailySummary, GOAL_THRESHOLDS } from './services/nutritionEngine.js';
import { mealStore } from './store/mealStore.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// 1. Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Calorie Tracker & Macro Dashboard API is running',
    timestamp: new Date().toISOString()
  });
});

// 2. Fetch baseline mock food items
app.get('/api/foods', (req, res) => {
  res.json({ success: true, data: baselineFoods });
});

// 3. Fetch current aggregate summary and active meals list
app.get('/api/summary', (req, res) => {
  const meals = mealStore.getMeals();
  const currentGoal = mealStore.getGoal();
  const summary = calculateDailySummary(meals, currentGoal);
  
  res.json({
    success: true,
    data: {
      summary,
      meals,
      availableGoals: GOAL_THRESHOLDS
    }
  });
});

// 4. Update Fitness Goal Mode (Weight Loss, Maintenance, Muscle Gain)
app.post('/api/goal', (req, res) => {
  const { goalKey } = req.body;
  if (!goalKey || !GOAL_THRESHOLDS[goalKey]) {
    return res.status(400).json({ success: false, message: 'Invalid fitness goal key provided.' });
  }

  mealStore.setGoal(goalKey);
  const meals = mealStore.getMeals();
  const summary = calculateDailySummary(meals, goalKey);

  res.json({
    success: true,
    message: `Goal updated to ${GOAL_THRESHOLDS[goalKey].label}`,
    data: { summary, meals }
  });
});

// 5. Add a Meal Item (Triggers Nutrient Scaling Algorithm)
app.post('/api/meals', (req, res) => {
  const { foodName, weightGrams } = req.body;

  if (!foodName || !weightGrams || isNaN(weightGrams) || Number(weightGrams) <= 0) {
    return res.status(400).json({
      success: false,
      message: 'Please provide a valid food name and portion weight in grams (> 0).'
    });
  }

  // Calculate nutrients via scaling engine
  const scaledNutrients = scaleNutrients(foodName, Number(weightGrams));
  const addedMeal = mealStore.addMeal(scaledNutrients);

  // Recalculate aggregate totals and status flag
  const meals = mealStore.getMeals();
  const currentGoal = mealStore.getGoal();
  const summary = calculateDailySummary(meals, currentGoal);

  res.status(201).json({
    success: true,
    message: 'Meal logged successfully',
    data: {
      addedMeal,
      summary,
      meals
    }
  });
});

// 6. Delete a Single Meal Item by ID
app.delete('/api/meals/:id', (req, res) => {
  const { id } = req.params;
  const deleted = mealStore.deleteMeal(id);

  if (!deleted) {
    return res.status(404).json({ success: false, message: 'Meal item not found.' });
  }

  // Recalculate summary in real-time
  const meals = mealStore.getMeals();
  const currentGoal = mealStore.getGoal();
  const summary = calculateDailySummary(meals, currentGoal);

  res.json({
    success: true,
    message: 'Meal removed successfully',
    data: { summary, meals }
  });
});

// 7. Clear All Logged Meals
app.delete('/api/meals', (req, res) => {
  mealStore.clearAll();
  const meals = mealStore.getMeals();
  const currentGoal = mealStore.getGoal();
  const summary = calculateDailySummary(meals, currentGoal);

  res.json({
    success: true,
    message: 'All meal logs cleared.',
    data: { summary, meals }
  });
});


app.listen(PORT, () => {
  console.log(` Server is running on port ${PORT}`);
});
