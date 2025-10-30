import { Router } from 'express';
import { prisma } from '../lib/prisma';

const router = Router();

router.get('/:shareToken', async (req, res, next) => {
  try {
    const { shareToken } = req.params;

    // Find plan
    const plan = await prisma.workoutPlan.findUnique({
      where: { shareToken }
    });

    if (!plan) {
      return res.status(404).json({
        success: false,
        error: { message: 'Plan not found' }
      });
    }

    // Increment view count
    await prisma.workoutPlan.update({
      where: { id: plan.id },
      data: { viewCount: { increment: 1 } }
    });

    // Track analytics
    await prisma.analytics.create({
      data: {
        eventType: 'plan_viewed',
        sessionId: req.headers['x-session-id'] as string || 'unknown',
        metadata: { planId: plan.id, shareToken }
      }
    }).catch(() => {}); // Don't fail request if analytics fails

    res.json({
      success: true,
      data: { plan }
    });
  } catch (error) {
    next(error);
  }
});

export default router;
