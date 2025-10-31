'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { submitSurvey, trackEvent } from '@/lib/api';

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

export default function SurveyPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState<Partial<SurveyData>>({
    weightUnit: 'lbs',
    heightUnit: 'inches',
    pastBarriers: [],
    workoutTypes: [],
    workoutsPerWeek: 3,
  });

  const totalSteps = 10;

  const updateField = (field: keyof SurveyData, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  const toggleArrayItem = (field: 'pastBarriers' | 'workoutTypes', value: string) => {
    const current = formData[field] || [];
    if (current.includes(value)) {
      updateField(field, current.filter(v => v !== value));
    } else {
      updateField(field, [...current, value]);
    }
  };

  const nextStep = () => {
    trackEvent('survey_step_completed', { step });
    setStep(step + 1);
  };

  const prevStep = () => {
    setStep(step - 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    const result = await submitSurvey(formData as SurveyData);

    setLoading(false);

    if (result.success && result.data) {
      trackEvent('survey_submitted');
      router.push(`/plan/${result.data.shareToken}`);
    } else {
      setError(result.error?.message || 'Failed to generate plan');
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold text-navy mb-3">Let's start with the basics</h2>
              <p className="text-gray-600">Help us understand you better</p>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-3 text-navy">Age</label>
              <input
                type="number"
                value={formData.age || ''}
                onChange={(e) => updateField('age', parseInt(e.target.value))}
                className="w-full p-4 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-royal transition-all"
                placeholder="Enter your age"
                min="18"
                max="80"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-3 text-navy">Gender</label>
              <div className="grid grid-cols-2 gap-3">
                {['male', 'female', 'non-binary', 'prefer-not-to-say'].map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => updateField('gender', option)}
                    className={`p-4 border-2 rounded-lg capitalize font-medium transition-all ${
                      formData.gender === option
                        ? 'bg-coral text-white border-coral shadow-md'
                        : 'border-gray-200 text-gray-700 hover:border-royal hover:bg-royal/5'
                    }`}
                  >
                    {option.replace(/-/g, ' ')}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold text-navy mb-3">Tell us about your body metrics</h2>
              <p className="text-gray-600">This helps us personalize your plan</p>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-3 text-navy">Current Weight</label>
              <div className="flex gap-3">
                <input
                  type="number"
                  value={formData.currentWeight || ''}
                  onChange={(e) => updateField('currentWeight', parseFloat(e.target.value))}
                  className="flex-1 p-4 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-royal transition-all"
                  placeholder="Enter weight"
                  required
                />
                <select
                  value={formData.weightUnit}
                  onChange={(e) => updateField('weightUnit', e.target.value)}
                  className="p-4 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-royal transition-all font-medium"
                >
                  <option value="lbs">lbs</option>
                  <option value="kg">kg</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-3 text-navy">Goal Weight</label>
              <div className="flex gap-3">
                <input
                  type="number"
                  value={formData.goalWeight || ''}
                  onChange={(e) => updateField('goalWeight', parseFloat(e.target.value))}
                  className="flex-1 p-4 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-royal transition-all"
                  placeholder="Enter goal"
                  required
                />
                <select
                  value={formData.weightUnit}
                  onChange={(e) => updateField('weightUnit', e.target.value)}
                  className="p-4 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-royal transition-all font-medium"
                >
                  <option value="lbs">lbs</option>
                  <option value="kg">kg</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-3 text-navy">Height</label>
              <div className="flex gap-3">
                <input
                  type="number"
                  value={formData.height || ''}
                  onChange={(e) => updateField('height', parseFloat(e.target.value))}
                  className="flex-1 p-4 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-royal transition-all"
                  placeholder="Enter height"
                  required
                />
                <select
                  value={formData.heightUnit}
                  onChange={(e) => updateField('heightUnit', e.target.value)}
                  className="p-4 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-royal transition-all font-medium"
                >
                  <option value="inches">inches</option>
                  <option value="cm">cm</option>
                </select>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold text-navy mb-3">What's your fitness level?</h2>
              <p className="text-gray-600">Be honest - we'll meet you where you are</p>
            </div>
            <div className="space-y-3">
              {[
                { value: 'beginner', label: 'Beginner', desc: 'New to working out or returning after a break' },
                { value: 'intermediate', label: 'Intermediate', desc: 'Work out regularly, comfortable with basic exercises' },
                { value: 'advanced', label: 'Advanced', desc: 'Experienced lifter with solid technique' },
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => updateField('fitnessLevel', option.value)}
                  className={`w-full p-5 border-2 rounded-lg text-left transition-all ${
                    formData.fitnessLevel === option.value
                      ? 'bg-royal text-white border-royal shadow-md'
                      : 'border-gray-200 hover:border-royal hover:bg-royal/5'
                  }`}
                >
                  <div className="font-bold text-lg">{option.label}</div>
                  <div className={`text-sm mt-1 ${formData.fitnessLevel === option.value ? 'text-softblue' : 'text-gray-600'}`}>
                    {option.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold text-navy mb-3">What's your primary goal?</h2>
              <p className="text-gray-600">Choose what matters most to you right now</p>
            </div>
            <div className="space-y-3">
              {[
                { value: 'lose_weight', label: 'Lose Weight', emoji: '🔥' },
                { value: 'build_muscle', label: 'Build Muscle', emoji: '💪' },
                { value: 'improve_fitness', label: 'Improve Fitness', emoji: '❤️' },
                { value: 'increase_energy', label: 'Increase Energy', emoji: '⚡' },
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => updateField('primaryGoal', option.value)}
                  className={`w-full p-5 border-2 rounded-lg text-left flex items-center gap-4 transition-all ${
                    formData.primaryGoal === option.value
                      ? 'bg-coral text-white border-coral shadow-md'
                      : 'border-gray-200 hover:border-coral hover:bg-coral/5'
                  }`}
                >
                  <span className="text-3xl">{option.emoji}</span>
                  <span className="font-bold text-lg">{option.label}</span>
                </button>
              ))}
            </div>
            <div>
              <label className="block text-sm font-semibold mb-3 text-navy">Target Timeline</label>
              <select
                value={formData.targetTimeline}
                onChange={(e) => updateField('targetTimeline', e.target.value)}
                className="w-full p-4 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-royal transition-all font-medium"
              >
                <option value="">Select timeline</option>
                <option value="1_month">1 Month</option>
                <option value="3_months">3 Months</option>
                <option value="6_months">6 Months</option>
                <option value="1_year">1 Year</option>
              </select>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold text-navy mb-3">Your fitness journey</h2>
              <p className="text-gray-600">Let's understand what you've tried before</p>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-3 text-navy">
                How many times have you tried to reach this goal?
              </label>
              <div className="space-y-2">
                {[
                  { value: 'first_time', label: 'This is my first time' },
                  { value: '2_times', label: '2 times' },
                  { value: '3-5_times', label: '3-5 times' },
                  { value: '5+_times', label: '5+ times' },
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => updateField('attemptsCount', option.value)}
                    className={`w-full p-4 border-2 rounded-lg font-medium transition-all ${
                      formData.attemptsCount === option.value
                        ? 'bg-royal text-white border-royal shadow-md'
                        : 'border-gray-200 hover:border-royal hover:bg-royal/5'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-3 text-navy">
                What has held you back in the past? <span className="text-gray-500 font-normal">(Select all that apply)</span>
              </label>
              <div className="space-y-2">
                {[
                  'Lack of time',
                  'No consistency',
                  'Unclear what to do',
                  'Lost motivation',
                  'Injuries',
                  'Life got busy',
                ].map((barrier) => (
                  <button
                    key={barrier}
                    type="button"
                    onClick={() => toggleArrayItem('pastBarriers', barrier)}
                    className={`w-full p-4 border-2 rounded-lg text-left font-medium transition-all ${
                      formData.pastBarriers?.includes(barrier)
                        ? 'bg-softblue text-white border-softblue shadow-md'
                        : 'border-gray-200 hover:border-softblue hover:bg-softblue/5'
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <span className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                        formData.pastBarriers?.includes(barrier) ? 'border-white bg-white/20' : 'border-gray-300'
                      }`}>
                        {formData.pastBarriers?.includes(barrier) && <span className="text-white text-xs">✓</span>}
                      </span>
                      {barrier}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold text-navy mb-3">What types of workouts do you enjoy?</h2>
              <p className="text-gray-600">Select all that interest you</p>
            </div>
            <div className="space-y-2">
              {[
                'Strength training',
                'Cardio',
                'HIIT',
                'Yoga',
                'Pilates',
                'Bodyweight exercises',
                'CrossFit',
                'Functional training',
              ].map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => toggleArrayItem('workoutTypes', type)}
                  className={`w-full p-4 border-2 rounded-lg text-left font-medium transition-all ${
                    formData.workoutTypes?.includes(type)
                      ? 'bg-royal text-white border-royal shadow-md'
                      : 'border-gray-200 hover:border-royal hover:bg-royal/5'
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <span className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                      formData.workoutTypes?.includes(type) ? 'border-white bg-white/20' : 'border-gray-300'
                    }`}>
                      {formData.workoutTypes?.includes(type) && <span className="text-white text-xs">✓</span>}
                    </span>
                    {type}
                  </span>
                </button>
              ))}
            </div>
          </div>
        );

      case 7:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold text-navy mb-3">What equipment do you have access to?</h2>
              <p className="text-gray-600">We'll build your plan around what you have</p>
            </div>
            <div className="space-y-3">
              {[
                { value: 'full_gym', label: 'Full Gym', desc: 'Commercial or well-equipped home gym' },
                { value: 'home_gym', label: 'Home Gym', desc: 'Dumbbells, bench, some equipment' },
                { value: 'minimal_equipment', label: 'Minimal Equipment', desc: 'Bands, light weights' },
                { value: 'bodyweight_only', label: 'Bodyweight Only', desc: 'No equipment needed' },
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => updateField('equipmentAccess', option.value)}
                  className={`w-full p-5 border-2 rounded-lg text-left transition-all ${
                    formData.equipmentAccess === option.value
                      ? 'bg-coral text-white border-coral shadow-md'
                      : 'border-gray-200 hover:border-coral hover:bg-coral/5'
                  }`}
                >
                  <div className="font-bold text-lg">{option.label}</div>
                  <div className={`text-sm mt-1 ${formData.equipmentAccess === option.value ? 'text-white/90' : 'text-gray-600'}`}>
                    {option.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>
        );

      case 8:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold text-navy mb-3">Let's plan your workout schedule</h2>
              <p className="text-gray-600">Build a plan that fits your life</p>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-3 text-navy">
                How many days per week can you work out?
              </label>
              <div className="flex gap-2">
                {[2, 3, 4, 5, 6].map((days) => (
                  <button
                    key={days}
                    type="button"
                    onClick={() => updateField('workoutsPerWeek', days)}
                    className={`flex-1 p-5 border-2 rounded-lg font-bold text-lg transition-all ${
                      formData.workoutsPerWeek === days
                        ? 'bg-royal text-white border-royal shadow-md'
                        : 'border-gray-200 text-gray-700 hover:border-royal hover:bg-royal/5'
                    }`}
                  >
                    {days}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-3 text-navy">
                How long can each workout be?
              </label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: '15-30', label: '15-30 min' },
                  { value: '30-45', label: '30-45 min' },
                  { value: '45-60', label: '45-60 min' },
                  { value: '60+', label: '60+ min' },
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => updateField('workoutDurationPref', option.value)}
                    className={`p-4 border-2 rounded-lg font-medium transition-all ${
                      formData.workoutDurationPref === option.value
                        ? 'bg-coral text-white border-coral shadow-md'
                        : 'border-gray-200 hover:border-coral hover:bg-coral/5'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case 9:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold text-navy mb-3">When do you prefer to work out?</h2>
              <p className="text-gray-600">Help us optimize your schedule</p>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-3 text-navy">Wake Time</label>
                <input
                  type="time"
                  value={formData.wakeTime || ''}
                  onChange={(e) => updateField('wakeTime', e.target.value)}
                  className="w-full p-4 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-royal transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-3 text-navy">Bed Time</label>
                <input
                  type="time"
                  value={formData.bedTime || ''}
                  onChange={(e) => updateField('bedTime', e.target.value)}
                  className="w-full p-4 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-royal transition-all"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-3 text-navy">Preferred Workout Time</label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: 'morning', label: 'Morning' },
                  { value: 'afternoon', label: 'Afternoon' },
                  { value: 'evening', label: 'Evening' },
                  { value: 'flexible', label: 'Flexible' },
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => updateField('preferredWorkoutTime', option.value)}
                    className={`p-4 border-2 rounded-lg font-medium transition-all ${
                      formData.preferredWorkoutTime === option.value
                        ? 'bg-softblue text-white border-softblue shadow-md'
                        : 'border-gray-200 hover:border-softblue hover:bg-softblue/5'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-3 text-navy">Describe your work schedule</label>
              <textarea
                value={formData.workSchedule || ''}
                onChange={(e) => updateField('workSchedule', e.target.value)}
                className="w-full p-4 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-royal transition-all"
                rows={4}
                placeholder="e.g., 9-5 desk job, shift work, flexible hours..."
                required
              />
            </div>
          </div>
        );

      case 10:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-royal to-softblue rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🎉</span>
              </div>
              <h2 className="text-3xl font-bold text-navy mb-3">Almost there! Last step</h2>
              <p className="text-gray-600">
                We'll email you your personalized workout plan
              </p>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-3 text-navy">Email Address</label>
              <input
                type="email"
                value={formData.email || ''}
                onChange={(e) => updateField('email', e.target.value)}
                className="w-full p-4 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-royal transition-all"
                placeholder="your@email.com"
                required
              />
            </div>
            {error && (
              <div className="bg-coral/10 border-2 border-coral text-coral p-4 rounded-lg font-medium">
                {error}
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <Link href="/" className="flex items-center gap-3 w-fit">
          <div className="grid grid-cols-2 gap-1 w-8 h-8">
            <div className="w-3 h-3 rounded-full border border-coral"></div>
            <div className="w-3 h-3 rounded-full bg-royal"></div>
            <div className="w-3 h-3 rounded-full border border-navy"></div>
            <div className="w-3 h-3 rounded-full bg-coral"></div>
          </div>
          <span className="text-xl font-bold text-navy">unweighted</span>
        </Link>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Progress Bar */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm font-semibold text-navy">
              Step {step} of {totalSteps}
            </span>
            <span className="text-sm font-semibold text-coral">
              {Math.round((step / totalSteps) * 100)}% Complete
            </span>
          </div>
          <div className="h-3 bg-gray-200 rounded-full overflow-hidden relative">
            <div
              className="h-full bg-gradient-to-r from-coral to-royal transition-all duration-500 ease-out relative"
              style={{ width: `${(step / totalSteps) * 100}%` }}
            >
              <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Form Card */}
        <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-brand-lg p-8 md:p-10 relative overflow-hidden">
          {/* Decorative Circle */}
          <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-softblue/5 -translate-y-1/2 translate-x-1/2"></div>

          <div className="relative z-10">
            {renderStep()}

            {/* Navigation */}
            <div className="flex gap-4 mt-10">
              {step > 1 && (
                <button
                  onClick={prevStep}
                  className="px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-lg hover:border-navy hover:bg-navy/5 font-semibold transition-all"
                >
                  Back
                </button>
              )}
              {step < totalSteps ? (
                <button
                  onClick={nextStep}
                  className="flex-1 btn-primary py-4 text-lg"
                >
                  Continue
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex-1 btn-primary py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      Generating Your Plan...
                    </span>
                  ) : (
                    'Generate My Plan'
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Info */}
        <div className="max-w-2xl mx-auto mt-6 text-center text-sm text-gray-500">
          <p>Your information is secure and will never be shared</p>
        </div>
      </div>
    </div>
  );
}
