'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Users, TrendingUp, Target, Brain, Heart } from 'lucide-react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Button from './components/Button';
import Card from './components/Card';
import FAQ from './components/FAQ';

export default function Home() {
  const faqItems = [
    {
      question: 'How is this different from other weight loss apps?',
      answer: 'Unweighted combines AI-powered coaching with real human accountability groups. While other apps leave you isolated with generic meal plans, we provide 24/7 AI support PLUS a community of real people on the same journey. Science shows peer support increases success rates by 300%.',
    },
    {
      question: 'What does the AI coach actually do?',
      answer: 'Your AI coach is available 24/7 to answer questions, provide encouragement, help you navigate challenges, and adapt your plan in real-time. It learns your preferences, understands your struggles, and provides personalized guidance without judgment.',
    },
    {
      question: 'How do accountability groups work?',
      answer: 'You\'ll be matched with 4-6 people with similar goals and lifestyles. Groups check in weekly to share wins, challenges, and support. It\'s like having workout buddies for your entire health journey - accountability that actually works.',
    },
    {
      question: 'I\'ve tried everything and nothing works. Why would this be different?',
      answer: 'You haven\'t failed - the approaches have. Most diets fail because they ignore the social aspect of change. Unweighted addresses the real problem: isolation. With AI coaching AND human support, you\'re never struggling alone. That\'s the difference.',
    },
    {
      question: 'How much does it cost?',
      answer: 'We\'re currently in beta. Join the waitlist to get early access and exclusive founding member pricing when we launch.',
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* HERO SECTION */}
      <section className="relative min-h-screen flex items-center justify-center gradient-navy-blue overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute w-96 h-96 bg-soft-blue/20 rounded-full blur-3xl"
            animate={{
              x: [0, 100, 0],
              y: [0, 50, 0],
            }}
            transition={{ duration: 20, repeat: Infinity }}
            style={{ top: '10%', left: '10%' }}
          />
          <motion.div
            className="absolute w-96 h-96 bg-coral-red/20 rounded-full blur-3xl"
            animate={{
              x: [0, -100, 0],
              y: [0, -50, 0],
            }}
            transition={{ duration: 15, repeat: Infinity }}
            style={{ bottom: '10%', right: '10%' }}
          />
        </div>

        <div className="container mx-auto px-4 pt-32 pb-20 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <motion.h1
              className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              Stop Dieting Alone.
            </motion.h1>

            <motion.p
              className="text-xl md:text-2xl text-white/90 mb-8 leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              Transform weight loss from a solo struggle into a supported journey with{' '}
              <span className="text-soft-blue font-semibold">AI-powered coaching</span> and{' '}
              <span className="text-coral-red font-semibold">human accountability</span>.
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Button
                href="https://forms.unweighted.fit/waitlist"
                variant="primary"
                size="lg"
              >
                Join Waitlist
              </Button>
              <Button href="#how-it-works" variant="outline" size="lg">
                See How It Works
              </Button>
            </motion.div>

            <motion.div
              className="flex items-center justify-center gap-2 text-white/80 text-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full bg-gradient-coral border-2 border-white"
                  />
                ))}
              </div>
              <span>Join 1,000+ members</span>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* STATS SECTION */}
      <section className="bg-navy-blue py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className="text-5xl md:text-6xl font-bold text-coral-red mb-2">
                300%
              </div>
              <p className="text-white/90">Higher Success Rate with Peer Support</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <div className="text-5xl md:text-6xl font-bold text-royal-blue mb-2">
                24/7
              </div>
              <p className="text-white/90">AI Coach Available Anytime</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
            >
              <div className="text-5xl md:text-6xl font-bold text-coral-red mb-2">
                Zero
              </div>
              <p className="text-white/90">Shame, Guilt, or Judgment</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* WHY UNWEIGHTED WORKS */}
      <section id="features" className="py-20 bg-gradient-subtle">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-navy-blue mb-4">
              Why Unweighted Works
            </h2>
            <p className="text-xl text-dark-gray max-w-3xl mx-auto">
              Science-backed approach combining AI technology with human connection
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card
              icon={<Brain className="w-12 h-12 text-royal-blue" />}
              title="AI-Powered Coaching"
              borderColor="royal"
            >
              Your personal AI coach available 24/7 to answer questions, provide
              encouragement, and adapt your plan in real-time. No waiting, no judgment.
            </Card>

            <Card
              icon={<Users className="w-12 h-12 text-coral-red" />}
              title="Community Accountability"
              borderColor="coral"
            >
              Join a small group of people with similar goals. Weekly check-ins,
              shared wins, and real support when you need it most.
            </Card>

            <Card
              icon={<TrendingUp className="w-12 h-12 text-royal-blue" />}
              title="Science-Backed Methods"
              borderColor="royal"
            >
              Evidence-based approaches that actually work. No fads, no quick fixes—
              just sustainable habits that last.
            </Card>
          </div>
        </div>
      </section>

      {/* YOUR JOURNEY SECTION */}
      <section id="how-it-works" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-navy-blue mb-4">
              Your Journey
            </h2>
            <p className="text-xl text-dark-gray">
              From sign-up to sustainable success
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                number: 1,
                color: 'coral',
                title: 'Quick Assessment',
                description: 'Tell us about your goals, lifestyle, and what hasn\'t worked before.',
                icon: <Target className="w-8 h-8" />,
              },
              {
                number: 2,
                color: 'royal',
                title: 'Meet Your AI Coach',
                description: 'Get matched with an AI coach that understands your unique situation.',
                icon: <Brain className="w-8 h-8" />,
              },
              {
                number: 3,
                color: 'coral',
                title: 'Join Your Group',
                description: 'Connect with 4-6 people on the same journey for weekly accountability.',
                icon: <Users className="w-8 h-8" />,
              },
              {
                number: 4,
                color: 'navy',
                title: 'Build Sustainable Habits',
                description: 'Make progress with support, guidance, and zero judgment.',
                icon: <Heart className="w-8 h-8" />,
              },
            ].map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <motion.div
                  className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center text-2xl font-bold text-white ${
                    step.color === 'coral'
                      ? 'bg-coral-red'
                      : step.color === 'royal'
                      ? 'bg-royal-blue'
                      : 'bg-navy-blue'
                  }`}
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  {step.number}
                </motion.div>
                <div className="mb-3 text-royal-blue flex justify-center">
                  {step.icon}
                </div>
                <h4 className="text-xl font-bold text-navy-blue mb-2">{step.title}</h4>
                <p className="text-dark-gray">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* NOT ANOTHER DIET APP */}
      <section className="py-20 bg-light-gray">
        <div className="container mx-auto px-4">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold text-navy-blue text-center mb-16"
          >
            Not Another Diet App
          </motion.h2>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Other Apps */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-white p-8 rounded-xl shadow-card"
            >
              <h3 className="text-2xl font-bold text-medium-gray mb-6">
                Other Apps
              </h3>
              <ul className="space-y-4">
                {[
                  'Generic meal plans',
                  'Diet alone',
                  'Restrictive rules',
                  'Shame and guilt',
                  'One-size-fits-all',
                ].map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="text-medium-gray text-xl">✗</span>
                    <span className="text-dark-gray">{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Unweighted */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-gradient-navy-blue p-8 rounded-xl shadow-card-hover"
            >
              <h3 className="text-2xl font-bold text-white mb-6">
                Unweighted
              </h3>
              <ul className="space-y-4">
                {[
                  'Personalized AI coaching',
                  'Supportive community',
                  'Flexible approach',
                  'Zero judgment',
                  'Tailored to you',
                ].map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="text-coral-red text-xl font-bold">✓</span>
                    <span className="text-white">{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section id="faq" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold text-navy-blue text-center mb-16"
          >
            Common Questions
          </motion.h2>
          <FAQ items={faqItems} />
        </div>
      </section>

      {/* FINAL CTA SECTION */}
      <section className="gradient-navy-blue py-20">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Stop Dieting Alone?
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto">
              Join the waitlist for early access to AI coaching, accountability groups,
              and a community that actually gets it.
            </p>
            <Button
              href="https://forms.unweighted.fit/waitlist"
              variant="primary"
              size="lg"
            >
              Join Waitlist
            </Button>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
