const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { runQuery, getQuery, allQuery } = require('../db/database');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// Meal plan generator helper
async function generateMealPlan(userId, profile, duration = 7) {
  const { current_weight, goal_weight, height, fitness_level, primary_goal, dietary_restrictions, meals_per_day } = profile;

  // Calculate calorie target using simplified TDEE
  const weightKg = current_weight * 0.453592; // Convert lbs to kg
  const heightCm = height * 2.54; // Convert inches to cm
  const age = 30; // Simplified - would use actual age from DOB

  // BMR calculation (Mifflin-St Jeor)
  let bmr = (10 * weightKg) + (6.25 * heightCm) - (5 * age) + 5; // Male formula for simplicity

  // Activity multiplier based on fitness level
  const activityMultiplier = {
    beginner: 1.375,
    intermediate: 1.55,
    advanced: 1.725
  }[fitness_level] || 1.375;

  let tdee = bmr * activityMultiplier;

  // Adjust for goal
  let dailyCalories = tdee;
  if (primary_goal === 'lose_weight') {
    dailyCalories = tdee - 500; // 500 cal deficit for 1lb/week loss
  } else if (primary_goal === 'build_muscle') {
    dailyCalories = tdee + 300; // Slight surplus for muscle gain
  }

  dailyCalories = Math.round(dailyCalories);

  // Calculate macros (weight loss focused)
  const proteinG = Math.round(goal_weight * 0.8); // 0.8g per lb goal weight
  const proteinCals = proteinG * 4;
  const fatsG = Math.round(dailyCalories * 0.28 / 9); // 28% of calories from fat
  const fatsCals = fatsG * 9;
  const carbsG = Math.round((dailyCalories - proteinCals - fatsCals) / 4);

  // Create meal plan
  const planId = uuidv4();
  const planName = `${primary_goal.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} - ${duration} Day Plan`;

  await runQuery(
    `INSERT INTO meal_plans (plan_id, user_id, plan_name, plan_duration_days, daily_calorie_target, daily_protein_g, daily_carbs_g, daily_fats_g, is_active)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0)`,
    [planId, userId, planName, duration, dailyCalories, proteinG, carbsG, fatsG]
  );

  // Get recipes from database that match dietary restrictions
  const dietaryRestrictionsList = dietary_restrictions ? JSON.parse(dietary_restrictions) : [];
  const allRecipes = await allQuery('SELECT * FROM recipes');

  // Filter recipes by dietary restrictions
  const filteredRecipes = allRecipes.filter(recipe => {
    if (!recipe.dietary_labels && dietaryRestrictionsList.length > 0) return false;

    const recipeLabels = recipe.dietary_labels ? JSON.parse(recipe.dietary_labels) : [];

    // Check if recipe matches user's dietary restrictions
    for (let restriction of dietaryRestrictionsList) {
      if (restriction === 'vegetarian' && !recipeLabels.includes('vegetarian') && !recipeLabels.includes('vegan')) {
        return false;
      }
      if (restriction === 'vegan' && !recipeLabels.includes('vegan')) {
        return false;
      }
      // Add more restriction checks as needed
    }

    return true;
  });

  // If no recipes match, use all recipes
  const recipesToUse = filteredRecipes.length > 0 ? filteredRecipes : allRecipes;

  // Separate recipes by meal type
  const breakfastRecipes = recipesToUse.filter(r => r.meal_type === 'breakfast');
  const lunchRecipes = recipesToUse.filter(r => r.meal_type === 'lunch');
  const dinnerRecipes = recipesToUse.filter(r => r.meal_type === 'dinner');
  const snackRecipes = recipesToUse.filter(r => r.meal_type === 'snack');

  // Generate daily meals
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  for (let day = 1; day <= duration; day++) {
    const dayOfWeek = days[(day - 1) % 7];
    const dailyMealId = uuidv4();

    // Select random recipes ensuring variety
    const breakfast = breakfastRecipes[Math.floor(Math.random() * breakfastRecipes.length)];
    const lunch = lunchRecipes[Math.floor(Math.random() * lunchRecipes.length)];
    const dinner = dinnerRecipes[Math.floor(Math.random() * dinnerRecipes.length)];
    const snack1 = snackRecipes.length > 0 ? snackRecipes[Math.floor(Math.random() * snackRecipes.length)] : null;

    await runQuery(
      `INSERT INTO daily_meals (id, plan_id, day_number, day_of_week, breakfast_recipe_id, lunch_recipe_id, dinner_recipe_id, snack1_recipe_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [dailyMealId, planId, day, dayOfWeek, breakfast?.recipe_id, lunch?.recipe_id, dinner?.recipe_id, snack1?.recipe_id]
    );
  }

  return planId;
}

// POST /api/v1/meals/generate - Generate new meal plan
router.post('/generate', authenticateToken, async (req, res) => {
  try {
    const { duration } = req.body;
    const planDuration = duration || 7;

    // Get user profile
    const profile = await getQuery('SELECT * FROM user_profiles WHERE user_id = ?', [req.user.id]);

    if (!profile) {
      return res.status(404).json({ error: { message: 'Please complete onboarding first' } });
    }

    // Generate plan
    const planId = await generateMealPlan(req.user.id, profile, planDuration);

    // Get the generated plan with meals
    const plan = await getQuery('SELECT * FROM meal_plans WHERE plan_id = ?', [planId]);
    const dailyMeals = await allQuery(
      `SELECT * FROM daily_meals WHERE plan_id = ? ORDER BY day_number`,
      [planId]
    );

    // Fetch recipe details for each day
    for (let day of dailyMeals) {
      if (day.breakfast_recipe_id) {
        day.breakfast = await getQuery('SELECT * FROM recipes WHERE recipe_id = ?', [day.breakfast_recipe_id]);
      }
      if (day.lunch_recipe_id) {
        day.lunch = await getQuery('SELECT * FROM recipes WHERE recipe_id = ?', [day.lunch_recipe_id]);
      }
      if (day.dinner_recipe_id) {
        day.dinner = await getQuery('SELECT * FROM recipes WHERE recipe_id = ?', [day.dinner_recipe_id]);
      }
      if (day.snack1_recipe_id) {
        day.snack1 = await getQuery('SELECT * FROM recipes WHERE recipe_id = ?', [day.snack1_recipe_id]);
      }
    }

    res.json({
      message: 'Meal plan generated successfully',
      plan,
      daily_meals: dailyMeals
    });
  } catch (error) {
    console.error('Generate meal plan error:', error);
    res.status(500).json({ error: { message: 'Failed to generate meal plan' } });
  }
});

// GET /api/v1/meals/plans - Get all user's meal plans
router.get('/plans', authenticateToken, async (req, res) => {
  try {
    const plans = await allQuery(
      'SELECT * FROM meal_plans WHERE user_id = ? ORDER BY created_at DESC',
      [req.user.id]
    );

    res.json({ plans });
  } catch (error) {
    console.error('Get meal plans error:', error);
    res.status(500).json({ error: { message: 'Failed to get meal plans' } });
  }
});

// GET /api/v1/meals/plans/:planId - Get specific meal plan details
router.get('/plans/:planId', authenticateToken, async (req, res) => {
  try {
    const plan = await getQuery('SELECT * FROM meal_plans WHERE plan_id = ? AND user_id = ?', [req.params.planId, req.user.id]);

    if (!plan) {
      return res.status(404).json({ error: { message: 'Meal plan not found' } });
    }

    const dailyMeals = await allQuery(
      'SELECT * FROM daily_meals WHERE plan_id = ? ORDER BY day_number',
      [req.params.planId]
    );

    // Fetch recipe details for each day
    for (let day of dailyMeals) {
      if (day.breakfast_recipe_id) {
        day.breakfast = await getQuery('SELECT * FROM recipes WHERE recipe_id = ?', [day.breakfast_recipe_id]);
      }
      if (day.lunch_recipe_id) {
        day.lunch = await getQuery('SELECT * FROM recipes WHERE recipe_id = ?', [day.lunch_recipe_id]);
      }
      if (day.dinner_recipe_id) {
        day.dinner = await getQuery('SELECT * FROM recipes WHERE recipe_id = ?', [day.dinner_recipe_id]);
      }
      if (day.snack1_recipe_id) {
        day.snack1 = await getQuery('SELECT * FROM recipes WHERE recipe_id = ?', [day.snack1_recipe_id]);
      }
    }

    res.json({ plan, daily_meals: dailyMeals });
  } catch (error) {
    console.error('Get meal plan error:', error);
    res.status(500).json({ error: { message: 'Failed to get meal plan' } });
  }
});

// POST /api/v1/meals/plans/:planId/activate - Set as active plan
router.post('/plans/:planId/activate', authenticateToken, async (req, res) => {
  try {
    // Deactivate all other plans
    await runQuery('UPDATE meal_plans SET is_active = 0 WHERE user_id = ?', [req.user.id]);

    // Activate this plan
    await runQuery('UPDATE meal_plans SET is_active = 1 WHERE plan_id = ? AND user_id = ?', [req.params.planId, req.user.id]);

    res.json({ message: 'Meal plan activated' });
  } catch (error) {
    console.error('Activate meal plan error:', error);
    res.status(500).json({ error: { message: 'Failed to activate meal plan' } });
  }
});

// DELETE /api/v1/meals/plans/:planId - Delete meal plan
router.delete('/plans/:planId', authenticateToken, async (req, res) => {
  try {
    await runQuery('DELETE FROM meal_plans WHERE plan_id = ? AND user_id = ?', [req.params.planId, req.user.id]);
    res.json({ message: 'Meal plan deleted' });
  } catch (error) {
    console.error('Delete meal plan error:', error);
    res.status(500).json({ error: { message: 'Failed to delete meal plan' } });
  }
});

// GET /api/v1/meals/recipes/:recipeId - Get recipe details
router.get('/recipes/:recipeId', authenticateToken, async (req, res) => {
  try {
    const recipe = await getQuery('SELECT * FROM recipes WHERE recipe_id = ?', [req.params.recipeId]);

    if (!recipe) {
      return res.status(404).json({ error: { message: 'Recipe not found' } });
    }

    // Parse JSON fields
    if (recipe.ingredients) recipe.ingredients = JSON.parse(recipe.ingredients);
    if (recipe.instructions) recipe.instructions = JSON.parse(recipe.instructions);
    if (recipe.dietary_labels) recipe.dietary_labels = JSON.parse(recipe.dietary_labels);
    if (recipe.allergens) recipe.allergens = JSON.parse(recipe.allergens);

    res.json({ recipe });
  } catch (error) {
    console.error('Get recipe error:', error);
    res.status(500).json({ error: { message: 'Failed to get recipe' } });
  }
});

// POST /api/v1/meals/complete - Log meal completion
router.post('/complete', authenticateToken, async (req, res) => {
  try {
    const { recipe_id, plan_id, meal_type, actual_servings, rating, notes } = req.body;

    const completionId = uuidv4();
    await runQuery(
      `INSERT INTO meal_completions (completion_id, user_id, recipe_id, plan_id, meal_type, actual_servings, rating, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [completionId, req.user.id, recipe_id, plan_id, meal_type, actual_servings || 1.0, rating, notes]
    );

    res.json({ message: 'Meal logged successfully', completion_id: completionId });
  } catch (error) {
    console.error('Log meal error:', error);
    res.status(500).json({ error: { message: 'Failed to log meal' } });
  }
});

