import { baselineFoods } from '../data/foods.js';
import { estimateNutrientsByAI } from './geminiService.js';

export const GOAL_THRESHOLDS = {
  weight_loss: {
    label: 'Weight Loss',
    calories: 1800,
    protein: 140,
    carbs: 150,
    fats: 50
  },
  maintenance: {
    label: 'Maintenance',
    calories: 2200,
    protein: 130,
    carbs: 220,
    fats: 70
  },
  muscle_gain: {
    label: 'Muscle Gain',
    calories: 2800,
    protein: 180,
    carbs: 320,
    fats: 80
  }
};

/**
 * Real Nutrient Scaling Engine
 * Supports baseline matching, AI dynamic estimation for ANY food name, or explicit user override.
 */
export async function scaleNutrients(foodName, weightInGrams, customBase = null) {
  const portionRatio = weightInGrams / 100;
  let base = null;

  if (customBase && customBase.caloriesPer100g) {
    base = customBase;
  } else {
    // 1. Check baseline DB match
    const matchedFood = baselineFoods.find(
      f => f.name.toLowerCase().includes(foodName.toLowerCase()) || foodName.toLowerCase().includes(f.name.toLowerCase())
    );

    if (matchedFood) {
      base = matchedFood;
    } else {
      // 2. Query Gemini AI for real dynamic nutrition calculation of custom dish
      const aiEstimated = await estimateNutrientsByAI(foodName);
      if (aiEstimated) {
        base = aiEstimated;
      } else {
        // 3. Realistic culinary average estimation fallback
        base = {
          caloriesPer100g: 160,
          proteinPer100g: 10,
          carbsPer100g: 18,
          fatsPer100g: 6
        };
      }
    }
  }

  return {
    foodName: foodName,
    weightGrams: Number(weightInGrams),
    calories: Math.round(base.caloriesPer100g * portionRatio),
    protein: Number((base.proteinPer100g * portionRatio).toFixed(1)),
    carbs: Number((base.carbsPer100g * portionRatio).toFixed(1)),
    fats: Number((base.fatsPer100g * portionRatio).toFixed(1)),
    baseNutrientsPer100g: {
      calories: base.caloriesPer100g,
      protein: base.proteinPer100g,
      carbs: base.carbsPer100g,
      fats: base.fatsPer100g
    }
  };
}

export function calculateDailySummary(meals, currentGoalKey = 'maintenance') {
  const goalTarget = GOAL_THRESHOLDS[currentGoalKey] || GOAL_THRESHOLDS.maintenance;

  const totals = meals.reduce(
    (acc, item) => {
      acc.calories += item.calories;
      acc.protein += item.protein;
      acc.carbs += item.carbs;
      acc.fats += item.fats;
      return acc;
    },
    { calories: 0, protein: 0, carbs: 0, fats: 0 }
  );

  totals.protein = Number(totals.protein.toFixed(1));
  totals.carbs = Number(totals.carbs.toFixed(1));
  totals.fats = Number(totals.fats.toFixed(1));

  const caloriesRemaining = Math.max(0, goalTarget.calories - totals.calories);
  const budgetExceeded = totals.calories > goalTarget.calories;

  const caloriePercent = Math.min(100, Math.round((totals.calories / goalTarget.calories) * 100));
  const proteinPercent = Math.min(100, Math.round((totals.protein / goalTarget.protein) * 100));
  const carbsPercent = Math.min(100, Math.round((totals.carbs / goalTarget.carbs) * 100));
  const fatsPercent = Math.min(100, Math.round((totals.fats / goalTarget.fats) * 100));

  return {
    goalKey: currentGoalKey,
    targets: goalTarget,
    totals,
    caloriesRemaining,
    budgetExceeded,
    percentages: {
      calories: caloriePercent,
      protein: proteinPercent,
      carbs: carbsPercent,
      fats: fatsPercent
    }
  };
}
