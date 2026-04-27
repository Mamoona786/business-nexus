import express from 'express';
import rateLimit from 'express-rate-limit';
import { body } from 'express-validator';

import {
  registerUser,
  loginUser,
  verifyLoginOtp,
  logoutUser,
  getMe,
  forgotPassword,
  resetPassword
} from '../controllers/authController.js';

import { protect } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validateMiddleware.js';

const router = express.Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: {
    message: 'Too many auth attempts. Please try again later.'
  }
});

const otpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 10,
  message: {
    message: 'Too many OTP attempts. Please try again later.'
  }
});

router.post(
  '/register',
  authLimiter,
  [
    body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 50 }),
    body('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters')
      .matches(/[A-Z]/)
      .withMessage('Password must contain one uppercase letter')
      .matches(/[a-z]/)
      .withMessage('Password must contain one lowercase letter')
      .matches(/[0-9]/)
      .withMessage('Password must contain one number'),
    body('role').isIn(['entrepreneur', 'investor']).withMessage('Invalid role selected')
  ],
  validate,
  registerUser
);

router.post(
  '/login',
  authLimiter,
  [
    body('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required'),
    body('role').isIn(['entrepreneur', 'investor']).withMessage('Invalid role selected')
  ],
  validate,
  loginUser
);

router.post(
  '/verify-otp',
  otpLimiter,
  [
    body('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('otp')
      .trim()
      .isLength({ min: 6, max: 6 })
      .withMessage('OTP must be 6 digits')
      .isNumeric()
      .withMessage('OTP must contain digits only'),
    body('role').isIn(['entrepreneur', 'investor']).withMessage('Invalid role selected')
  ],
  validate,
  verifyLoginOtp
);

router.post('/logout', logoutUser);
router.get('/me', protect, getMe);

router.post(
  '/forgot-password',
  authLimiter,
  [body('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail()],
  validate,
  forgotPassword
);

router.post(
  '/reset-password/:token',
  authLimiter,
  [
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters')
      .matches(/[A-Z]/)
      .withMessage('Password must contain one uppercase letter')
      .matches(/[a-z]/)
      .withMessage('Password must contain one lowercase letter')
      .matches(/[0-9]/)
      .withMessage('Password must contain one number')
  ],
  validate,
  resetPassword
);

export default router;
