import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  updateAccountSettings,
  changePassword,
  updateNotificationPreferences,
  updatePrivacySettings,
  toggleTwoFactor
} from '../controllers/settingsController.js';

const router = express.Router();

router.use(protect);

router.patch('/account', updateAccountSettings);
router.patch('/password', changePassword);
router.patch('/notifications', updateNotificationPreferences);
router.patch('/privacy', updatePrivacySettings);
router.patch('/two-factor', toggleTwoFactor);

export default router;
