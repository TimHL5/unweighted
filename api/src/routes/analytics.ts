import { Router } from 'express';
import { prisma } from '../lib/prisma';

const router = Router();

router.post('/track', async (req, res) => {
  try {
    const { eventType, sessionId, metadata } = req.body;

    if (!eventType || !sessionId) {
      return res.status(400).json({
        success: false,
        error: { message: 'eventType and sessionId are required' }
      });
    }

    await prisma.analytics.create({
      data: {
        eventType,
        sessionId,
        metadata: metadata || {}
      }
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Analytics error:', error);
    // Don't fail user requests on analytics errors
    res.json({ success: false, error: 'Analytics tracking failed' });
  }
});

// Get analytics (optional, for admin dashboard)
router.get('/stats', async (req, res) => {
  try {
    const stats = await prisma.analytics.groupBy({
      by: ['eventType'],
      _count: {
        eventType: true
      }
    });

    const totalUsers = await prisma.surveyResponse.count();
    const totalWaitlist = await prisma.waitlistSignup.count();
    const totalPlans = await prisma.workoutPlan.count();

    res.json({
      success: true,
      data: {
        events: stats,
        totals: {
          users: totalUsers,
          waitlist: totalWaitlist,
          plans: totalPlans
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch analytics' }
    });
  }
});

export default router;
