'use client';

import { useEffect } from 'react';
import { trackEvent } from '@/lib/api';
import { FaInstagram, FaTiktok, FaFacebook } from 'react-icons/fa';

// Declare Tally on window for TypeScript
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
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const openWaitlist = () => {
    trackEvent('waitlist_opened');
    if (window.Tally) {
      window.Tally.openPopup('w56Pp6', { width: 600 });
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="container mx-auto px-4 py-6 relative z-10">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            {/* Logo Circles */}
            <div className="grid grid-cols-2 gap-1 w-10 h-10">
              <div className="w-4 h-4 rounded-full border-2 border-coral flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-coral"></div>
              </div>
              <div className="w-4 h-4 rounded-full bg-royal flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
              </div>
              <div className="w-4 h-4 rounded-full border-2 border-navy flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-navy"></div>
              </div>
              <div className="w-4 h-4 rounded-full bg-coral flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
              </div>
            </div>
            <h1 className="text-2xl font-bold text-navy">unweighted</h1>
          </div>
          <button
            onClick={openWaitlist}
            className="btn-primary"
          >
            Join Waitlist
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full border border-softblue/20 -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute top-20 right-20 w-64 h-64 rounded-full border-2 border-royal/10"></div>
        <div className="absolute top-40 left-10 w-32 h-32 rounded-full bg-gradient-to-br from-coral/10 to-transparent"></div>

        <div className="section-container text-center relative z-10">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-5xl sm:text-6xl font-bold text-navy mb-6 leading-tight">
              Stop Dieting Alone.
            </h2>
            <p className="text-xl sm:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Transform weight loss from a solo struggle into a supported journey with{' '}
              <span className="gradient-text font-semibold">AI-powered coaching</span> and{' '}
              <span className="text-coral font-semibold">human accountability</span>.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <button
                onClick={openWaitlist}
                className="btn-primary text-lg px-10 py-4 ai-glow"
              >
                Join Waitlist
              </button>
              <a
                href="#how-it-works"
                className="btn-secondary text-lg px-10 py-4"
              >
                See How It Works
              </a>
            </div>

            {/* Social Proof */}
            <div className="flex items-center justify-center gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  <div className="w-8 h-8 rounded-full bg-softblue border-2 border-white"></div>
                  <div className="w-8 h-8 rounded-full bg-coral border-2 border-white"></div>
                  <div className="w-8 h-8 rounded-full bg-royal border-2 border-white"></div>
                </div>
                <span className="font-medium">Join 1,000+ members</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-navy text-white py-12">
        <div className="section-container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-coral mb-2">300%</div>
              <div className="text-softblue">Higher Success Rate with Peer Support</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-coral mb-2">24/7</div>
              <div className="text-softblue">AI Coach Available Anytime</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-coral mb-2">Zero</div>
              <div className="text-softblue">Shame, Guilt, or Judgment</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="section-container tech-grid">
        <div className="text-center mb-16">
          <h3 className="text-4xl font-bold text-navy mb-4">
            Why Unweighted Works
          </h3>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Science-backed approach combining AI technology with human connection
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="card hover:scale-105 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-coral/5 -translate-y-1/2 translate-x-1/2"></div>
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-royal to-softblue flex items-center justify-center text-white text-2xl font-bold mb-4">
              AI
            </div>
            <h4 className="text-xl font-bold mb-3 text-navy">AI-Powered Coaching</h4>
            <p className="text-gray-600 leading-relaxed">
              Your personal AI coach learns your habits, provides real-time guidance, and adapts to your progress. Available 24/7 whenever you need support.
            </p>
          </div>
          <div className="card hover:scale-105 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-royal/5 -translate-y-1/2 translate-x-1/2"></div>
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-coral to-coral-400 flex items-center justify-center text-white text-2xl mb-4">
              👥
            </div>
            <h4 className="text-xl font-bold mb-3 text-navy">Community Accountability</h4>
            <p className="text-gray-600 leading-relaxed">
              Join small accountability groups with people on similar journeys. Research shows peer support increases success by 300%.
            </p>
          </div>
          <div className="card hover:scale-105 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-softblue/5 -translate-y-1/2 translate-x-1/2"></div>
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-navy to-navy-500 flex items-center justify-center text-white text-2xl mb-4">
              🧬
            </div>
            <h4 className="text-xl font-bold mb-3 text-navy">Science-Backed Methods</h4>
            <p className="text-gray-600 leading-relaxed">
              Built on behavioral psychology and proven weight loss research. Focus on sustainable habits, not quick fixes or toxic diet culture.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="bg-gradient-to-b from-gray-50 to-white py-20">
        <div className="section-container">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold text-navy mb-4">
              Your Journey, Step by Step
            </h3>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              From assessment to sustainable results
            </p>
          </div>
          <div className="grid md:grid-cols-4 gap-8 max-w-6xl mx-auto">
            <div className="text-center relative">
              <div className="w-20 h-20 bg-gradient-to-br from-coral to-coral-600 text-white rounded-2xl flex items-center justify-center text-3xl font-bold mx-auto mb-6 shadow-lg">
                1
              </div>
              <h4 className="font-bold text-lg mb-2 text-navy">Quick Assessment</h4>
              <p className="text-gray-600 text-sm leading-relaxed">
                Answer questions about your goals, lifestyle, and past experiences. No judgment, just understanding.
              </p>
            </div>
            <div className="text-center relative">
              <div className="w-20 h-20 bg-gradient-to-br from-royal to-royal-600 text-white rounded-2xl flex items-center justify-center text-3xl font-bold mx-auto mb-6 shadow-lg">
                2
              </div>
              <h4 className="font-bold text-lg mb-2 text-navy">Meet Your AI Coach</h4>
              <p className="text-gray-600 text-sm leading-relaxed">
                Get matched with an AI coach that understands your unique situation and creates your personalized plan.
              </p>
            </div>
            <div className="text-center relative">
              <div className="w-20 h-20 bg-gradient-to-br from-softblue to-royal text-white rounded-2xl flex items-center justify-center text-3xl font-bold mx-auto mb-6 shadow-lg">
                3
              </div>
              <h4 className="font-bold text-lg mb-2 text-navy">Join Your Group</h4>
              <p className="text-gray-600 text-sm leading-relaxed">
                Connect with your accountability group - people who get it because they're living it too.
              </p>
            </div>
            <div className="text-center relative">
              <div className="w-20 h-20 bg-gradient-to-br from-navy to-navy-500 text-white rounded-2xl flex items-center justify-center text-3xl font-bold mx-auto mb-6 shadow-lg">
                4
              </div>
              <h4 className="font-bold text-lg mb-2 text-navy">Build Sustainable Habits</h4>
              <p className="text-gray-600 text-sm leading-relaxed">
                Make real progress with daily support, habit tracking, and a community that celebrates your wins.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* What Makes Us Different */}
      <section className="section-container">
        <div className="max-w-4xl mx-auto">
          <h3 className="text-4xl font-bold text-center text-navy mb-12">
            Not Another Diet App
          </h3>
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h4 className="text-2xl font-bold text-coral mb-6">Other Apps</h4>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <span className="text-gray-400 text-xl">✗</span>
                  <span className="text-gray-600">You're on your own to figure it out</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-gray-400 text-xl">✗</span>
                  <span className="text-gray-600">Generic meal plans and workout templates</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-gray-400 text-xl">✗</span>
                  <span className="text-gray-600">Focus on restriction and "willpower"</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-gray-400 text-xl">✗</span>
                  <span className="text-gray-600">Shame when you miss a day</span>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-2xl font-bold text-royal mb-6">Unweighted</h4>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <span className="text-royal text-xl">✓</span>
                  <span className="text-gray-600">AI coach + accountability group support</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-royal text-xl">✓</span>
                  <span className="text-gray-600">Personalized to your life and preferences</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-royal text-xl">✓</span>
                  <span className="text-gray-600">Build sustainable habits, not quick fixes</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-royal text-xl">✓</span>
                  <span className="text-gray-600">Supportive community that gets your struggles</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="bg-gray-50 py-20">
        <div className="container mx-auto px-4">
          <h3 className="text-4xl font-bold text-center text-navy mb-12">
            Common Questions
          </h3>
          <div className="max-w-3xl mx-auto space-y-4">
            <details className="card group">
              <summary className="font-semibold text-lg cursor-pointer flex items-center justify-between text-navy">
                How is this different from other weight loss apps?
                <span className="text-coral group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="mt-4 text-gray-600 leading-relaxed">
                Most apps give you a meal plan and leave you to figure it out alone. Unweighted combines AI coaching with real human accountability groups. Research shows peer support increases success rates by 300%. Plus, we focus on behavioral change, not just calorie counting.
              </p>
            </details>
            <details className="card group">
              <summary className="font-semibold text-lg cursor-pointer flex items-center justify-between text-navy">
                What does the AI coach actually do?
                <span className="text-coral group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="mt-4 text-gray-600 leading-relaxed">
                Your AI coach is available 24/7 to answer questions, provide motivation, help you problem-solve challenges, and adapt your plan based on what's working. Think of it as having a supportive coach in your pocket who learns your habits and preferences over time.
              </p>
            </details>
            <details className="card group">
              <summary className="font-semibold text-lg cursor-pointer flex items-center justify-between text-navy">
                How do accountability groups work?
                <span className="text-coral group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="mt-4 text-gray-600 leading-relaxed">
                You'll be matched with a small group (4-6 people) with similar goals and lifestyles. Your group shares progress, challenges, and wins in a private space. It's not about judgment - it's about having people who genuinely understand what you're going through because they're in it too.
              </p>
            </details>
            <details className="card group">
              <summary className="font-semibold text-lg cursor-pointer flex items-center justify-between text-navy">
                I've tried everything and nothing works. Why would this be different?
                <span className="text-coral group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="mt-4 text-gray-600 leading-relaxed">
                Let's be real: weight loss is hard, and most people struggle. The research is clear - the biggest predictor of success is having support and accountability. This isn't about a magic solution or revolutionary diet. It's about changing the fundamental approach from solo struggle to supported journey.
              </p>
            </details>
            <details className="card group">
              <summary className="font-semibold text-lg cursor-pointer flex items-center justify-between text-navy">
                How much does it cost?
                <span className="text-coral group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="mt-4 text-gray-600 leading-relaxed">
                We're currently in beta and building out the full platform. Join the waitlist to be among the first to access the complete experience and get special early-access pricing.
              </p>
            </details>
          </div>
        </div>
      </section>

      {/* Waitlist CTA */}
      <section className="relative overflow-hidden bg-gradient-to-br from-navy via-navy-700 to-royal text-white py-20">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-64 h-64 rounded-full bg-coral/10 -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-royal/10 translate-x-1/2 translate-y-1/2"></div>

        <div className="container mx-auto px-4 text-center relative z-10">
          <h3 className="text-4xl font-bold mb-4">
            Ready to Stop Dieting Alone?
          </h3>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Join the waitlist for early access to AI coaching, accountability groups, and a community that actually gets it.
          </p>
          <button
            onClick={openWaitlist}
            className="bg-coral text-white px-10 py-4 rounded-lg font-semibold hover:bg-coral-600 transition-all shadow-lg hover:shadow-xl text-lg"
          >
            Join Waitlist
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-navy-900 text-white py-12">
        <div className="container mx-auto px-4">
          {/* Social Media Section */}
          <div className="text-center mb-8">
            <h3 className="text-lg font-semibold text-softblue mb-4">Follow the Movement</h3>
            <div className="flex justify-center items-center gap-5">
              <a
                href="https://www.instagram.com/unweighted_official"
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 rounded-full bg-navy-700 flex items-center justify-center text-softblue hover:bg-coral hover:text-white hover:scale-110 transition-all duration-300"
                aria-label="Follow us on Instagram"
              >
                <FaInstagram className="text-2xl" />
              </a>
              <a
                href="https://www.tiktok.com/@unweighted.fit"
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 rounded-full bg-navy-700 flex items-center justify-center text-softblue hover:bg-coral hover:text-white hover:scale-110 transition-all duration-300"
                aria-label="Follow us on TikTok"
              >
                <FaTiktok className="text-2xl" />
              </a>
              <a
                href="https://www.facebook.com/profile.php?id=61582965223897"
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 rounded-full bg-navy-700 flex items-center justify-center text-softblue hover:bg-coral hover:text-white hover:scale-110 transition-all duration-300"
                aria-label="Follow us on Facebook"
              >
                <FaFacebook className="text-2xl" />
              </a>
            </div>
          </div>

          {/* Footer Links */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 pt-8 border-t border-navy-700">
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
              &copy; 2025 Unweighted. Stop dieting alone.
            </p>
            <div className="flex gap-6">
              <button onClick={openWaitlist} className="text-softblue hover:text-coral transition-colors">
                Join Waitlist
              </button>
              <a href="#features" className="text-softblue hover:text-coral transition-colors">
                Features
              </a>
              <a href="#how-it-works" className="text-softblue hover:text-coral transition-colors">
                How It Works
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
