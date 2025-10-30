import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { generateWorkoutPlan } from '../lib/workoutGenerator';

const router = Router();

const surveySchema = z.object({
  age: z.number().min(18).max(80),
  gender: z.enum(['male', 'female', 'non-binary', 'prefer-not-to-say']),
  currentWeight: z.number().positive(),
  goalWeight: z.number().positive(),
  height: z.number().positive(),
  weightUnit: z.enum(['lbs', 'kg']).default('lbs'),
  heightUnit: z.enum(['inches', 'cm']).default('inches'),
  fitnessLevel: z.enum(['beginner', 'intermediate', 'advanced']),
  primaryGoal: z.enum(['lose_weight', 'build_muscle', 'improve_fitness', 'increase_energy']),
  targetTimeline: z.enum(['1_month', '3_months', '6_months', '1_year']),
  attemptsCount: z.enum(['first_time', '2_times', '3-5_times', '5+_times']),
  pastBarriers: z.array(z.string()),
  workoutTypes: z.array(z.string()),
  equipmentAccess: z.enum(['full_gym', 'home_gym', 'bodyweight_only', 'minimal_equipment']),
  workoutDurationPref: z.enum(['15-30', '30-45', '45-60', '60+']),
  workoutsPerWeek: z.number().min(2).max(6),
  wakeTime: z.string(),
  bedTime: z.string(),
  preferredWorkoutTime: z.enum(['morning', 'afternoon', 'evening', 'flexible']),
  workSchedule: z.string(),
  email: z.string().email()
});

router.post('/submit', async (req, res, next) => {
  try {
    // Validate input
    const data = surveySchema.parse(req.body);

    // Save survey response
    const surveyResponse = await prisma.surveyResponse.create({
      data
    });

    // Generate workout plan
    const planData = await generateWorkoutPlan(data);

    // Save workout plan
    const workoutPlan = await prisma.workoutPlan.create({
      data: {
        ...planData,
        surveyResponseId: surveyResponse.id,
        weeklySchedule: planData.weeklySchedule as any
      }
    });

    // Track analytics
    await prisma.analytics.create({
      data: {
        eventType: 'survey_completed',
        sessionId: req.headers['x-session-id'] as string || 'unknown',
        metadata: { planId: workoutPlan.id }
      }
    });

    await prisma.analytics.create({
      data: {
        eventType: 'plan_generated',
        sessionId: req.headers['x-session-id'] as string || 'unknown',
        metadata: { planId: workoutPlan.id }
      }
    });

    // Return plan
    res.json({
      success: true,
      data: {
        shareToken: workoutPlan.shareToken,
        planUrl: `${process.env.FRONTEND_URL}/plan/${workoutPlan.shareToken}`,
        plan: {
          id: workoutPlan.id,
          planName: workoutPlan.planName,
          description: workoutPlan.description,
          durationWeeks: workoutPlan.durationWeeks,
          workoutsPerWeek: workoutPlan.workoutsPerWeek,
          difficulty: workoutPlan.difficulty,
          estimatedCalories: workoutPlan.estimatedCalories,
          weeklySchedule: workoutPlan.weeklySchedule
        }
      }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Validation failed',
          details: error.errors
        }
      });
    }
    next(error);
  }
});

export default router;
