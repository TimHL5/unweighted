import { prisma } from './prisma';

interface SurveyData {
  fitnessLevel: string;
  primaryGoal: string;
  equipmentAccess: string;
  workoutDurationPref: string;
  workoutsPerWeek: number;
  workoutTypes: string[];
  age: number;
  currentWeight: number;
  goalWeight: number;
}

interface Exercise {
  name: string;
  sets: number;
  reps?: string;
  duration?: string;
  rest: string;
  formTip: string;
  alternative: string;
  muscleGroups: string[];
}

interface Workout {
  day: number;
  type: string;
  name: string;
  exercises: Exercise[];
  totalDuration: number;
}

interface WorkoutPlan {
  planName: string;
  description: string;
  durationWeeks: number;
  workoutsPerWeek: number;
  difficulty: string;
  estimatedCalories: number;
  weeklySchedule: {
    week1: Workout[];
    week2: Workout[];
    week3: Workout[];
    week4: Workout[];
  };
}

export async function generateWorkoutPlan(surveyData: SurveyData): Promise<WorkoutPlan> {
  const {
    fitnessLevel,
    primaryGoal,
    equipmentAccess,
    workoutDurationPref,
    workoutsPerWeek,
    workoutTypes
  } = surveyData;

  // Determine workout split based on frequency
  const split = determineSplit(workoutsPerWeek, workoutTypes);

  // Determine sets/reps scheme based on goal
  const setsRepsScheme = determineSetsReps(primaryGoal, fitnessLevel);

  // Get exercises from database filtered by equipment
  const exercises = await prisma.exercise.findMany({
    where: {
      difficulty: {
        in: fitnessLevel === 'beginner' ? ['beginner']
          : fitnessLevel === 'intermediate' ? ['beginner', 'intermediate']
          : ['beginner', 'intermediate', 'advanced']
      },
      equipment: {
        hasSome: getEquipmentList(equipmentAccess)
      }
    }
  });

  // Build 4-week progressive plan
  const weeklySchedule = {
    week1: [] as Workout[],
    week2: [] as Workout[],
    week3: [] as Workout[],
    week4: [] as Workout[]
  };

  for (let week = 1; week <= 4; week++) {
    const weekKey = `week${week}` as keyof typeof weeklySchedule;

    for (let day = 0; day < workoutsPerWeek; day++) {
      const workoutType = split[day % split.length];
      const workout = createWorkout(
        day + 1,
        workoutType,
        exercises,
        setsRepsScheme,
        fitnessLevel,
        week,
        workoutDurationPref
      );

      weeklySchedule[weekKey].push(workout);
    }
  }

  // Calculate estimated calories burned
  const estimatedCalories = calculateCalories(
    workoutsPerWeek,
    workoutDurationPref,
    fitnessLevel,
    surveyData.currentWeight
  );

  return {
    planName: generatePlanName(fitnessLevel, primaryGoal),
    description: generateDescription(surveyData),
    durationWeeks: 4,
    workoutsPerWeek,
    difficulty: fitnessLevel,
    estimatedCalories,
    weeklySchedule
  };
}

function determineSplit(workoutsPerWeek: number, workoutTypes: string[]): string[] {
  if (workoutsPerWeek <= 3) {
    return ['full_body', 'full_body', 'full_body'];
  } else if (workoutsPerWeek === 4) {
    return ['upper_body', 'lower_body', 'upper_body', 'lower_body'];
  } else if (workoutsPerWeek === 5) {
    return ['upper_body', 'lower_body', 'upper_body', 'lower_body', 'full_body'];
  } else {
    return ['push', 'pull', 'legs', 'push', 'pull', 'legs'];
  }
}

function determineSetsReps(goal: string, fitnessLevel: string): any {
  const schemes = {
    lose_weight: { sets: 3, reps: '12-15', rest: '45s' },
    build_muscle: { sets: 4, reps: '8-12', rest: '90s' },
    improve_fitness: { sets: 3, reps: '10-12', rest: '60s' },
    increase_energy: { sets: 3, reps: '10-15', rest: '60s' }
  };

  // Adjust for beginners
  if (fitnessLevel === 'beginner') {
    return { ...schemes[goal as keyof typeof schemes] || schemes.improve_fitness, sets: 2 };
  }

  return schemes[goal as keyof typeof schemes] || schemes.improve_fitness;
}

function getEquipmentList(access: string): string[] {
  const equipment = {
    full_gym: ['barbell', 'dumbbell', 'machine', 'cable', 'bodyweight'],
    home_gym: ['dumbbell', 'resistance_band', 'bodyweight'],
    bodyweight_only: ['bodyweight'],
    minimal_equipment: ['dumbbell', 'resistance_band', 'bodyweight']
  };

  return equipment[access as keyof typeof equipment] || equipment.bodyweight_only;
}

