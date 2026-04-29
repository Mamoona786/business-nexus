import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { getMyProfile, updateMyProfile } from '../controllers/profileController.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Profile
 *   description: Current user profile APIs
 */

/**
 * @swagger
 * /profile/me:
 *   get:
 *     summary: Get my profile
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile fetched successfully
 */
router.get('/me', protect, getMyProfile);

/**
 * @swagger
 * /profile/me:
 *   put:
 *     summary: Update my profile
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           example:
 *             name: Ali Khan
 *             bio: Startup founder
 *             location: Lahore
 *             startupName: Nexus Startup
 *             industry: Fintech
 *     responses:
 *       200:
 *         description: Profile updated successfully
 */
router.put('/me', protect, updateMyProfile);

export default router;
