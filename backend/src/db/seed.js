const { runQuery } = require('./database');
const { v4: uuidv4 } = require('uuid');

async function seed() {
  console.log('🌱 Seeding database...');

  try {
    // Wait for database to be fully initialized
    console.log('Waiting for database initialization...');
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Seed recipes
    await seedRecipes();

    // Seed achievements
    await seedAchievements();

    console.log('✅ Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

async function seedRecipes() {
  console.log('Adding recipes...');

  const recipes = [
    // Breakfast recipes
    {
      recipe_id: uuidv4(),
      recipe_name: 'Greek Yogurt Parfait',
      meal_type: 'breakfast',
      description: 'High-protein yogurt layered with berries and granola',
      prep_time_min: 5,
      cook_time_min: 0,
      servings: 1,
      difficulty: 'beginner',
      calories_per_serving: 320,
      protein_g: 25,
      carbs_g: 38,
      fats_g: 8,
      fiber_g: 5,
      is_meal_prep_friendly: 1,
      dietary_labels: JSON.stringify(['vegetarian']),
      allergens: JSON.stringify(['dairy']),
      ingredients: JSON.stringify([
        { ingredient_name: 'Greek yogurt', quantity: 1, unit: 'cup', category: 'dairy' },
        { ingredient_name: 'Mixed berries', quantity: 0.5, unit: 'cup', category: 'produce' },
        { ingredient_name: 'Granola', quantity: 0.25, unit: 'cup', category: 'grains' },
        { ingredient_name: 'Honey', quantity: 1, unit: 'tbsp', category: 'pantry' }
      ]),
      instructions: JSON.stringify([
        'Layer half the yogurt in a glass or bowl',
        'Add half the berries',
        'Add remaining yogurt',
        'Top with remaining berries and granola',
        'Drizzle with honey'
      ])
    },
    {
      recipe_id: uuidv4(),
      recipe_name: 'Veggie Egg Scramble',
      meal_type: 'breakfast',
      description: 'Protein-packed eggs with colorful vegetables',
      prep_time_min: 5,
      cook_time_min: 10,
      servings: 1,
      difficulty: 'beginner',
      calories_per_serving: 280,
      protein_g: 22,
      carbs_g: 12,
      fats_g: 16,
      fiber_g: 3,
      is_meal_prep_friendly: 0,
      dietary_labels: JSON.stringify(['vegetarian']),
      allergens: JSON.stringify(['eggs', 'dairy']),
      ingredients: JSON.stringify([
        { ingredient_name: 'Eggs', quantity: 3, unit: 'whole', category: 'protein' },
        { ingredient_name: 'Bell pepper', quantity: 0.5, unit: 'cup', category: 'produce' },
        { ingredient_name: 'Spinach', quantity: 1, unit: 'cup', category: 'produce' },
        { ingredient_name: 'Cheese', quantity: 2, unit: 'tbsp', category: 'dairy' },
        { ingredient_name: 'Olive oil', quantity: 1, unit: 'tsp', category: 'pantry' }
      ]),
      instructions: JSON.stringify([
        'Heat oil in a non-stick pan',
        'Sauté bell peppers for 2-3 minutes',
        'Add spinach and cook until wilted',
        'Beat eggs and pour into pan',
        'Scramble eggs until cooked',
        'Top with cheese'
      ])
    },
    {
      recipe_id: uuidv4(),
      recipe_name: 'Overnight Oats',
      meal_type: 'breakfast',
      description: 'Convenient make-ahead breakfast',
      prep_time_min: 5,
      cook_time_min: 0,
      servings: 1,
      difficulty: 'beginner',
      calories_per_serving: 350,
      protein_g: 18,
      carbs_g: 52,
      fats_g: 10,
      fiber_g: 8,
      is_meal_prep_friendly: 1,
      dietary_labels: JSON.stringify(['vegetarian']),
      allergens: JSON.stringify(['dairy']),
      ingredients: JSON.stringify([
        { ingredient_name: 'Rolled oats', quantity: 0.5, unit: 'cup', category: 'grains' },
        { ingredient_name: 'Protein powder', quantity: 1, unit: 'scoop', category: 'protein' },
        { ingredient_name: 'Almond milk', quantity: 0.75, unit: 'cup', category: 'dairy' },
        { ingredient_name: 'Chia seeds', quantity: 1, unit: 'tbsp', category: 'pantry' },
        { ingredient_name: 'Banana', quantity: 0.5, unit: 'whole', category: 'produce' }
      ]),
      instructions: JSON.stringify([
        'Mix oats, protein powder, and chia seeds in a jar',
        'Add almond milk and stir well',
        'Slice banana and add to jar',
        'Cover and refrigerate overnight',
        'Enjoy cold or heat up in morning'
      ])
    },

    // Lunch recipes
    {
      recipe_id: uuidv4(),
      recipe_name: 'Grilled Chicken Salad',
      meal_type: 'lunch',
      description: 'Fresh salad with grilled chicken breast',
      prep_time_min: 10,
      cook_time_min: 15,
      servings: 1,
      difficulty: 'beginner',
      calories_per_serving: 380,
      protein_g: 42,
      carbs_g: 18,
      fats_g: 16,
      fiber_g: 6,
      is_meal_prep_friendly: 1,
      dietary_labels: JSON.stringify([]),
      allergens: JSON.stringify([]),
      ingredients: JSON.stringify([
        { ingredient_name: 'Chicken breast', quantity: 6, unit: 'oz', category: 'protein' },
        { ingredient_name: 'Mixed greens', quantity: 3, unit: 'cups', category: 'produce' },
        { ingredient_name: 'Cherry tomatoes', quantity: 0.5, unit: 'cup', category: 'produce' },
        { ingredient_name: 'Cucumber', quantity: 0.5, unit: 'cup', category: 'produce' },
        { ingredient_name: 'Balsamic vinaigrette', quantity: 2, unit: 'tbsp', category: 'pantry' }
      ]),
      instructions: JSON.stringify([
        'Season chicken with salt, pepper, and herbs',
        'Grill chicken for 6-7 minutes per side',
        'Let chicken rest 5 minutes, then slice',
        'Combine greens, tomatoes, and cucumber in bowl',
        'Top with sliced chicken and dressing'
      ])
    },
    {
      recipe_id: uuidv4(),
      recipe_name: 'Turkey & Avocado Wrap',
      meal_type: 'lunch',
      description: 'Protein-packed wrap with healthy fats',
      prep_time_min: 10,
      cook_time_min: 0,
      servings: 1,
      difficulty: 'beginner',
      calories_per_serving: 420,
      protein_g: 35,
      carbs_g: 32,
      fats_g: 18,
      fiber_g: 8,
      is_meal_prep_friendly: 1,
      dietary_labels: JSON.stringify([]),
      allergens: JSON.stringify(['gluten']),
      ingredients: JSON.stringify([
        { ingredient_name: 'Whole wheat tortilla', quantity: 1, unit: 'large', category: 'grains' },
        { ingredient_name: 'Turkey breast', quantity: 4, unit: 'oz', category: 'protein' },
        { ingredient_name: 'Avocado', quantity: 0.5, unit: 'whole', category: 'produce' },
        { ingredient_name: 'Lettuce', quantity: 1, unit: 'cup', category: 'produce' },
        { ingredient_name: 'Tomato', quantity: 2, unit: 'slices', category: 'produce' },
        { ingredient_name: 'Mustard', quantity: 1, unit: 'tsp', category: 'pantry' }
      ]),
      instructions: JSON.stringify([
        'Lay tortilla flat',
        'Spread mustard down the center',
        'Layer turkey, lettuce, tomato',
        'Add sliced avocado',
        'Fold sides and roll tightly',
        'Cut in half diagonally'
      ])
    },
    {
      recipe_id: uuidv4(),
      recipe_name: 'Quinoa Buddha Bowl',
      meal_type: 'lunch',
      description: 'Nutritious bowl packed with protein and veggies',
      prep_time_min: 15,
      cook_time_min: 20,
      servings: 1,
      difficulty: 'intermediate',
      calories_per_serving: 450,
      protein_g: 28,
      carbs_g: 52,
      fats_g: 16,
      fiber_g: 10,
      is_meal_prep_friendly: 1,
      dietary_labels: JSON.stringify(['vegetarian', 'vegan']),
      allergens: JSON.stringify([]),
      ingredients: JSON.stringify([
        { ingredient_name: 'Quinoa', quantity: 0.5, unit: 'cup', category: 'grains' },
        { ingredient_name: 'Chickpeas', quantity: 0.75, unit: 'cup', category: 'protein' },
        { ingredient_name: 'Sweet potato', quantity: 1, unit: 'small', category: 'produce' },
        { ingredient_name: 'Kale', quantity: 1, unit: 'cup', category: 'produce' },
        { ingredient_name: 'Tahini dressing', quantity: 2, unit: 'tbsp', category: 'pantry' }
      ]),
      instructions: JSON.stringify([
        'Cook quinoa according to package directions',
        'Roast cubed sweet potato at 400°F for 20 minutes',
        'Sauté or massage kale until tender',
        'Arrange quinoa, sweet potato, chickpeas, and kale in bowl',
        'Drizzle with tahini dressing'
      ])
    },

    // Dinner recipes
    {
      recipe_id: uuidv4(),
      recipe_name: 'Baked Salmon with Broccoli',
      meal_type: 'dinner',
      description: 'Omega-3 rich salmon with roasted vegetables',
      prep_time_min: 10,
      cook_time_min: 20,
      servings: 1,
      difficulty: 'beginner',
      calories_per_serving: 420,
      protein_g: 38,
      carbs_g: 14,
      fats_g: 24,
      fiber_g: 5,
      is_meal_prep_friendly: 1,
      dietary_labels: JSON.stringify([]),
      allergens: JSON.stringify(['fish']),
      ingredients: JSON.stringify([
        { ingredient_name: 'Salmon fillet', quantity: 6, unit: 'oz', category: 'protein' },
        { ingredient_name: 'Broccoli', quantity: 2, unit: 'cups', category: 'produce' },
        { ingredient_name: 'Olive oil', quantity: 1, unit: 'tbsp', category: 'pantry' },
        { ingredient_name: 'Lemon', quantity: 0.5, unit: 'whole', category: 'produce' },
        { ingredient_name: 'Garlic', quantity: 2, unit: 'cloves', category: 'produce' }
      ]),
      instructions: JSON.stringify([
        'Preheat oven to 400°F',
        'Place salmon and broccoli on baking sheet',
        'Drizzle with olive oil, add minced garlic',
        'Season with salt, pepper, and lemon juice',
        'Bake for 18-20 minutes until salmon flakes easily'
      ])
    },
    {
      recipe_id: uuidv4(),
      recipe_name: 'Chicken Stir-Fry',
      meal_type: 'dinner',
      description: 'Quick and healthy Asian-inspired dish',
      prep_time_min: 15,
      cook_time_min: 15,
      servings: 1,
      difficulty: 'intermediate',
      calories_per_serving: 480,
      protein_g: 45,
      carbs_g: 38,
      fats_g: 16,
      fiber_g: 6,
      is_meal_prep_friendly: 1,
      dietary_labels: JSON.stringify([]),
      allergens: JSON.stringify(['soy']),
      ingredients: JSON.stringify([
        { ingredient_name: 'Chicken breast', quantity: 6, unit: 'oz', category: 'protein' },
        { ingredient_name: 'Mixed vegetables', quantity: 2, unit: 'cups', category: 'produce' },
        { ingredient_name: 'Brown rice', quantity: 0.5, unit: 'cup', category: 'grains' },
        { ingredient_name: 'Soy sauce', quantity: 2, unit: 'tbsp', category: 'pantry' },
        { ingredient_name: 'Sesame oil', quantity: 1, unit: 'tsp', category: 'pantry' },
        { ingredient_name: 'Ginger', quantity: 1, unit: 'tsp', category: 'produce' }
      ]),
      instructions: JSON.stringify([
        'Cook brown rice according to package directions',
        'Cut chicken into bite-sized pieces',
        'Heat sesame oil in wok or large pan',
        'Stir-fry chicken for 5-6 minutes',
        'Add vegetables and ginger, cook 4-5 minutes',
        'Add soy sauce, toss to coat',
        'Serve over brown rice'
      ])
    },
    {
      recipe_id: uuidv4(),
      recipe_name: 'Turkey Meatballs with Zoodles',
      meal_type: 'dinner',
      description: 'Low-carb alternative to pasta with meatballs',
      prep_time_min: 20,
      cook_time_min: 25,
      servings: 1,
      difficulty: 'intermediate',
      calories_per_serving: 390,
      protein_g: 42,
      carbs_g: 18,
      fats_g: 16,
      fiber_g: 5,
      is_meal_prep_friendly: 1,
      dietary_labels: JSON.stringify([]),
      allergens: JSON.stringify(['eggs']),
      ingredients: JSON.stringify([
        { ingredient_name: 'Ground turkey', quantity: 6, unit: 'oz', category: 'protein' },
        { ingredient_name: 'Zucchini', quantity: 2, unit: 'medium', category: 'produce' },
        { ingredient_name: 'Marinara sauce', quantity: 0.5, unit: 'cup', category: 'pantry' },
        { ingredient_name: 'Egg', quantity: 1, unit: 'whole', category: 'protein' },
        { ingredient_name: 'Breadcrumbs', quantity: 2, unit: 'tbsp', category: 'pantry' },
        { ingredient_name: 'Parmesan cheese', quantity: 2, unit: 'tbsp', category: 'dairy' }
      ]),
      instructions: JSON.stringify([
        'Mix turkey, egg, breadcrumbs, and half the parmesan',
        'Form into 6-8 meatballs',
        'Bake at 375°F for 20-25 minutes',
        'Spiralize zucchini into noodles',
        'Heat marinara sauce',
        'Sauté zoodles for 2-3 minutes',
        'Top zoodles with meatballs, sauce, and remaining parmesan'
      ])
    },

    // Snack recipes
    {
      recipe_id: uuidv4(),
      recipe_name: 'Protein Smoothie',
      meal_type: 'snack',
      description: 'Quick post-workout protein shake',
      prep_time_min: 5,
      cook_time_min: 0,
      servings: 1,
      difficulty: 'beginner',
      calories_per_serving: 280,
      protein_g: 30,
      carbs_g: 32,
      fats_g: 4,
      fiber_g: 4,
      is_meal_prep_friendly: 0,
      dietary_labels: JSON.stringify(['vegetarian']),
      allergens: JSON.stringify(['dairy']),
      ingredients: JSON.stringify([
        { ingredient_name: 'Protein powder', quantity: 1, unit: 'scoop', category: 'protein' },
        { ingredient_name: 'Banana', quantity: 1, unit: 'whole', category: 'produce' },
        { ingredient_name: 'Almond milk', quantity: 1, unit: 'cup', category: 'dairy' },
        { ingredient_name: 'Spinach', quantity: 1, unit: 'cup', category: 'produce' },
        { ingredient_name: 'Ice', quantity: 0.5, unit: 'cup', category: 'other' }
      ]),
      instructions: JSON.stringify([
        'Add all ingredients to blender',
        'Blend until smooth',
        'Enjoy immediately'
      ])
    },
    {
      recipe_id: uuidv4(),
      recipe_name: 'Apple with Almond Butter',
      meal_type: 'snack',
      description: 'Simple and satisfying snack',
      prep_time_min: 2,
      cook_time_min: 0,
      servings: 1,
      difficulty: 'beginner',
      calories_per_serving: 220,
      protein_g: 6,
      carbs_g: 28,
      fats_g: 10,
      fiber_g: 5,
      is_meal_prep_friendly: 0,
      dietary_labels: JSON.stringify(['vegan', 'vegetarian']),
      allergens: JSON.stringify(['nuts']),
      ingredients: JSON.stringify([
        { ingredient_name: 'Apple', quantity: 1, unit: 'medium', category: 'produce' },
        { ingredient_name: 'Almond butter', quantity: 2, unit: 'tbsp', category: 'pantry' }
      ]),
      instructions: JSON.stringify([
        'Slice apple into wedges',
        'Serve with almond butter for dipping'
      ])
    },
    {
      recipe_id: uuidv4(),
      recipe_name: 'Hard Boiled Eggs',
      meal_type: 'snack',
      description: 'Perfect protein snack',
      prep_time_min: 2,
      cook_time_min: 12,
      servings: 1,
      difficulty: 'beginner',
      calories_per_serving: 140,
      protein_g: 12,
      carbs_g: 2,
      fats_g: 10,
      fiber_g: 0,
      is_meal_prep_friendly: 1,
      dietary_labels: JSON.stringify(['vegetarian']),
      allergens: JSON.stringify(['eggs']),
      ingredients: JSON.stringify([
        { ingredient_name: 'Eggs', quantity: 2, unit: 'whole', category: 'protein' }
      ]),
      instructions: JSON.stringify([
        'Place eggs in pot, cover with cold water',
        'Bring to boil',
        'Remove from heat, cover, let sit 10-12 minutes',
        'Transfer to ice bath',
        'Peel and enjoy'
      ])
    }
  ];

  for (const recipe of recipes) {
    await runQuery(
      `INSERT INTO recipes (
        recipe_id, recipe_name, meal_type, description, prep_time_min, cook_time_min,
        servings, difficulty, calories_per_serving, protein_g, carbs_g, fats_g, fiber_g,
        is_meal_prep_friendly, dietary_labels, allergens, ingredients, instructions
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        recipe.recipe_id, recipe.recipe_name, recipe.meal_type, recipe.description,
        recipe.prep_time_min, recipe.cook_time_min, recipe.servings, recipe.difficulty,
        recipe.calories_per_serving, recipe.protein_g, recipe.carbs_g, recipe.fats_g,
        recipe.fiber_g, recipe.is_meal_prep_friendly, recipe.dietary_labels,
        recipe.allergens, recipe.ingredients, recipe.instructions
      ]
    );
  }

  console.log(`✅ Added ${recipes.length} recipes`);
}

async function seedAchievements() {
  console.log('Adding achievements...');

  const achievements = [
    {
      achievement_id: uuidv4(),
      achievement_name: 'First Workout',
      achievement_description: 'Complete your first workout',
      criteria_type: 'workout_count',
      criteria_value: 1
    },
    {
      achievement_id: uuidv4(),
      achievement_name: '10 Workouts Strong',
      achievement_description: 'Complete 10 workouts',
      criteria_type: 'workout_count',
      criteria_value: 10
    },
    {
      achievement_id: uuidv4(),
      achievement_name: 'Week Warrior',
      achievement_description: 'Log 7 consecutive days of activity',
      criteria_type: 'streak',
      criteria_value: 7
    },
    {
      achievement_id: uuidv4(),
      achievement_name: '5 Pounds Down',
      achievement_description: 'Lose 5 pounds',
      criteria_type: 'weight_lost',
      criteria_value: 5
    },
    {
      achievement_id: uuidv4(),
      achievement_name: 'Community Builder',
      achievement_description: 'Join an accountability group',
      criteria_type: 'social',
      criteria_value: 1
    },
    {
      achievement_id: uuidv4(),
      achievement_name: 'First Post',
      achievement_description: 'Share your first post with the community',
      criteria_type: 'social',
      criteria_value: 1
    }
  ];

  for (const achievement of achievements) {
    await runQuery(
      `INSERT INTO achievements (achievement_id, achievement_name, achievement_description, criteria_type, criteria_value)
       VALUES (?, ?, ?, ?, ?)`,
      [achievement.achievement_id, achievement.achievement_name, achievement.achievement_description, achievement.criteria_type, achievement.criteria_value]
    );
  }

  console.log(`✅ Added ${achievements.length} achievements`);
}

// Run seed if called directly
if (require.main === module) {
  seed();
}

module.exports = { seed };
