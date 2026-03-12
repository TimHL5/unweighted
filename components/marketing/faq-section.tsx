'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'
import { fadeInUp, staggerContainerSlow } from '@/lib/motion'

const faqs = [
  {
    question: 'Is Unweighted really free?',
    answer:
      'Yes! The free tier includes full calorie tracking with our USDA database, water tracking, weight logging, daily check-ins, and basic achievements. You can use Unweighted completely free with no time limit. Pro and Premium plans unlock additional features like accountability groups, recipe creation, and advanced analytics.',
  },
  {
    question: 'How is Unweighted different from MyFitnessPal?',
    answer:
      "While MyFitnessPal is a great food database, it's a solo experience. Unweighted is built around small accountability groups of 2\u20134 people. You get real-time group chat, shared progress tracking, automatic milestone celebrations, and a full gamification system with achievements, XP, and challenges. It's the social layer that makes tracking stick.",
  },
  {
    question: "What if I don't have friends to create a group with?",
    answer:
      "No problem! You can create a group and share an invite link, or you can start solo and invite people later. We're working on an auto-matching feature that will pair you with people who share similar goals.",
  },
  {
    question: 'Does Unweighted work on my phone?',
    answer:
      'Unweighted is a progressive web app (PWA) that works beautifully on any device \u2014 iPhone, Android, tablet, or desktop. Just visit the site in your browser and add it to your home screen for a native app-like experience. No app store download required.',
  },
  {
    question: 'How accurate is the food database?',
    answer:
      "We use the USDA FoodData Central database with over 1 million foods, plus support for barcode scanning through Open Food Facts. You can also create custom foods and recipes. Our data is regularly updated and community-verified for accuracy.",
  },
  {
    question: 'How do you handle my data and privacy?',
    answer:
      'Your data is stored securely using Supabase (built on PostgreSQL) with row-level security. We never sell your personal data. Food logging data stays private to you and your group. Payments are processed securely through Stripe \u2014 we never see your card details.',
  },
  {
    question: 'Can I cancel my subscription anytime?',
    answer:
      "Absolutely. You can cancel your Pro or Premium subscription at any time from your settings page. You'll continue to have access to paid features until the end of your billing period, then you'll be moved back to the free tier with no data loss.",
  },
  {
    question: 'What about the gamification \u2014 is it motivating?',
    answer:
      "It's designed by behavioral psychology principles. The achievement system, XP progression, streaks, and community challenges create positive feedback loops that make healthy habits feel rewarding. Think Duolingo, but for your diet.",
  },
]

export function FAQSection() {
  const [search, setSearch] = useState('')

  const filteredFaqs = faqs.filter(
    (faq) =>
      faq.question.toLowerCase().includes(search.toLowerCase()) ||
      faq.answer.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <section id="faq" className="relative py-24 lg:py-32">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      <div className="mx-auto max-w-3xl px-4 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={staggerContainerSlow}
          className="text-center"
        >
          <motion.p
            variants={fadeInUp}
            className="mb-3 text-sm font-semibold uppercase tracking-wider text-blue-500"
          >
            FAQ
          </motion.p>
          <motion.h2
            variants={fadeInUp}
            className="font-display text-3xl font-bold sm:text-4xl lg:text-5xl"
          >
            Frequently asked questions
          </motion.h2>
          <motion.p
            variants={fadeInUp}
            className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground"
          >
            Everything you need to know about Unweighted.
          </motion.p>
        </motion.div>

        {/* Search */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="relative mt-10"
        >
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search questions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-12 rounded-xl pl-10 text-base"
          />
        </motion.div>

        {/* Accordion */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="mt-8"
        >
          <Accordion type="single" collapsible className="w-full">
            {filteredFaqs.map((faq, i) => (
              <AccordionItem
                key={i}
                value={`item-${i}`}
                className="border-b border-border/50"
              >
                <AccordionTrigger className="py-5 text-left font-display text-base font-semibold hover:no-underline">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="pb-5 text-sm leading-relaxed text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          {filteredFaqs.length === 0 && (
            <p className="py-12 text-center text-muted-foreground">
              No questions match your search. Try different keywords.
            </p>
          )}
        </motion.div>
      </div>
    </section>
  )
}
