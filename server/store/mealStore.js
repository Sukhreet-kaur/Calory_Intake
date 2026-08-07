// In-memory state store for active daily meals and selected fitness goal
class MealStore {
  constructor() {
    this.currentGoal = 'maintenance'; // default goal: Maintenance (2200 kcal)
    this.meals = []; // active meal logs
  }

  getGoal() {
    return this.currentGoal;
  }

  setGoal(goalKey) {
    if (['weight_loss', 'maintenance', 'muscle_gain'].includes(goalKey)) {
      this.currentGoal = goalKey;
    }
    return this.currentGoal;
  }

  getMeals() {
    return this.meals;
  }

  addMeal(scaledMeal) {
    const mealWithId = {
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      ...scaledMeal
    };
    this.meals.unshift(mealWithId); // prepend newest meal
    return mealWithId;
  }

  deleteMeal(id) {
    const initialCount = this.meals.length;
    this.meals = this.meals.filter(item => item.id !== id);
    return this.meals.length < initialCount; // returns true if deleted
  }

  clearAll() {
    this.meals = [];
  }
}

export const mealStore = new MealStore();
