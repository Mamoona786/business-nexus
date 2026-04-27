import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  sendCollaborationRequest,
  getMyCollaborationRequests,
  updateCollaborationStatus,
  getDeals
} from '../controllers/collaborationController.js';

const router = express.Router();

router.post('/', protect, sendCollaborationRequest);
router.get('/my-requests', protect, getMyCollaborationRequests);
router.get('/deals', protect, getDeals);
router.patch('/:id/status', protect, updateCollaborationStatus);

export default router;
