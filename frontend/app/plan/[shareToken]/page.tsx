'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getPlan, joinWaitlist, trackEvent } from '@/lib/api';

interface Exercise {
  name: string;
  sets: string;
  reps: string;
  rest: string;
  notes?: string;
  formTips?: string;
}

interface Workout {
  day: string;
  focus: string;
  exercises: Exercise[];
  warmup: string;
  cooldown: string;
}

interface WorkoutPlan {
  id: string;
  planName: string;
  description: string;
  durationWeeks: number;
  workoutsPerWeek: number;
  difficulty: string;
  estimatedCalories: number;
  weeklySchedule: {
    weeks: Array<{
      weekNumber: number;
      workouts: Workout[];
    }>;
  };
  shareToken: string;
  viewCount: number;
  createdAt: string;
}

export default function PlanPage() {
  const params = useParams();
  const shareToken = params.shareToken as string;

  const [plan, setPlan] = useState<WorkoutPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showWaitlist, setShowWaitlist] = useState(false);
  const [email, setEmail] = useState('');
  const [waitlistSubmitted, setWaitlistSubmitted] = useState(false);

  useEffect(() => {
    loadPlan();
  }, [shareToken]);

  const loadPlan = async () => {
    const result = await getPlan(shareToken);
    setLoading(false);

    if (result.success && result.data) {
      setPlan(result.data.plan);
      trackEvent('plan_viewed', { shareToken });
    } else {
      setError(result.error?.message || 'Failed to load plan');
    }
  };

  const copyShareLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    trackEvent('plan_link_copied');
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleWaitlistSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await joinWaitlist({
      email,
      source: 'after_plan_generated',
      interestedIn: ['Progress tracking', 'Meal planning'],
    });

    if (result.success) {
      setWaitlistSubmitted(true);
      trackEvent('plan_page_waitlist_signup');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading your personalized plan...</p>
        </div>
      </div>
    );
  }

  if (error || !plan) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-6xl mb-4">😞</div>
          <h1 className="text-2xl font-bold mb-2">Plan Not Found</h1>
          <p className="text-gray-600 mb-6">{error || 'This workout plan does not exist.'}</p>
          <Link href="/survey" className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">
            Create Your Own Plan
          </Link>
        </div>
      </div>
    );
  }

  const currentWeek = plan.weeklySchedule.weeks.find(w => w.weekNumber === selectedWeek);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold text-blue-600">
              Unweighted
            </Link>
            <Link href="/survey" className="text-blue-600 hover:text-blue-700">
              Create New Plan
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Plan Header */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">{plan.planName}</h1>
              <p className="text-gray-600">{plan.description}</p>
            </div>
            <button
              onClick={copyShareLink}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              {copiedLink ? '✓ Copied!' : '🔗 Share Plan'}
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">Duration</div>
              <div className="text-2xl font-bold text-blue-600">{plan.durationWeeks} Weeks</div>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">Workouts/Week</div>
              <div className="text-2xl font-bold text-blue-600">{plan.workoutsPerWeek}x</div>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">Difficulty</div>
              <div className="text-2xl font-bold text-blue-600 capitalize">{plan.difficulty}</div>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">Est. Calories</div>
              <div className="text-2xl font-bold text-blue-600">{plan.estimatedCalories}/workout</div>
            </div>
          </div>
        </div>

        {/* Week Selector */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">Select Week</h2>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {plan.weeklySchedule.weeks.map((week) => (
              <button
                key={week.weekNumber}
                onClick={() => setSelectedWeek(week.weekNumber)}
                className={`px-6 py-3 rounded-lg font-semibold whitespace-nowrap ${
                  selectedWeek === week.weekNumber
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                Week {week.weekNumber}
              </button>
            ))}
          </div>
        </div>

        {/* Workouts */}
        {currentWeek && (
          <div className="space-y-6">
            {currentWeek.workouts.map((workout, idx) => (
              <div key={idx} className="bg-white rounded-xl shadow-lg p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                    {idx + 1}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">{workout.day}</h3>
                    <p className="text-gray-600">{workout.focus}</p>
                  </div>
                </div>

                {/* Warmup */}
                <div className="mb-6 p-4 bg-yellow-50 rounded-lg">
                  <h4 className="font-semibold mb-2">🔥 Warmup</h4>
                  <p className="text-gray-700">{workout.warmup}</p>
                </div>

                {/* Exercises */}
                <div className="space-y-4 mb-6">
                  {workout.exercises.map((exercise, exerciseIdx) => (
                    <div key={exerciseIdx} className="border-l-4 border-blue-600 pl-4">
                      <h4 className="font-bold text-lg mb-1">{exercise.name}</h4>
                      <div className="flex gap-6 text-sm text-gray-600 mb-2">
                        <span>Sets: <strong>{exercise.sets}</strong></span>
                        <span>Reps: <strong>{exercise.reps}</strong></span>
                        <span>Rest: <strong>{exercise.rest}</strong></span>
                      </div>
                      {exercise.notes && (
                        <p className="text-sm text-gray-700 mb-1">💡 {exercise.notes}</p>
                      )}
                      {exercise.formTips && (
                        <details className="text-sm text-gray-600 mt-2">
                          <summary className="cursor-pointer hover:text-blue-600">
                            Form Tips
                          </summary>
                          <p className="mt-2 pl-4">{exercise.formTips}</p>
                        </details>
                      )}
                    </div>
                  ))}
                </div>

                {/* Cooldown */}
                <div className="p-4 bg-green-50 rounded-lg">
                  <h4 className="font-semibold mb-2">❄️ Cooldown</h4>
                  <p className="text-gray-700">{workout.cooldown}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Waitlist CTA */}
        {!showWaitlist ? (
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl shadow-lg p-8 mt-8 text-center">
            <h3 className="text-2xl font-bold mb-2">Love Your Plan?</h3>
            <p className="text-lg mb-6 opacity-90">
              Join the waitlist to get progress tracking, meal planning, and community support!
            </p>
            <button
              onClick={() => setShowWaitlist(true)}
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Join Waitlist
            </button>
          </div>
        ) : !waitlistSubmitted ? (
          <div className="bg-white rounded-xl shadow-lg p-8 mt-8">
            <h3 className="text-2xl font-bold mb-4 text-center">Join the Waitlist</h3>
            <p className="text-gray-600 text-center mb-6">
              Be the first to know when we launch premium features!
            </p>
            <form onSubmit={handleWaitlistSignup} className="max-w-md mx-auto">
              <div className="flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-3 border rounded-lg"
                  required
                />
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700"
                >
                  Join
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="bg-green-50 border-2 border-green-200 rounded-xl p-8 mt-8 text-center">
            <div className="text-4xl mb-4">✅</div>
            <h3 className="text-2xl font-bold mb-2">You're on the list!</h3>
            <p className="text-gray-700">We'll notify you when premium features are ready.</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-400">
            &copy; 2025 Unweighted. Your personalized fitness journey starts here.
          </p>
        </div>
      </footer>
    </div>
  );
}
