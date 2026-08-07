import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import { baselineFoods } from './data/foods.js';
import { scaleNutrients, calculateDailySummary, GOAL_THRESHOLDS } from './services/nutritionEngine.js';
import { mealStore } from './store/mealStore.js';
import { analyzeFoodImage } from './services/geminiService.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Configure Multer for in-memory image upload handling
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB max
});

app.use(cors());
app.use(express.json());

// 1. Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Calorie Tracker & Macro Dashboard API is running',
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
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
      availableGoals: GOAL_THRESHOLDS,
      hasGeminiKey: Boolean(process.env.GEMINI_API_KEY)
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

// 5. Add a Meal Item (Triggers AI / Baseline Nutrient Scaling Algorithm)
app.post('/api/meals', async (req, res) => {
  try {
    const { foodName, weightGrams, customBase } = req.body;

    if (!foodName || !weightGrams || isNaN(weightGrams) || Number(weightGrams) <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid food name and portion weight in grams (> 0).'
      });
    }

    // Dynamic AI or baseline scaling calculation
    const scaledNutrients = await scaleNutrients(foodName, Number(weightGrams), customBase);
    const addedMeal = mealStore.addMeal(scaledNutrients);

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
  } catch (err) {
    console.error('Error logging meal:', err);
    res.status(500).json({ success: false, message: 'Server error while scaling nutrients.' });
  }
});

// 6. REAL Gemini AI Image Scanner Endpoint
app.post('/api/scan-image', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image file uploaded.' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(400).json({
        success: false,
        isKeyMissing: true,
        message: 'GEMINI_API_KEY is not configured in server/.env file. Please add your Gemini API Key to enable real image scanning.'
      });
    }

    const aiAnalysis = await analyzeFoodImage(req.file.buffer, req.file.mimetype);

    res.json({
      success: true,
      data: aiAnalysis
    });
  } catch (err) {
    console.error('AI Image Scan error:', err);
    if (err.message === 'GEMINI_API_KEY_MISSING') {
      return res.status(400).json({
        success: false,
        isKeyMissing: true,
        message: 'GEMINI_API_KEY is missing.'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Failed to analyze image with Gemini AI. Please try again or log manually.'
    });
  }
});

// 7. Delete a Single Meal Item by ID
app.delete('/api/meals/:id', (req, res) => {
  const { id } = req.params;
  const deleted = mealStore.deleteMeal(id);

  if (!deleted) {
    return res.status(404).json({ success: false, message: 'Meal item not found.' });
  }

  const meals = mealStore.getMeals();
  const currentGoal = mealStore.getGoal();
  const summary = calculateDailySummary(meals, currentGoal);

  res.json({
    success: true,
    message: 'Meal removed successfully',
    data: { summary, meals }
  });
});

// 8. Clear All Logged Meals
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
