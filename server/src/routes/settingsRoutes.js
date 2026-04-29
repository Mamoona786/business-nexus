import express from 'express';
import { body } from 'express-validator';
import { protect } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validateMiddleware.js';

import {
  getSettings,
  updateAccountSettings,
  changePassword,
  updateNotificationPreferences,
  updatePrivacySettings,
  toggleTwoFactor
} from '../controllers/settingsController.js';

const router = express.Router();

router.get('/', protect, getSettings);

router.put(
  '/account',
  protect,
  [
    body('name').optional().trim().isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
    body('email').optional().trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('bio').optional().isLength({ max: 1000 }).withMessage('Bio cannot exceed 1000 characters')
  ],
  validate,
  updateAccountSettings
);

router.put(
  '/password',
  protect,
  [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword')
      .isLength({ min: 8 })
      .withMessage('New password must be at least 8 characters')
      .matches(/[A-Z]/)
      .withMessage('New password must contain one uppercase letter')
      .matches(/[a-z]/)
      .withMessage('New password must contain one lowercase letter')
      .matches(/[0-9]/)
      .withMessage('New password must contain one number')
  ],
  validate,
  changePassword
);

router.put('/notifications', protect, updateNotificationPreferences);

router.put(
  '/privacy',
  protect,
  [
    body('profileVisibility')
      .optional()
      .isIn(['public', 'private'])
      .withMessage('Profile visibility must be public or private')
  ],
  validate,
  updatePrivacySettings
);

router.put('/2fa', protect, toggleTwoFactor);

export default router;
