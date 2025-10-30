import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';

const router = Router();

const waitlistSchema = z.object({
  email: z.string().email(),
  source: z.enum(['landing_page', 'after_plan_generated']),
  interestedIn: z.array(z.string()).optional().default([]),
  referralCode: z.string().optional()
});

router.post('/signup', async (req, res, next) => {
  try {
    const data = waitlistSchema.parse(req.body);

    // Upsert (don't fail on duplicate email)
    const signup = await prisma.waitlistSignup.upsert({
      where: { email: data.email },
      update: {
        source: data.source,
        interestedIn: data.interestedIn,
        referralCode: data.referralCode
      },
      create: data
    });

    // Track analytics
    await prisma.analytics.create({
      data: {
        eventType: 'waitlist_signup',
        sessionId: req.headers['x-session-id'] as string || 'unknown',
        metadata: { email: data.email, source: data.source }
      }
    }).catch(() => {}); // Don't fail request if analytics fails

    res.json({
      success: true,
      message: 'Successfully added to waitlist',
      data: { id: signup.id }
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
