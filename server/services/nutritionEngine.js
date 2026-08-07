import { baselineFoods } from '../data/foods.js';

// Base target thresholds per Fitness Goal
export const GOAL_THRESHOLDS = {
  weight_loss: {
    label: 'Weight Loss',
    calories: 1800,
    protein: 140, // grams
    carbs: 150,   // grams
    fats: 50      // grams
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
 * Nutrient Scaling Algorithm
 * Scales nutritional metrics based on portion weight relative to 100g reference.
 */
export function scaleNutrients(foodName, weightInGrams) {
  const portionRatio = weightInGrams / 100;
  
  // Find matching baseline food (case-insensitive)
  const matchedFood = baselineFoods.find(
    f => f.name.toLowerCase().includes(foodName.toLowerCase()) || foodName.toLowerCase().includes(f.name.toLowerCase())
  );

  let base = matchedFood || {
    caloriesPer100g: 150, // default fallback standard estimation
    proteinPer100g: 10,
    carbsPer100g: 15,
    fatsPer100g: 5
  };

  return {
    foodName: foodName,
    weightGrams: Number(weightInGrams),
    calories: Math.round(base.caloriesPer100g * portionRatio),
    protein: Number((base.proteinPer100g * portionRatio).toFixed(1)),
    carbs: Number((base.carbsPer100g * portionRatio).toFixed(1)),
    fats: Number((base.fatsPer100g * portionRatio).toFixed(1))
  };
}

/**
 * Aggregates daily meal totals and calculates status flags against target limits
 */
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

  // Round values for clean presentation
  totals.protein = Number(totals.protein.toFixed(1));
  totals.carbs = Number(totals.carbs.toFixed(1));
  totals.fats = Number(totals.fats.toFixed(1));

  const caloriesRemaining = Math.max(0, goalTarget.calories - totals.calories);
  const budgetExceeded = totals.calories > goalTarget.calories;

  // Percentage calculations capped at 100% for bars or allowed over for warning states
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
