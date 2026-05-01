import express from 'express';
import { body } from 'express-validator';
import { protect } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validateMiddleware.js';
import {
  createSupportMessage,
  getMySupportMessages
} from '../controllers/supportController.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Support
 *   description: Help and support APIs
 */

/**
 * @swagger
 * /support:
 *   post:
 *     summary: Submit support message
 *     tags: [Support]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             name: Ali Khan
 *             email: ali@example.com
 *             subject: Need help
 *             message: I need help with my account.
 *     responses:
 *       201:
 *         description: Support message submitted successfully
 */
router.post(
  '/',
  protect,
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('subject').optional().trim().isLength({ max: 120 }).withMessage('Subject cannot exceed 120 characters'),
    body('message').trim().notEmpty().withMessage('Message is required')
  ],
  validate,
  createSupportMessage
);

/**
 * @swagger
 * /support/my:
 *   get:
 *     summary: Get my submitted support messages
 *     tags: [Support]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Support messages fetched successfully
 */
router.get('/my', protect, getMySupportMessages);

export default router;
