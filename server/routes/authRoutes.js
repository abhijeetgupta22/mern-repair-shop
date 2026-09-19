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
    const { name, email, password, shopName, phone, address, shopEmail, upiId } = req.body;

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
      shopName: shopName || 'Apex Laptop & Mobile Repair Hub',
      phone: phone || '+91 98765 43210',
      address: address || 'Shop 104, Tech Arcade, Electronics Market',
      shopEmail: shopEmail || email.toLowerCase().trim(),
      upiId: upiId || 'apexrepair@upi',
      isConfigured: false,
      subscription: {
        plan: 'FREE_TRIAL',
        status: 'TRIAL',
        startDate: new Date(),
        expiresAt: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000), // 28 days free trial
        price: 0,
        billingCycle: 'trial',
        ticketLimit: 99999
      }
    });

    const token = generateToken(admin._id || admin.id);
    const safeAdmin = { ...admin };
    delete safeAdmin.password;

    res.status(201).json({
      success: true,
      message: 'Account registered successfully with 28-day free trial',
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

// PUT /api/auth/profile - Updates Shop Name, Shop Address, Shop Gmail ID, Shop Mobile Number, UPI ID, and credentials
router.put('/profile', protectAdmin, async (req, res) => {
  try {
    const { name, email, password, shopName, phone, address, shopEmail, upiId } = req.body;
    const adminId = req.admin._id || req.admin.id;

    const updateSet = {
      isConfigured: true
    };
    if (name !== undefined) updateSet.name = name;
    if (shopName !== undefined) updateSet.shopName = shopName;
    if (phone !== undefined) updateSet.phone = phone;
    if (address !== undefined) updateSet.address = address;
    if (shopEmail !== undefined) updateSet.shopEmail = shopEmail;
    if (upiId !== undefined) updateSet.upiId = upiId;

    if (email && email.toLowerCase().trim() !== (req.admin.email || '').toLowerCase()) {
      const existing = await Admin.findOne({ email: email.toLowerCase().trim() });
      if (existing && (existing._id || existing.id) !== adminId) {
        return res.status(400).json({ success: false, message: 'This email is already in use by another account' });
      }
      updateSet.email = email.toLowerCase().trim();
    }

    if (password && password.trim().length >= 6) {
      const salt = await bcrypt.genSalt(10);
      updateSet.password = await bcrypt.hash(password.trim(), salt);
    }

    const updated = await Admin.findByIdAndUpdate(
      adminId,
      { $set: updateSet },
      { new: true }
    );

    const safeAdmin = { ...updated };
    delete safeAdmin.password;

    res.json({
      success: true,
      message: 'Shop profile and login credentials updated successfully',
      admin: safeAdmin
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ success: false, message: 'Failed to update shop profile' });
  }
});

// GET /api/auth/shop-info (Public - used by customer portal and tracking)
router.get('/shop-info', async (req, res) => {
  try {
    const admins = await Admin.find();
    const admin = admins[0] || {};
    res.json({
      success: true,
      shop: {
        shopName: admin.shopName || process.env.SHOP_NAME || 'Apex Laptop & Mobile Repair Hub',
        address: admin.address || process.env.SHOP_ADDRESS || 'Tech Arcade, Electronics Market',
        phone: admin.phone || process.env.SHOP_PHONE || '+91 98765 43210',
        shopEmail: admin.shopEmail || process.env.EMAIL_FROM || 'apexrepairs@gmail.com',
        upiId: admin.upiId || process.env.SHOP_UPI_ID || 'apexrepair@upi'
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error retrieving shop info' });
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
