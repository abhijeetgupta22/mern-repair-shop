import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Admin } from '../models/Admin.js';
import { protectAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

function generateToken(id) {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'super_secret_jwt_key_repair_pro_2026', {
    expiresIn: '30d'
  });
}

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const admin = await Admin.findOne({ email: email.toLowerCase().trim() });
    if (!admin) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const token = generateToken(admin._id || admin.id);

    const safeAdmin = { ...admin };
    delete safeAdmin.password;

    res.json({
      success: true,
      message: 'Logged in successfully',
      token,
      admin: safeAdmin
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Internal server error during login' });
  }
});

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, shopName, phone, address } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email and password are required' });
    }

    const existing = await Admin.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const admin = await Admin.create({
      name,
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      shopName: shopName || 'TechFix Repair Care',
      phone: phone || '+91 98765 43210',
      address: address || 'Shop 101, Tech Arcade',
      subscription: {
        plan: 'FREE_TRIAL',
        status: 'TRIAL',
        startDate: new Date(),
        expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 day trial
        price: 0,
        ticketLimit: 50
      }
    });

    const token = generateToken(admin._id || admin.id);
    const safeAdmin = { ...admin };
    delete safeAdmin.password;

    res.status(201).json({
      success: true,
      message: 'Account registered successfully with 14-day free trial',
      token,
      admin: safeAdmin
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ success: false, message: 'Error registering admin account' });
  }
});

// GET /api/auth/me
router.get('/me', protectAdmin, async (req, res) => {
  try {
    const admin = { ...req.admin };
    delete admin.password;
    res.json({ success: true, admin });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch admin profile' });
  }
});

// PUT /api/auth/profile
router.put('/profile', protectAdmin, async (req, res) => {
  try {
    const { name, shopName, phone, address, upiId } = req.body;
    const adminId = req.admin._id || req.admin.id;

    const updated = await Admin.findByIdAndUpdate(
      adminId,
      {
        $set: {
          ...(name && { name }),
          ...(shopName && { shopName }),
          ...(phone && { phone }),
          ...(address && { address }),
          ...(upiId && { upiId })
        }
      },
      { new: true }
    );

    const safeAdmin = { ...updated };
    delete safeAdmin.password;

    res.json({ success: true, message: 'Profile updated successfully', admin: safeAdmin });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update profile' });
  }
});

// GET /api/auth/demo
router.get('/demo', (req, res) => {
  res.json({
    email: 'admin@techfix.com',
    password: 'adminpassword123',
    role: 'Shop Owner / Administrator'
  });
});

export default router;
