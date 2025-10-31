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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white">
        <div className="text-center">
          <div className="w-20 h-20 border-4 border-royal border-t-transparent rounded-full animate-spin mx-auto mb-6" />
          <p className="text-navy font-medium text-lg">Loading your personalized plan...</p>
        </div>
      </div>
    );
  }

  if (error || !plan) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-gray-50 to-white">
        <div className="text-center max-w-md">
          <div className="w-24 h-24 bg-coral/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-5xl">😞</span>
          </div>
          <h1 className="text-3xl font-bold mb-3 text-navy">Plan Not Found</h1>
          <p className="text-gray-600 mb-8 text-lg">{error || 'This workout plan does not exist.'}</p>
          <Link href="/survey" className="btn-primary inline-block px-8 py-4">
            Create Your Own Plan
          </Link>
        </div>
      </div>
    );
  }

  const currentWeek = plan.weeklySchedule.weeks.find(w => w.weekNumber === selectedWeek);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-brand sticky top-0 z-50">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center gap-3">
              <div className="grid grid-cols-2 gap-1 w-8 h-8">
                <div className="w-3 h-3 rounded-full border border-coral"></div>
                <div className="w-3 h-3 rounded-full bg-royal"></div>
                <div className="w-3 h-3 rounded-full border border-navy"></div>
                <div className="w-3 h-3 rounded-full bg-coral"></div>
              </div>
              <span className="text-xl font-bold text-navy">unweighted</span>
            </Link>
            <Link href="/survey" className="text-royal hover:text-coral transition-colors font-semibold">
              Create New Plan
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Plan Header */}
        <div className="card mb-8 relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-softblue/10 -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full bg-coral/5 translate-y-1/2 -translate-x-1/2"></div>

          <div className="relative z-10">
            <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
              <div className="flex-1">
                <div className="inline-block px-3 py-1 bg-royal/10 text-royal rounded-full text-sm font-semibold mb-3">
                  Your Custom Plan
                </div>
                <h1 className="text-4xl font-bold mb-3 text-navy">{plan.planName}</h1>
                <p className="text-gray-600 text-lg">{plan.description}</p>
              </div>
              <button
                onClick={copyShareLink}
                className={`btn-secondary whitespace-nowrap transition-all ${
                  copiedLink ? 'bg-royal text-white border-royal' : ''
                }`}
              >
                {copiedLink ? '✓ Copied!' : '🔗 Share Plan'}
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-coral/10 to-coral/5 p-5 rounded-xl border border-coral/20">
                <div className="text-sm font-medium text-gray-600 mb-1">Duration</div>
                <div className="text-3xl font-bold text-coral">{plan.durationWeeks}</div>
                <div className="text-sm text-gray-600">Weeks</div>
              </div>
              <div className="bg-gradient-to-br from-royal/10 to-royal/5 p-5 rounded-xl border border-royal/20">
                <div className="text-sm font-medium text-gray-600 mb-1">Workouts/Week</div>
                <div className="text-3xl font-bold text-royal">{plan.workoutsPerWeek}x</div>
                <div className="text-sm text-gray-600">Per Week</div>
              </div>
              <div className="bg-gradient-to-br from-softblue/10 to-softblue/5 p-5 rounded-xl border border-softblue/20">
                <div className="text-sm font-medium text-gray-600 mb-1">Difficulty</div>
                <div className="text-3xl font-bold text-softblue capitalize">{plan.difficulty}</div>
                <div className="text-sm text-gray-600">Level</div>
              </div>
              <div className="bg-gradient-to-br from-navy/10 to-navy/5 p-5 rounded-xl border border-navy/20">
                <div className="text-sm font-medium text-gray-600 mb-1">Est. Calories</div>
                <div className="text-3xl font-bold text-navy">{plan.estimatedCalories}</div>
                <div className="text-sm text-gray-600">Per Workout</div>
              </div>
            </div>
          </div>
        </div>

        {/* Week Selector */}
        <div className="card mb-8">
          <h2 className="text-2xl font-bold mb-4 text-navy">Select Week</h2>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {plan.weeklySchedule.weeks.map((week) => (
              <button
                key={week.weekNumber}
                onClick={() => setSelectedWeek(week.weekNumber)}
                className={`px-6 py-3 rounded-lg font-semibold whitespace-nowrap transition-all ${
                  selectedWeek === week.weekNumber
                    ? 'bg-coral text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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
              <div key={idx} className="card relative overflow-hidden">
                {/* Decorative circle */}
                <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-gradient-to-br from-royal/5 to-transparent -translate-y-1/2 translate-x-1/2"></div>

                <div className="relative z-10">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 bg-gradient-to-br from-coral to-coral-600 text-white rounded-xl flex items-center justify-center font-bold text-xl shadow-md">
                      {idx + 1}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-navy">{workout.day}</h3>
                      <p className="text-gray-600 font-medium">{workout.focus}</p>
                    </div>
                  </div>

                  {/* Warmup */}
                  <div className="mb-6 p-5 bg-gradient-to-r from-coral/5 to-coral/10 rounded-xl border-l-4 border-coral">
                    <h4 className="font-bold text-coral mb-2 flex items-center gap-2">
                      <span className="text-xl">🔥</span> Warmup
                    </h4>
                    <p className="text-gray-700 leading-relaxed">{workout.warmup}</p>
                  </div>

                  {/* Exercises */}
                  <div className="space-y-5 mb-6">
                    {workout.exercises.map((exercise, exerciseIdx) => (
                      <div
                        key={exerciseIdx}
                        className="border-l-4 border-royal pl-5 py-2 hover:bg-royal/5 transition-colors rounded-r-lg"
                      >
                        <h4 className="font-bold text-lg mb-2 text-navy">{exercise.name}</h4>
                        <div className="flex flex-wrap gap-4 text-sm mb-3">
                          <div className="bg-softblue/10 px-3 py-1 rounded-md">
                            <span className="text-gray-600">Sets:</span>{' '}
                            <strong className="text-softblue">{exercise.sets}</strong>
                          </div>
                          <div className="bg-royal/10 px-3 py-1 rounded-md">
                            <span className="text-gray-600">Reps:</span>{' '}
                            <strong className="text-royal">{exercise.reps}</strong>
                          </div>
                          <div className="bg-coral/10 px-3 py-1 rounded-md">
                            <span className="text-gray-600">Rest:</span>{' '}
                            <strong className="text-coral">{exercise.rest}</strong>
                          </div>
                        </div>
                        {exercise.notes && (
                          <p className="text-sm text-gray-700 mb-2 flex items-start gap-2">
                            <span className="text-base">💡</span>
                            <span>{exercise.notes}</span>
                          </p>
                        )}
                        {exercise.formTips && (
                          <details className="text-sm text-gray-600 mt-3 group">
                            <summary className="cursor-pointer hover:text-royal font-medium transition-colors list-none flex items-center gap-2">
                              <span className="group-open:rotate-90 transition-transform">▶</span>
                              Form Tips
                            </summary>
                            <p className="mt-3 pl-6 text-gray-700 leading-relaxed">{exercise.formTips}</p>
                          </details>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Cooldown */}
                  <div className="p-5 bg-gradient-to-r from-softblue/5 to-softblue/10 rounded-xl border-l-4 border-softblue">
                    <h4 className="font-bold text-softblue mb-2 flex items-center gap-2">
                      <span className="text-xl">❄️</span> Cooldown
                    </h4>
                    <p className="text-gray-700 leading-relaxed">{workout.cooldown}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Waitlist CTA */}
        {!showWaitlist ? (
          <div className="relative overflow-hidden bg-gradient-to-br from-navy via-navy-700 to-royal text-white rounded-xl shadow-brand-lg p-10 mt-12 text-center">
            {/* Decorative circles */}
            <div className="absolute top-0 left-0 w-32 h-32 rounded-full bg-coral/20 -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-0 w-40 h-40 rounded-full bg-softblue/20 translate-x-1/2 translate-y-1/2"></div>

            <div className="relative z-10">
              <div className="w-16 h-16 bg-coral rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">💪</span>
              </div>
              <h3 className="text-3xl font-bold mb-3">Love Your Plan?</h3>
              <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
                Join the waitlist to get AI coaching, accountability groups, and community support!
              </p>
              <button
                onClick={() => setShowWaitlist(true)}
                className="bg-coral text-white px-10 py-4 rounded-lg font-semibold hover:bg-coral-600 transition-all shadow-lg text-lg"
              >
                Join the Waitlist
              </button>
            </div>
          </div>
        ) : !waitlistSubmitted ? (
          <div className="card mt-12">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-royal to-softblue rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🚀</span>
              </div>
              <h3 className="text-3xl font-bold mb-3 text-navy">Join the Waitlist</h3>
              <p className="text-gray-600 text-lg">
                Be the first to know when we launch premium features!
              </p>
            </div>
            <form onSubmit={handleWaitlistSignup} className="max-w-md mx-auto">
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="flex-1 px-6 py-4 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-royal transition-all"
                  required
                />
                <button
                  type="submit"
                  className="btn-primary py-4 whitespace-nowrap"
                >
                  Join Now
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="bg-gradient-to-br from-royal/10 to-softblue/10 border-2 border-royal rounded-xl p-10 mt-12 text-center">
            <div className="w-20 h-20 bg-royal rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl text-white">✓</span>
            </div>
            <h3 className="text-3xl font-bold mb-3 text-navy">You're on the list!</h3>
            <p className="text-gray-700 text-lg">We'll notify you when premium features are ready.</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-navy-900 text-white py-12 mt-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="grid grid-cols-2 gap-1 w-8 h-8">
                <div className="w-3 h-3 rounded-full border border-coral"></div>
                <div className="w-3 h-3 rounded-full bg-royal"></div>
                <div className="w-3 h-3 rounded-full border border-softblue"></div>
                <div className="w-3 h-3 rounded-full bg-coral"></div>
              </div>
              <span className="font-bold text-softblue">unweighted</span>
            </div>
            <p className="text-gray-400 text-sm">
              &copy; 2025 Unweighted. Your personalized fitness journey starts here.
            </p>
            <Link href="/survey" className="text-softblue hover:text-coral transition-colors font-semibold">
              Create New Plan
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