function createWorkout(
  day: number,
  type: string,
  allExercises: any[],
  scheme: any,
  fitnessLevel: string,
  week: number,
  durationPref: string
): Workout {
  // Filter exercises by workout type
  const filtered = filterExercisesByType(allExercises, type);

  // Select exercises (5-7 depending on duration and fitness level)
  const exerciseCount = durationPref === '15-30' ? 4 : durationPref === '60+' ? 7 : 5;
  const selected = selectExercises(filtered, exerciseCount, type);

  // Apply progressive overload
  const multiplier = week === 1 ? 1 : week === 2 ? 1 : week === 3 ? 1.1 : 1.15;

  const exercises: Exercise[] = selected.map(ex => ({
    name: ex.name,
    sets: Math.ceil(scheme.sets * (week >= 3 ? 1.2 : 1)),
    reps: adjustReps(scheme.reps, multiplier),
    rest: scheme.rest,
    formTip: ex.formTips,
    alternative: ex.alternatives[0] || 'Modify as needed',
    muscleGroups: ex.muscleGroups
  }));

  const totalDuration = calculateWorkoutDuration(exercises, scheme);

  return {
    day,
    type: type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
    name: `${type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} Workout`,
    exercises,
    totalDuration
  };
}

function filterExercisesByType(exercises: any[], type: string): any[] {
  const categoryMap: Record<string, string[]> = {
    upper_body: ['upper_body', 'push', 'pull'],
    lower_body: ['lower_body', 'legs'],
    full_body: ['upper_body', 'lower_body', 'full_body', 'core'],
    push: ['upper_body', 'push'],
    pull: ['upper_body', 'pull'],
    legs: ['lower_body', 'legs']
  };

  const categories = categoryMap[type] || ['full_body'];

  return exercises.filter(ex =>
    categories.some(cat => ex.category === cat || ex.muscleGroups.includes(cat))
  );
}

function selectExercises(exercises: any[], count: number, type: string): any[] {
  // Ensure variety - don't repeat same muscle groups
  const selected: any[] = [];
  const usedMuscles = new Set<string>();

  // Shuffle exercises
  const shuffled = [...exercises].sort(() => Math.random() - 0.5);

  for (const ex of shuffled) {
    if (selected.length >= count) break;

    // Check if this exercise targets new muscle groups
    const hasNewMuscle = ex.muscleGroups.some((m: string) => !usedMuscles.has(m));

    if (hasNewMuscle || selected.length < 2) {
      selected.push(ex);
      ex.muscleGroups.forEach((m: string) => usedMuscles.add(m));
    }
  }

  // If we don't have enough, just add more
  while (selected.length < count && selected.length < shuffled.length) {
    const remaining = shuffled.filter(ex => !selected.includes(ex));
    if (remaining.length > 0) {
      selected.push(remaining[0]);
    } else {
      break;
    }
  }

  return selected.slice(0, count);
}

function adjustReps(reps: string, multiplier: number): string {
  if (reps.includes('-')) {
    const [min, max] = reps.split('-').map(Number);
    return `${Math.ceil(min * multiplier)}-${Math.ceil(max * multiplier)}`;
  }
  return reps;
}

function calculateWorkoutDuration(exercises: Exercise[], scheme: any): number {
  // Rough calculation: sets * (30s exercise + rest time)
  const restSeconds = parseInt(scheme.rest) || 60;
  const totalSets = exercises.reduce((sum, ex) => sum + ex.sets, 0);
  const minutes = Math.ceil((totalSets * (30 + restSeconds)) / 60);
  return minutes;
}

function calculateCalories(
  workoutsPerWeek: number,
  duration: string,
  fitnessLevel: string,
  weight: number
): number {
  // Rough calculation: calories per minute based on intensity
  const durationMap = {
    '15-30': 22,
    '30-45': 37,
    '45-60': 52,
    '60+': 70
  };

  const intensityMultiplier = {
    beginner: 0.8,
    intermediate: 1.0,
    advanced: 1.2
  };

  const minutesPerWorkout = durationMap[duration as keyof typeof durationMap] || 40;
  const caloriesPerMinute = 5 * (weight / 150); // Rough MET calculation
  const intensity = intensityMultiplier[fitnessLevel as keyof typeof intensityMultiplier] || 1;

  return Math.round(workoutsPerWeek * minutesPerWorkout * caloriesPerMinute * intensity);
}

function generatePlanName(fitnessLevel: string, goal: string): string {
  const levelNames = {
    beginner: 'Beginner',
    intermediate: 'Intermediate',
    advanced: 'Advanced'
  };

  const goalNames = {
    lose_weight: 'Fat Loss & Conditioning',
    build_muscle: 'Muscle Building',
    improve_fitness: 'General Fitness',
    increase_energy: 'Energy & Vitality'
  };

  return `${levelNames[fitnessLevel as keyof typeof levelNames]} ${goalNames[goal as keyof typeof goalNames]}`;
}

function generateDescription(surveyData: SurveyData): string {
  const { fitnessLevel, primaryGoal, workoutsPerWeek, equipmentAccess } = surveyData;

  const equipment = {
    full_gym: 'with full gym access',
    home_gym: 'with home gym equipment',
    bodyweight_only: 'using bodyweight only',
    minimal_equipment: 'with minimal equipment'
  }[equipmentAccess] || 'with available equipment';

  return `A personalized 4-week ${fitnessLevel} program designed for ${primaryGoal.replace('_', ' ')}. ` +
    `This plan includes ${workoutsPerWeek} workouts per week ${equipment}, ` +
    `with progressive overload to ensure continuous improvement. ` +
    `Each workout is structured to maximize results while fitting your schedule and fitness level.`;
}
