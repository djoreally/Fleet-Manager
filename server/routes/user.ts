import { Router } from 'express';
import prisma from '../prisma';

const router = Router();

// GET /api/user/settings - Get settings for the authenticated user
router.get('/settings', async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required.' });
  }

  try {
    const userWithTenant = await prisma.user.findUnique({
      where: {
        id: req.user.userId,
      },
      include: {
        tenant: true, // Include the related tenant data
      },
    });

    if (!userWithTenant) {
      return res.status(404).json({ error: 'User not found.' });
    }

    // Construct a settings object to send to the client
    const settings = {
      user: {
        email: userWithTenant.email,
        name: userWithTenant.name,
        role: userWithTenant.role,
        onboardingComplete: userWithTenant.onboardingComplete,
      },
      tenant: {
        id: userWithTenant.tenant.id,
        name: userWithTenant.tenant.name,
        businessAddress: userWithTenant.tenant.businessAddress,
        businessPhone: userWithTenant.tenant.businessPhone,
        logoImage: userWithTenant.tenant.logoImage,
      }
    };

    res.json(settings);
  } catch (error) {
    console.error('Failed to get user settings:', error);
    res.status(500).json({ error: 'Failed to retrieve user settings.' });
  }
});

export default router;