import express from 'express';
import { body } from 'express-validator';
import { protect } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validateMiddleware.js';
import {
  createSupportMessage,
  getMySupportMessages
} from '../controllers/supportController.js';

const router = express.Router();

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

router.get('/my', protect, getMySupportMessages);

export default router;
