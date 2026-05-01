import express from 'express';
import rateLimit from 'express-rate-limit';
import { body } from 'express-validator';

import { registerUser, loginUser, verifyLoginOtp, logoutUser, getMe, forgotPassword, resetPassword} from '../controllers/authController.js';
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

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication and account access
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             name: Ali Khan
 *             email: ali@example.com
 *             password: Password123
 *             role: entrepreneur
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Validation error or email already exists
 */
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

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login user and send OTP
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             email: ali@example.com
 *             password: Password123
 *             role: entrepreneur
 *     responses:
 *       200:
 *         description: OTP sent successfully
 *       401:
 *         description: Invalid credentials
 */
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

/**
 * @swagger
 * /auth/verify-otp:
 *   post:
 *     summary: Verify login OTP
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             email: ali@example.com
 *             otp: "123456"
 *             role: entrepreneur
 *     responses:
 *       200:
 *         description: Login successful
 *       400:
 *         description: Invalid or expired OTP
 */
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

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout user
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Logged out successfully
 */
router.post('/logout', logoutUser);

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Get current logged-in user
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user fetched successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/me', protect, getMe);

/**
 * @swagger
 * /auth/forgot-password:
 *   post:
 *     summary: Send password reset email
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             email: ali@example.com
 *     responses:
 *       200:
 *         description: Password reset email sent
 */
router.post(
  '/forgot-password',
  authLimiter,
  [body('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail()],
  validate,
  forgotPassword
);

/**
 * @swagger
 * /auth/reset-password/{token}:
 *   post:
 *     summary: Reset password using reset token
 *     tags: [Auth]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             password: NewPassword123
 *     responses:
 *       200:
 *         description: Password reset successfully
 */
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
