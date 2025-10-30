const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Generate a session ID for analytics
const getSessionId = () => {
  if (typeof window === 'undefined') return 'server';
  let sessionId = sessionStorage.getItem('sessionId');
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    sessionStorage.setItem('sessionId', sessionId);
  }
  return sessionId;
};

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    details?: any;
  };
}

interface SurveyData {
  age: number;
  gender: 'male' | 'female' | 'non-binary' | 'prefer-not-to-say';
  currentWeight: number;
  goalWeight: number;
  height: number;
  weightUnit: 'lbs' | 'kg';
  heightUnit: 'inches' | 'cm';
  fitnessLevel: 'beginner' | 'intermediate' | 'advanced';
  primaryGoal: 'lose_weight' | 'build_muscle' | 'improve_fitness' | 'increase_energy';
  targetTimeline: '1_month' | '3_months' | '6_months' | '1_year';
  attemptsCount: 'first_time' | '2_times' | '3-5_times' | '5+_times';
  pastBarriers: string[];
  workoutTypes: string[];
  equipmentAccess: 'full_gym' | 'home_gym' | 'bodyweight_only' | 'minimal_equipment';
  workoutDurationPref: '15-30' | '30-45' | '45-60' | '60+';
  workoutsPerWeek: number;
  wakeTime: string;
  bedTime: string;
  preferredWorkoutTime: 'morning' | 'afternoon' | 'evening' | 'flexible';
  workSchedule: string;
  email: string;
}

interface WorkoutPlan {
  id: string;
  planName: string;
  description: string;
  durationWeeks: number;
  workoutsPerWeek: number;
  difficulty: string;
  estimatedCalories: number;
  weeklySchedule: any;
  shareToken: string;
  viewCount: number;
  createdAt: string;
}

interface WaitlistData {
  email: string;
  source: 'landing_page' | 'after_plan_generated';
  interestedIn?: string[];
  referralCode?: string;
}

export async function submitSurvey(data: SurveyData): Promise<ApiResponse<{ shareToken: string; planUrl: string; plan: WorkoutPlan }>> {
  try {
    const response = await fetch(`${API_URL}/survey/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-session-id': getSessionId(),
      },
      body: JSON.stringify(data),
    });

    return await response.json();
  } catch (error) {
    return {
      success: false,
      error: {
        message: 'Failed to submit survey. Please try again.',
      },
    };
  }
}

export async function getPlan(shareToken: string): Promise<ApiResponse<{ plan: WorkoutPlan }>> {
  try {
    const response = await fetch(`${API_URL}/plan/${shareToken}`, {
      headers: {
        'x-session-id': getSessionId(),
      },
    });

    return await response.json();
  } catch (error) {
    return {
      success: false,
      error: {
        message: 'Failed to load plan. Please try again.',
      },
    };
  }
}

export async function joinWaitlist(data: WaitlistData): Promise<ApiResponse<{ id: string }>> {
  try {
    const response = await fetch(`${API_URL}/waitlist/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-session-id': getSessionId(),
      },
      body: JSON.stringify(data),
    });

    return await response.json();
  } catch (error) {
    return {
      success: false,
      error: {
        message: 'Failed to join waitlist. Please try again.',
      },
    };
  }
}

export async function trackEvent(eventType: string, metadata?: any): Promise<void> {
  try {
    await fetch(`${API_URL}/analytics/event`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-session-id': getSessionId(),
      },
      body: JSON.stringify({ eventType, metadata }),
    });
  } catch (error) {
    // Silently fail analytics
    console.error('Analytics error:', error);
  }
}
