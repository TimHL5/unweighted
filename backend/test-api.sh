#!/bin/bash

TOKEN=$(cat /tmp/token.txt)

echo "=== Testing Onboarding ==="
curl -s -X POST http://localhost:3000/api/v1/onboarding/profile \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  --data-binary '{"current_weight":210,"goal_weight":180,"height":72,"fitness_level":"beginner","primary_goal":"lose_weight","target_timeline":"6_months","workout_types":["strength","cardio"],"equipment_access":"home_gym","workout_duration_pref":"30-45","dietary_restrictions":[],"meals_per_day":"3","cooking_skill":"intermediate","meal_prep_time":"30-60","wake_time":"6-8","bed_time":"10-12","preferred_workout_time":"morning","work_schedule":"9-5","attempts_count":"3-5","past_barriers":["lack_of_motivation"]}' \
  | jq '.message'

echo ""
echo "=== Testing Workout Generation ==="
curl -s -X POST http://localhost:3000/api/v1/workouts/generate \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  | jq '.message, .plan.plan_name, (.schedule | length)'

echo ""
echo "=== Testing Meal Generation ==="
curl -s -X POST http://localhost:3000/api/v1/meals/generate \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  --data-binary '{"duration":7}' \
  | jq '.message, .plan.plan_name, .plan.daily_calorie_target'

echo ""
echo "=== Testing Progress Dashboard ==="
curl -s http://localhost:3000/api/v1/progress/dashboard \
  -H "Authorization: Bearer $TOKEN" \
  | jq '.workouts, .meals'

echo ""
echo "✅ All tests completed!"
