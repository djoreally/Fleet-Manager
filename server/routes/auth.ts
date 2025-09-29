import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../prisma';

const router = Router();

// POST /api/auth/signup
// Creates a new tenant and a new user (manager)
router.post('/signup', async (req, res) => {
  const { email, password, businessName } = req.body;

  if (!email || !password || !businessName) {
    return res.status(400).json({ error: 'Email, password, and business name are required.' });
  }

  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ error: 'A user with this email already exists.' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Use a transaction to ensure both tenant and user are created, or neither are.
    const result = await prisma.$transaction(async (tx) => {
      // Create the tenant
      const newTenant = await tx.tenant.create({
        data: {
          name: businessName,
        },
      });

      // Create the user and link them to the new tenant
      const newUser = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          role: 'manager', // The user who signs up is the manager
          tenantId: newTenant.id,
        },
      });

      return { newUser, newTenant };
    });

    res.status(201).json({
      message: 'Account created successfully.',
      userId: result.newUser.id,
      tenantId: result.newTenant.id,
    });

  } catch (error) {
    console.error('Signup Error:', error);
    res.status(500).json({ error: 'An internal server error occurred during signup.' });
  }
});

// POST /api/auth/login
// Authenticates a user and returns a JWT
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  try {
    // Find the user by email
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    // Compare the provided password with the stored hash
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    // Generate a JWT
    const token = jwt.sign(
      { userId: user.id, tenantId: user.tenantId, role: user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: '1d' } // Token expires in 1 day
    );

    res.status(200).json({ token });

  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ error: 'An internal server error occurred during login.' });
  }
});

export default router;