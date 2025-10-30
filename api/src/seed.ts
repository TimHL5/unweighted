import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const exercises = [
  // UPPER BODY - BEGINNER
  {
    name: 'Push-ups',
    muscleGroups: ['chest', 'triceps', 'shoulders'],
    secondaryMuscles: ['core'],
    equipment: ['bodyweight'],
    difficulty: 'beginner',
    description: 'Classic bodyweight exercise for upper body strength',
    formTips: 'Keep core tight, elbows at 45 degrees, lower until chest nearly touches ground. Full range of motion.',
    alternatives: ['Knee push-ups', 'Incline push-ups', 'Wall push-ups'],
    category: 'upper_body'
  },
  {
    name: 'Dumbbell Rows',
    muscleGroups: ['back', 'lats'],
    secondaryMuscles: ['biceps', 'rear_delts'],
    equipment: ['dumbbell'],
    difficulty: 'beginner',
    description: 'Build back strength and improve posture',
    formTips: 'Pull elbow back, squeeze shoulder blade, keep back straight. Row to hip level.',
    alternatives: ['Resistance band rows', 'Bent-over rows', 'Superman holds'],
    category: 'upper_body'
  },
  {
    name: 'Shoulder Press',
    muscleGroups: ['shoulders', 'delts'],
    secondaryMuscles: ['triceps', 'upper_chest'],
    equipment: ['dumbbell'],
    difficulty: 'beginner',
    description: 'Build strong, defined shoulders',
    formTips: 'Press straight overhead, keep core tight, don\'t arch back. Control the descent.',
    alternatives: ['Pike push-ups', 'Resistance band press', 'Arnold press'],
    category: 'upper_body'
  },

  // UPPER BODY - INTERMEDIATE
  {
    name: 'Bench Press',
    muscleGroups: ['chest', 'pecs'],
    secondaryMuscles: ['triceps', 'shoulders'],
    equipment: ['barbell', 'dumbbell'],
    difficulty: 'intermediate',
    description: 'Classic chest builder',
    formTips: 'Lower bar to chest, press explosively, keep feet planted. Arch back slightly.',
    alternatives: ['Dumbbell press', 'Floor press', 'Machine chest press'],
    category: 'upper_body'
  },
  {
    name: 'Pull-ups',
    muscleGroups: ['back', 'lats'],
    secondaryMuscles: ['biceps', 'forearms'],
    equipment: ['bodyweight', 'machine'],
    difficulty: 'intermediate',
    description: 'Ultimate back strength exercise',
    formTips: 'Full hang, pull until chin over bar, control descent. Engage lats.',
    alternatives: ['Assisted pull-ups', 'Lat pulldowns', 'Inverted rows'],
    category: 'upper_body'
  },
  {
    name: 'Dips',
    muscleGroups: ['triceps', 'chest'],
    secondaryMuscles: ['shoulders'],
    equipment: ['bodyweight', 'machine'],
    difficulty: 'intermediate',
    description: 'Build tricep and chest strength',
    formTips: 'Lean forward for chest, upright for triceps. Lower until 90 degrees.',
    alternatives: ['Bench dips', 'Close-grip push-ups', 'Tricep extensions'],
    category: 'upper_body'
  },

  // LOWER BODY - BEGINNER
  {
    name: 'Bodyweight Squats',
    muscleGroups: ['quads', 'glutes'],
    secondaryMuscles: ['hamstrings', 'core'],
    equipment: ['bodyweight'],
    difficulty: 'beginner',
    description: 'Foundation of lower body strength',
    formTips: 'Keep chest up, knees track over toes, sit back into hips. Go to parallel.',
    alternatives: ['Box squats', 'Wall squats', 'Chair squats'],
    category: 'lower_body'
  },
  {
    name: 'Lunges',
    muscleGroups: ['quads', 'glutes'],
    secondaryMuscles: ['hamstrings', 'calves'],
    equipment: ['bodyweight', 'dumbbell'],
    difficulty: 'beginner',
    description: 'Build leg strength and balance',
    formTips: 'Step forward, lower until front thigh parallel. Keep knee over ankle.',
    alternatives: ['Reverse lunges', 'Walking lunges', 'Split squats'],
    category: 'lower_body'
  },
  {
    name: 'Glute Bridges',
    muscleGroups: ['glutes', 'hamstrings'],
    secondaryMuscles: ['core', 'lower_back'],
    equipment: ['bodyweight'],
    difficulty: 'beginner',
    description: 'Target glutes and improve hip strength',
    formTips: 'Squeeze glutes at top, hold 2 seconds. Press through heels.',
    alternatives: ['Single-leg bridges', 'Hip thrusts', 'Donkey kicks'],
    category: 'lower_body'
  },

  // LOWER BODY - INTERMEDIATE
  {
    name: 'Goblet Squats',
    muscleGroups: ['quads', 'glutes'],
    secondaryMuscles: ['core', 'upper_back'],
    equipment: ['dumbbell'],
    difficulty: 'intermediate',
    description: 'Loaded squat variation for strength',
    formTips: 'Hold weight at chest, squat deep, keep torso upright. Elbows inside knees.',
    alternatives: ['Dumbbell front squats', 'Barbell squats', 'Zercher squats'],
    category: 'lower_body'
  },
  {
    name: 'Romanian Deadlifts',
    muscleGroups: ['hamstrings', 'glutes'],
    secondaryMuscles: ['lower_back', 'forearms'],
    equipment: ['dumbbell', 'barbell'],
    difficulty: 'intermediate',
    description: 'Target hamstrings and posterior chain',
    formTips: 'Hinge at hips, keep back straight, lower until stretch in hamstrings.',
    alternatives: ['Single-leg RDLs', 'Good mornings', 'Leg curls'],
    category: 'lower_body'
  },
  {
    name: 'Bulgarian Split Squats',
    muscleGroups: ['quads', 'glutes'],
    secondaryMuscles: ['hamstrings', 'core'],
    equipment: ['dumbbell', 'bodyweight'],
    difficulty: 'intermediate',
    description: 'Unilateral leg strength builder',
    formTips: 'Rear foot elevated, lower until front thigh parallel. Keep torso upright.',
    alternatives: ['Reverse lunges', 'Step-ups', 'Single-leg squats'],
    category: 'lower_body'
  },

  // CORE - BEGINNER
  {
    name: 'Plank',
    muscleGroups: ['core', 'abs'],
    secondaryMuscles: ['shoulders', 'glutes'],
    equipment: ['bodyweight'],
    difficulty: 'beginner',
    description: 'Build core stability and strength',
    formTips: 'Body in straight line, engage core, don\'t let hips sag. Breathe steadily.',
    alternatives: ['Knee plank', 'Forearm plank', 'Side plank'],
    category: 'core'
  },
  {
    name: 'Dead Bug',
    muscleGroups: ['core', 'abs'],
    secondaryMuscles: ['hip_flexors'],
    equipment: ['bodyweight'],
    difficulty: 'beginner',
    description: 'Core stability and coordination',
    formTips: 'Press lower back to floor, extend opposite arm and leg. Move slowly.',
    alternatives: ['Bird dogs', 'Toe touches', 'Bicycle crunches'],
    category: 'core'
  },
  {
    name: 'Mountain Climbers',
    muscleGroups: ['core', 'abs'],
    secondaryMuscles: ['shoulders', 'hip_flexors'],
    equipment: ['bodyweight'],
    difficulty: 'beginner',
    description: 'Dynamic core and cardio exercise',
    formTips: 'Keep hips level, drive knees to chest alternating. Maintain plank position.',
    alternatives: ['Slow mountain climbers', 'Running in place', 'High knees'],
    category: 'core'
  },

  // CORE - INTERMEDIATE
  {
    name: 'Russian Twists',
    muscleGroups: ['obliques', 'core'],
    secondaryMuscles: ['abs', 'hip_flexors'],
    equipment: ['bodyweight', 'dumbbell'],
    difficulty: 'intermediate',
    description: 'Target obliques and rotational strength',
    formTips: 'Lean back 45 degrees, rotate torso side to side. Keep feet off ground.',
    alternatives: ['Side plank', 'Bicycle crunches', 'Wood chops'],
    category: 'core'
  },
  {
    name: 'Hanging Leg Raises',
    muscleGroups: ['abs', 'core'],
    secondaryMuscles: ['hip_flexors', 'grip'],
    equipment: ['bodyweight'],
    difficulty: 'intermediate',
    description: 'Advanced ab exercise',
    formTips: 'Hang from bar, raise legs to 90 degrees, control descent. No swinging.',
    alternatives: ['Knee raises', 'Lying leg raises', 'V-ups'],
    category: 'core'
  },

  // FULL BODY - BEGINNER
  {
    name: 'Burpees',
    muscleGroups: ['full_body'],
    secondaryMuscles: ['cardio'],
    equipment: ['bodyweight'],
    difficulty: 'beginner',
    description: 'Total body conditioning exercise',
    formTips: 'Squat, place hands down, jump back, push-up, jump forward, jump up.',
    alternatives: ['Step-back burpees', 'No push-up burpees', 'Burpee to box'],
    category: 'full_body'
  },
  {
    name: 'Jumping Jacks',
    muscleGroups: ['full_body', 'cardio'],
    secondaryMuscles: ['calves', 'shoulders'],
    equipment: ['bodyweight'],
    difficulty: 'beginner',
    description: 'Warm-up and cardio exercise',
    formTips: 'Jump feet out while raising arms overhead. Land softly.',
    alternatives: ['Step jacks', 'Star jumps', 'Seal jacks'],
    category: 'full_body'
  },

  // CARDIO
  {
    name: 'High Knees',
    muscleGroups: ['legs', 'cardio'],
    secondaryMuscles: ['core', 'hip_flexors'],
    equipment: ['bodyweight'],
    difficulty: 'beginner',
    description: 'Cardio and leg conditioning',
    formTips: 'Drive knees to chest height, pump arms, stay on balls of feet.',
    alternatives: ['Marching in place', 'Butt kicks', 'Running'],
    category: 'cardio'
  },
  {
    name: 'Jump Rope',
    muscleGroups: ['calves', 'cardio'],
    secondaryMuscles: ['forearms', 'shoulders'],
    equipment: ['resistance_band'],
    difficulty: 'beginner',
    description: 'Classic cardio and coordination',
    formTips: 'Stay on balls of feet, rotate from wrists, keep jumps low.',
    alternatives: ['Imaginary jump rope', 'Jumping jacks', 'High knees'],
    category: 'cardio'
  },

  // ADDITIONAL EXERCISES FOR VARIETY
  {
    name: 'Face Pulls',
    muscleGroups: ['rear_delts', 'upper_back'],
    secondaryMuscles: ['traps', 'rotator_cuff'],
    equipment: ['cable', 'resistance_band'],
    difficulty: 'beginner',
    description: 'Improve posture and shoulder health',
    formTips: 'Pull to face level, externally rotate shoulders. Squeeze shoulder blades.',
    alternatives: ['Band pull-aparts', 'Reverse flyes', 'YTW raises'],
    category: 'upper_body'
  },
  {
    name: 'Bicep Curls',
    muscleGroups: ['biceps'],
    secondaryMuscles: ['forearms'],
    equipment: ['dumbbell', 'resistance_band'],
    difficulty: 'beginner',
    description: 'Build arm strength',
    formTips: 'Keep elbows stationary, curl to shoulder, control descent.',
    alternatives: ['Hammer curls', 'Cable curls', 'Resistance band curls'],
    category: 'upper_body'
  },
  {
    name: 'Tricep Extensions',
    muscleGroups: ['triceps'],
    secondaryMuscles: ['shoulders'],
    equipment: ['dumbbell', 'cable'],
    difficulty: 'beginner',
    description: 'Target back of arms',
    formTips: 'Keep elbows close to head, extend fully, control movement.',
    alternatives: ['Overhead extensions', 'Kickbacks', 'Close-grip bench'],
    category: 'upper_body'
  },
  {
    name: 'Lateral Raises',
    muscleGroups: ['shoulders', 'lateral_delts'],
    secondaryMuscles: ['traps'],
    equipment: ['dumbbell'],
    difficulty: 'beginner',
    description: 'Build shoulder width',
    formTips: 'Raise arms to shoulder height, slight bend in elbows, control descent.',
    alternatives: ['Cable lateral raises', 'Band lateral raises', 'Upright rows'],
    category: 'upper_body'
  },
  {
    name: 'Calf Raises',
    muscleGroups: ['calves'],
    secondaryMuscles: ['ankles'],
    equipment: ['bodyweight', 'dumbbell'],
    difficulty: 'beginner',
    description: 'Build calf strength',
    formTips: 'Rise onto balls of feet, hold 2 seconds, control descent. Full range.',
    alternatives: ['Single-leg calf raises', 'Seated calf raises', 'Jump rope'],
    category: 'lower_body'
  },
  {
    name: 'Step-ups',
    muscleGroups: ['quads', 'glutes'],
    secondaryMuscles: ['hamstrings', 'calves'],
    equipment: ['bodyweight', 'dumbbell'],
    difficulty: 'beginner',
    description: 'Functional leg exercise',
    formTips: 'Step onto box/bench, drive through front heel, stand fully. Control descent.',
    alternatives: ['Box jumps', 'Lunges', 'Bulgarian split squats'],
    category: 'lower_body'
  },
  {
    name: 'Wall Sits',
    muscleGroups: ['quads'],
    secondaryMuscles: ['glutes', 'calves'],
    equipment: ['bodyweight'],
    difficulty: 'beginner',
    description: 'Isometric leg strength',
    formTips: 'Back against wall, thighs parallel to ground. Hold position, breathe.',
    alternatives: ['Squats', 'Leg press', 'Box squats'],
    category: 'lower_body'
  },
  {
    name: 'Bicycle Crunches',
    muscleGroups: ['abs', 'obliques'],
    secondaryMuscles: ['hip_flexors'],
    equipment: ['bodyweight'],
    difficulty: 'beginner',
    description: 'Target abs and obliques',
    formTips: 'Rotate torso, bring opposite elbow to knee. Keep lower back pressed down.',
    alternatives: ['Russian twists', 'Side crunches', 'Heel touches'],
    category: 'core'
  },
  {
    name: 'Superman',
    muscleGroups: ['lower_back', 'glutes'],
    secondaryMuscles: ['upper_back', 'hamstrings'],
    equipment: ['bodyweight'],
    difficulty: 'beginner',
    description: 'Strengthen posterior chain',
    formTips: 'Lie face down, raise arms and legs simultaneously. Hold 2-3 seconds.',
    alternatives: ['Back extensions', 'Bird dogs', 'Good mornings'],
    category: 'core'
  },
  {
    name: 'Farmer\'s Carry',
    muscleGroups: ['forearms', 'grip', 'traps'],
    secondaryMuscles: ['core', 'legs'],
    equipment: ['dumbbell'],
    difficulty: 'beginner',
    description: 'Build grip and core strength',
    formTips: 'Hold heavy weights, walk with good posture. Keep shoulders back.',
    alternatives: ['Dead hangs', 'Suitcase carry', 'Rack walks'],
    category: 'full_body'
  },

  // ADVANCED EXERCISES
  {
    name: 'Barbell Back Squat',
    muscleGroups: ['quads', 'glutes'],
    secondaryMuscles: ['hamstrings', 'core', 'back'],
    equipment: ['barbell'],
    difficulty: 'advanced',
    description: 'King of leg exercises',
    formTips: 'Bar on upper back, break at hips, squat to depth. Drive through heels.',
    alternatives: ['Front squats', 'Goblet squats', 'Leg press'],
    category: 'lower_body'
  },
  {
    name: 'Barbell Deadlifts',
    muscleGroups: ['hamstrings', 'glutes', 'back'],
    secondaryMuscles: ['traps', 'forearms', 'core'],
    equipment: ['barbell'],
    difficulty: 'advanced',
    description: 'Ultimate strength builder',
    formTips: 'Hinge at hips, keep bar close, drive through floor. Back straight.',
    alternatives: ['RDLs', 'Trap bar deadlifts', 'Kettlebell deadlifts'],
    category: 'full_body'
  },
  {
    name: 'Barbell Overhead Press',
    muscleGroups: ['shoulders', 'delts'],
    secondaryMuscles: ['triceps', 'core'],
    equipment: ['barbell'],
    difficulty: 'advanced',
    description: 'Build shoulder strength and stability',
    formTips: 'Press straight overhead, engage core, no arch. Control descent.',
    alternatives: ['Dumbbell press', 'Arnold press', 'Push press'],
    category: 'upper_body'
  },
  {
    name: 'Weighted Pull-ups',
    muscleGroups: ['back', 'lats'],
    secondaryMuscles: ['biceps', 'forearms'],
    equipment: ['bodyweight'],
    difficulty: 'advanced',
    description: 'Advanced back strength',
    formTips: 'Add weight with belt, full range of motion. Control throughout.',
    alternatives: ['Regular pull-ups', 'Weighted chin-ups', 'Lat pulldowns'],
    category: 'upper_body'
  },
  {
    name: 'Pistol Squats',
    muscleGroups: ['quads', 'glutes'],
    secondaryMuscles: ['hamstrings', 'core', 'balance'],
    equipment: ['bodyweight'],
    difficulty: 'advanced',
    description: 'Single-leg strength and balance',
    formTips: 'Squat on one leg, other leg extended forward. Control throughout.',
    alternatives: ['Assisted pistols', 'Bulgarian split squats', 'Single-leg press'],
    category: 'lower_body'
  },
  {
    name: 'Muscle-ups',
    muscleGroups: ['back', 'chest', 'triceps'],
    secondaryMuscles: ['core', 'shoulders'],
    equipment: ['bodyweight'],
    difficulty: 'advanced',
    description: 'Advanced calisthenics movement',
    formTips: 'Pull-up explosively, transition over bar, press to lockout.',
    alternatives: ['Pull-ups + dips', 'Jumping muscle-ups', 'Band-assisted'],
    category: 'upper_body'
  },
  {
    name: 'Handstand Push-ups',
    muscleGroups: ['shoulders', 'triceps'],
    secondaryMuscles: ['core', 'upper_chest'],
    equipment: ['bodyweight'],
    difficulty: 'advanced',
    description: 'Ultimate shoulder strength',
    formTips: 'Handstand against wall, lower until head touches, press back up.',
    alternatives: ['Pike push-ups', 'Decline push-ups', 'Overhead press'],
    category: 'upper_body'
  },
  {
    name: 'Dragon Flags',
    muscleGroups: ['abs', 'core'],
    secondaryMuscles: ['hip_flexors', 'upper_body'],
    equipment: ['bodyweight'],
    difficulty: 'advanced',
    description: 'Advanced core exercise',
    formTips: 'Hold bench, raise body straight, lower with control. Keep rigid.',
    alternatives: ['Hanging leg raises', 'Toes to bar', 'Ab wheel rollouts'],
    category: 'core'
  },
  {
    name: 'Box Jumps',
    muscleGroups: ['quads', 'glutes', 'calves'],
    secondaryMuscles: ['hamstrings', 'power'],
    equipment: ['bodyweight'],
    difficulty: 'intermediate',
    description: 'Explosive leg power',
    formTips: 'Jump onto box, land softly with bent knees. Step down carefully.',
    alternatives: ['Step-ups', 'Jump squats', 'Broad jumps'],
    category: 'full_body'
  },
  {
    name: 'Battle Ropes',
    muscleGroups: ['shoulders', 'arms', 'cardio'],
    secondaryMuscles: ['core', 'back'],
    equipment: ['cable'],
    difficulty: 'intermediate',
    description: 'High-intensity cardio and upper body',
    formTips: 'Create waves with ropes, keep core engaged. Various patterns.',
    alternatives: ['Burpees', 'Mountain climbers', 'Jumping jacks'],
    category: 'full_body'
  },
  {
    name: 'Kettlebell Swings',
    muscleGroups: ['glutes', 'hamstrings'],
    secondaryMuscles: ['back', 'shoulders', 'core'],
    equipment: ['dumbbell'],
    difficulty: 'intermediate',
    description: 'Explosive posterior chain',
    formTips: 'Hip hinge, swing to shoulder height, power from hips not arms.',
    alternatives: ['Romanian deadlifts', 'Cable pull-throughs', 'Good mornings'],
    category: 'full_body'
  },
  {
    name: 'Turkish Get-ups',
    muscleGroups: ['shoulders', 'core'],
    secondaryMuscles: ['legs', 'stability'],
    equipment: ['dumbbell'],
    difficulty: 'advanced',
    description: 'Total body coordination and strength',
    formTips: 'Complex movement - go slow, keep weight overhead. Practice form.',
    alternatives: ['Overhead press', 'Planks', 'Carries'],
    category: 'full_body'
  },
  {
    name: 'Reverse Lunges',
    muscleGroups: ['quads', 'glutes'],
    secondaryMuscles: ['hamstrings', 'core'],
    equipment: ['bodyweight', 'dumbbell'],
    difficulty: 'beginner',
    description: 'Knee-friendly lunge variation',
    formTips: 'Step backward, lower until front thigh parallel. Press through front heel.',
    alternatives: ['Forward lunges', 'Walking lunges', 'Split squats'],
    category: 'lower_body'
  },
  {
    name: 'Cable Chest Flyes',
    muscleGroups: ['chest', 'pecs'],
    secondaryMuscles: ['front_delts'],
    equipment: ['cable'],
    difficulty: 'intermediate',
    description: 'Isolate chest muscles',
    formTips: 'Slight bend in elbows, bring hands together in front. Control stretch.',
    alternatives: ['Dumbbell flyes', 'Machine flyes', 'Push-ups'],
    category: 'upper_body'
  },
  {
    name: 'Incline Dumbbell Press',
    muscleGroups: ['upper_chest', 'shoulders'],
    secondaryMuscles: ['triceps'],
    equipment: ['dumbbell'],
    difficulty: 'intermediate',
    description: 'Target upper chest',
    formTips: 'Bench at 30-45 degrees, press dumbbells up and together.',
    alternatives: ['Incline barbell press', 'Decline push-ups', 'Cable press'],
    category: 'upper_body'
  },
  {
    name: 'Leg Press',
    muscleGroups: ['quads', 'glutes'],
    secondaryMuscles: ['hamstrings', 'calves'],
    equipment: ['machine'],
    difficulty: 'beginner',
    description: 'Build leg strength safely',
    formTips: 'Feet shoulder-width, push through heels. Don\'t lock knees.',
    alternatives: ['Squats', 'Hack squats', 'Front squats'],
    category: 'lower_body'
  },
  {
    name: 'Lat Pulldowns',
    muscleGroups: ['lats', 'back'],
    secondaryMuscles: ['biceps', 'rear_delts'],
    equipment: ['cable', 'machine'],
    difficulty: 'beginner',
    description: 'Build back width',
    formTips: 'Pull bar to upper chest, squeeze shoulder blades. Control ascent.',
    alternatives: ['Pull-ups', 'Assisted pull-ups', 'Dumbbell rows'],
    category: 'upper_body'
  },
  {
    name: 'Seated Cable Rows',
    muscleGroups: ['mid_back', 'lats'],
    secondaryMuscles: ['biceps', 'rear_delts'],
    equipment: ['cable', 'machine'],
    difficulty: 'beginner',
    description: 'Build back thickness',
    formTips: 'Pull to torso, squeeze shoulder blades. Keep torso upright.',
    alternatives: ['Dumbbell rows', 'Barbell rows', 'Inverted rows'],
    category: 'upper_body'
  },
  {
    name: 'Leg Curls',
    muscleGroups: ['hamstrings'],
    secondaryMuscles: ['calves'],
    equipment: ['machine'],
    difficulty: 'beginner',
    description: 'Isolate hamstrings',
    formTips: 'Curl heels toward glutes, control extension. Don\'t swing.',
    alternatives: ['Romanian deadlifts', 'Nordic curls', 'Glute-ham raises'],
    category: 'lower_body'
  },
  {
    name: 'Leg Extensions',
    muscleGroups: ['quads'],
    secondaryMuscles: ['knees'],
    equipment: ['machine'],
    difficulty: 'beginner',
    description: 'Isolate quadriceps',
    formTips: 'Extend legs fully, control descent. Don\'t use momentum.',
    alternatives: ['Squats', 'Lunges', 'Step-ups'],
    category: 'lower_body'
  }
];

async function main() {
  console.log('🌱 Seeding exercise database...');

  // Clear existing exercises
  await prisma.exercise.deleteMany({});
  console.log('Cleared existing exercises');

  // Create all exercises
  let count = 0;
  for (const exercise of exercises) {
    await prisma.exercise.create({
      data: exercise
    });
    count++;
  }

  console.log(`✅ Successfully seeded ${count} exercises`);
  console.log('\nExercise breakdown:');

  const categories = await prisma.exercise.groupBy({
    by: ['category'],
    _count: { category: true }
  });

  categories.forEach(cat => {
    console.log(`  ${cat.category}: ${cat._count.category} exercises`);
  });

  const difficulties = await prisma.exercise.groupBy({
    by: ['difficulty'],
    _count: { difficulty: true }
  });

  console.log('\nDifficulty levels:');
  difficulties.forEach(diff => {
    console.log(`  ${diff.difficulty}: ${diff._count.difficulty} exercises`);
  });
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