// GET /api/v1/meals/shopping-list/:planId - Get shopping list for plan
router.get('/shopping-list/:planId', authenticateToken, async (req, res) => {
  try {
    const plan = await getQuery('SELECT * FROM meal_plans WHERE plan_id = ? AND user_id = ?', [req.params.planId, req.user.id]);

    if (!plan) {
      return res.status(404).json({ error: { message: 'Meal plan not found' } });
    }

    // Get all meals in the plan
    const dailyMeals = await allQuery('SELECT * FROM daily_meals WHERE plan_id = ?', [req.params.planId]);

    // Collect all recipe IDs
    const recipeIds = new Set();
    dailyMeals.forEach(day => {
      if (day.breakfast_recipe_id) recipeIds.add(day.breakfast_recipe_id);
      if (day.lunch_recipe_id) recipeIds.add(day.lunch_recipe_id);
      if (day.dinner_recipe_id) recipeIds.add(day.dinner_recipe_id);
      if (day.snack1_recipe_id) recipeIds.add(day.snack1_recipe_id);
      if (day.snack2_recipe_id) recipeIds.add(day.snack2_recipe_id);
    });

    // Get all recipes and their ingredients
    const shoppingList = {};

    for (let recipeId of recipeIds) {
      const recipe = await getQuery('SELECT ingredients FROM recipes WHERE recipe_id = ?', [recipeId]);
      if (recipe && recipe.ingredients) {
        const ingredients = JSON.parse(recipe.ingredients);

        ingredients.forEach(ing => {
          const key = ing.ingredient_name.toLowerCase();
          if (shoppingList[key]) {
            shoppingList[key].quantity += ing.quantity;
          } else {
            shoppingList[key] = {
              ingredient_name: ing.ingredient_name,
              quantity: ing.quantity,
              unit: ing.unit,
              category: ing.category || 'other'
            };
          }
        });
      }
    }

    // Convert to array and organize by category
    const organizedList = Object.values(shoppingList).reduce((acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = [];
      }
      acc[item.category].push(item);
      return acc;
    }, {});

    res.json({ shopping_list: organizedList });
  } catch (error) {
    console.error('Get shopping list error:', error);
    res.status(500).json({ error: { message: 'Failed to get shopping list' } });
  }
});

module.exports = router;
