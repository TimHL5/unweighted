'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
            <h2 className="text-2xl font-bold">Let's start with the basics</h2>
            <div>
              <label className="block text-sm font-medium mb-2">Age</label>
              <input
                type="number"
                value={formData.age || ''}
                onChange={(e) => updateField('age', parseInt(e.target.value))}
                className="w-full p-3 border rounded-lg"
                min="18"
                max="80"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Gender</label>
              <div className="grid grid-cols-2 gap-3">
                {['male', 'female', 'non-binary', 'prefer-not-to-say'].map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => updateField('gender', option)}
                    className={`p-3 border rounded-lg capitalize ${
                      formData.gender === option ? 'bg-blue-600 text-white' : 'hover:bg-gray-50'
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
            <h2 className="text-2xl font-bold">Tell us about your body metrics</h2>
            <div>
              <label className="block text-sm font-medium mb-2">Current Weight</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={formData.currentWeight || ''}
                  onChange={(e) => updateField('currentWeight', parseFloat(e.target.value))}
                  className="flex-1 p-3 border rounded-lg"
                  required
                />
                <select
                  value={formData.weightUnit}
                  onChange={(e) => updateField('weightUnit', e.target.value)}
                  className="p-3 border rounded-lg"
                >
                  <option value="lbs">lbs</option>
                  <option value="kg">kg</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Goal Weight</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={formData.goalWeight || ''}
                  onChange={(e) => updateField('goalWeight', parseFloat(e.target.value))}
                  className="flex-1 p-3 border rounded-lg"
                  required
                />
                <select
                  value={formData.weightUnit}
                  onChange={(e) => updateField('weightUnit', e.target.value)}
                  className="p-3 border rounded-lg"
                >
                  <option value="lbs">lbs</option>
                  <option value="kg">kg</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Height</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={formData.height || ''}
                  onChange={(e) => updateField('height', parseFloat(e.target.value))}
                  className="flex-1 p-3 border rounded-lg"
                  required
                />
                <select
                  value={formData.heightUnit}
                  onChange={(e) => updateField('heightUnit', e.target.value)}
                  className="p-3 border rounded-lg"
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
            <h2 className="text-2xl font-bold">What's your fitness level?</h2>
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
                  className={`w-full p-4 border rounded-lg text-left ${
                    formData.fitnessLevel === option.value ? 'bg-blue-600 text-white border-blue-600' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="font-semibold">{option.label}</div>
                  <div className={`text-sm ${formData.fitnessLevel === option.value ? 'text-blue-100' : 'text-gray-600'}`}>
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
            <h2 className="text-2xl font-bold">What's your primary goal?</h2>
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
                  className={`w-full p-4 border rounded-lg text-left flex items-center gap-3 ${
                    formData.primaryGoal === option.value ? 'bg-blue-600 text-white border-blue-600' : 'hover:bg-gray-50'
                  }`}
                >
                  <span className="text-2xl">{option.emoji}</span>
                  <span className="font-semibold">{option.label}</span>
                </button>
              ))}
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Target Timeline</label>
              <select
                value={formData.targetTimeline}
                onChange={(e) => updateField('targetTimeline', e.target.value)}
                className="w-full p-3 border rounded-lg"
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
            <h2 className="text-2xl font-bold">Your fitness journey</h2>
            <div>
              <label className="block text-sm font-medium mb-2">
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
                    className={`w-full p-3 border rounded-lg ${
                      formData.attemptsCount === option.value ? 'bg-blue-600 text-white' : 'hover:bg-gray-50'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                What has held you back in the past? (Select all that apply)
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
                    className={`w-full p-3 border rounded-lg text-left ${
                      formData.pastBarriers?.includes(barrier) ? 'bg-blue-600 text-white' : 'hover:bg-gray-50'
                    }`}
                  >
                    {barrier}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">What types of workouts do you enjoy?</h2>
            <p className="text-gray-600">Select all that interest you</p>
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
                  className={`w-full p-3 border rounded-lg text-left ${
                    formData.workoutTypes?.includes(type) ? 'bg-blue-600 text-white' : 'hover:bg-gray-50'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        );

      case 7:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">What equipment do you have access to?</h2>
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
                  className={`w-full p-4 border rounded-lg text-left ${
                    formData.equipmentAccess === option.value ? 'bg-blue-600 text-white' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="font-semibold">{option.label}</div>
                  <div className={`text-sm ${formData.equipmentAccess === option.value ? 'text-blue-100' : 'text-gray-600'}`}>
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
            <h2 className="text-2xl font-bold">Let's plan your workout schedule</h2>
            <div>
              <label className="block text-sm font-medium mb-2">
                How many days per week can you work out?
              </label>
              <div className="flex gap-2">
                {[2, 3, 4, 5, 6].map((days) => (
                  <button
                    key={days}
                    type="button"
                    onClick={() => updateField('workoutsPerWeek', days)}
                    className={`flex-1 p-4 border rounded-lg font-semibold ${
                      formData.workoutsPerWeek === days ? 'bg-blue-600 text-white' : 'hover:bg-gray-50'
                    }`}
                  >
                    {days}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
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
                    className={`p-3 border rounded-lg ${
                      formData.workoutDurationPref === option.value ? 'bg-blue-600 text-white' : 'hover:bg-gray-50'
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
            <h2 className="text-2xl font-bold">When do you prefer to work out?</h2>
            <div>
              <label className="block text-sm font-medium mb-2">Wake Time</label>
              <input
                type="time"
                value={formData.wakeTime || ''}
                onChange={(e) => updateField('wakeTime', e.target.value)}
                className="w-full p-3 border rounded-lg"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Bed Time</label>
              <input
                type="time"
                value={formData.bedTime || ''}
                onChange={(e) => updateField('bedTime', e.target.value)}
                className="w-full p-3 border rounded-lg"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Preferred Workout Time</label>
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
                    className={`p-3 border rounded-lg ${
                      formData.preferredWorkoutTime === option.value ? 'bg-blue-600 text-white' : 'hover:bg-gray-50'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Describe your work schedule</label>
              <textarea
                value={formData.workSchedule || ''}
                onChange={(e) => updateField('workSchedule', e.target.value)}
                className="w-full p-3 border rounded-lg"
                rows={3}
                placeholder="e.g., 9-5 desk job, shift work, flexible hours..."
                required
              />
            </div>
          </div>
        );

      case 10:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Almost there! Last step</h2>
            <p className="text-gray-600">
              We'll email you your personalized workout plan and updates.
            </p>
            <div>
              <label className="block text-sm font-medium mb-2">Email Address</label>
              <input
                type="email"
                value={formData.email || ''}
                onChange={(e) => updateField('email', e.target.value)}
                className="w-full p-3 border rounded-lg"
                placeholder="your@email.com"
                required
              />
            </div>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
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
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4 py-8">
        {/* Progress Bar */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-600">
              Step {step} of {totalSteps}
            </span>
            <span className="text-sm font-medium text-gray-600">
              {Math.round((step / totalSteps) * 100)}%
            </span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 transition-all duration-300"
              style={{ width: `${(step / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Form */}
        <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-8">
          {renderStep()}

          {/* Navigation */}
          <div className="flex gap-4 mt-8">
            {step > 1 && (
              <button
                onClick={prevStep}
                className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Back
              </button>
            )}
            {step < totalSteps ? (
              <button
                onClick={nextStep}
                className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
              >
                Continue
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Generating Your Plan...' : 'Generate My Plan'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
