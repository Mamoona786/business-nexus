import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  sendCollaborationRequest,
  getMyCollaborationRequests,
  updateCollaborationStatus,
  getDeals
} from '../controllers/collaborationController.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Collaborations
 *   description: Collaboration request and deal APIs
 */

/**
 * @swagger
 * /collaborations:
 *   post:
 *     summary: Send collaboration request
 *     tags: [Collaborations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             entrepreneurId: "65f123456789abcdef123456"
 *             investorId: "65f123456789abcdef654321"
 *             message: I am interested in collaboration.
 *     responses:
 *       201:
 *         description: Collaboration request sent
 */
router.post('/', protect, sendCollaborationRequest);

/**
 * @swagger
 * /collaborations/my-requests:
 *   get:
 *     summary: Get my collaboration requests
 *     tags: [Collaborations]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Collaboration requests fetched successfully
 */
router.get('/my-requests', protect, getMyCollaborationRequests);

/**
 * @swagger
 * /collaborations/deals:
 *   get:
 *     summary: Get accepted collaboration deals
 *     tags: [Collaborations]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Deals fetched successfully
 */
router.get('/deals', protect, getDeals);

/**
 * @swagger
 * /collaborations/{id}/status:
 *   patch:
 *     summary: Update collaboration request status
 *     tags: [Collaborations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             status: accepted
 *     responses:
 *       200:
 *         description: Collaboration status updated
 */
router.patch('/:id/status', protect, updateCollaborationStatus);

export default router;
