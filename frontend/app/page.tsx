'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { trackEvent } from '@/lib/api';

// Declare Tally types for TypeScript
declare global {
  interface Window {
    Tally?: {
      openPopup: (formId: string, options?: { width?: number }) => void;
    };
  }
}

export default function Home() {
  // Load Tally widget script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://tally.so/widgets/embed.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const openWaitlist = () => {
    trackEvent('waitlist_opened');
    if (window.Tally) {
      window.Tally.openPopup('w56Pp6', { width: 600 });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600">Unweighted</h1>
          <button
            onClick={openWaitlist}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Join Waitlist
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-5xl font-bold text-gray-900 mb-6">
          Your Personalized Workout Plan,
          <br />
          <span className="text-blue-600">Built Around Your Life</span>
        </h2>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Stop guessing what workouts to do. Get a science-backed, personalized workout plan
          tailored to your goals, schedule, and fitness level in minutes.
        </p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={openWaitlist}
            className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Join Waitlist
          </button>
          <a
            href="#features"
            className="bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold border-2 border-blue-600 hover:bg-blue-50 transition-colors"
          >
            Learn More
          </a>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-4 py-20">
        <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">
          Why Unweighted Works
        </h3>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-xl shadow-lg">
            <div className="text-4xl mb-4">🎯</div>
            <h4 className="text-xl font-bold mb-3">Personalized to You</h4>
            <p className="text-gray-600">
              Every plan is custom-built based on your goals, fitness level, equipment access,
              and schedule. No generic templates.
            </p>
          </div>
          <div className="bg-white p-8 rounded-xl shadow-lg">
            <div className="text-4xl mb-4">📈</div>
            <h4 className="text-xl font-bold mb-3">Progressive Overload</h4>
            <p className="text-gray-600">
              Built-in progression ensures you're always challenging yourself and making gains,
              whether building muscle or losing weight.
            </p>
          </div>
          <div className="bg-white p-8 rounded-xl shadow-lg">
            <div className="text-4xl mb-4">⏱️</div>
            <h4 className="text-xl font-bold mb-3">Fits Your Schedule</h4>
            <p className="text-gray-600">
              Choose how many days per week and how long each workout is. We'll build a plan
              that fits your life.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-blue-50 py-20">
        <div className="container mx-auto px-4">
          <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">
            How It Works
          </h3>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h4 className="font-bold mb-2">Take Survey</h4>
              <p className="text-gray-600 text-sm">
                Answer 10 quick questions about your goals and lifestyle
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h4 className="font-bold mb-2">Get Your Plan</h4>
              <p className="text-gray-600 text-sm">
                Receive a personalized 4-week workout plan instantly
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h4 className="font-bold mb-2">Start Training</h4>
              <p className="text-gray-600 text-sm">
                Follow your plan with detailed exercise instructions
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                4
              </div>
              <h4 className="font-bold mb-2">See Results</h4>
              <p className="text-gray-600 text-sm">
                Track progress and adjust as you get stronger
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="container mx-auto px-4 py-20">
        <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">
          Frequently Asked Questions
        </h3>
        <div className="max-w-3xl mx-auto space-y-6">
          <details className="bg-white p-6 rounded-xl shadow-md">
            <summary className="font-bold text-lg cursor-pointer">
              Is this suitable for beginners?
            </summary>
            <p className="mt-4 text-gray-600">
              Absolutely! Our plans are tailored to your fitness level. Beginners get exercises
              with proper form guidance and appropriate intensity. As you progress, the plan
              adapts to keep challenging you.
            </p>
          </details>
          <details className="bg-white p-6 rounded-xl shadow-md">
            <summary className="font-bold text-lg cursor-pointer">
              What equipment do I need?
            </summary>
            <p className="mt-4 text-gray-600">
              We support all equipment levels - from full gym access to completely bodyweight-only
              workouts. Tell us what you have access to, and we'll build a plan around it.
            </p>
          </details>
          <details className="bg-white p-6 rounded-xl shadow-md">
            <summary className="font-bold text-lg cursor-pointer">
              How long are the workouts?
            </summary>
            <p className="mt-4 text-gray-600">
              You choose! During the survey, you'll select your preferred workout duration:
              15-30, 30-45, 45-60, or 60+ minutes. We'll design workouts that fit your time
              constraints.
            </p>
          </details>
          <details className="bg-white p-6 rounded-xl shadow-md">
            <summary className="font-bold text-lg cursor-pointer">
              Can I share my workout plan?
            </summary>
            <p className="mt-4 text-gray-600">
              Yes! Every plan gets a unique shareable link. You can share it with friends,
              trainers, or workout partners. It's a great way to stay accountable.
            </p>
          </details>
          <details className="bg-white p-6 rounded-xl shadow-md">
            <summary className="font-bold text-lg cursor-pointer">
              How is this different from generic workout apps?
            </summary>
            <p className="mt-4 text-gray-600">
              Most apps give everyone the same cookie-cutter plan. Unweighted creates a truly
              personalized plan based on YOUR specific goals, schedule, equipment, and fitness
              level. It's like having a personal trainer design your program.
            </p>
          </details>
        </div>
      </section>

      {/* Waitlist CTA */}
      <section className="bg-blue-600 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-3xl font-bold mb-4">
            Join the Beta Waitlist
          </h3>
          <p className="text-xl mb-8 opacity-90">
            Be the first to know when we launch new features like progress tracking,
            meal planning, and community accountability.
          </p>
          <button
            onClick={openWaitlist}
            className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors text-lg"
          >
            Join Waitlist
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-400">
            &copy; 2025 Unweighted. Built for people who want real results.
          </p>
          <div className="mt-4">
            <button
              onClick={openWaitlist}
              className="text-blue-400 hover:text-blue-300"
            >
              Join Waitlist
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
