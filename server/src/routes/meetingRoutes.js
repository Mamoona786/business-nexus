import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  createMeeting,
  getMyMeetings,
  acceptMeeting,
  rejectMeeting,
  cancelMeeting,
  rescheduleMeeting
} from '../controllers/meetingController.js';

const router = express.Router();

router.get('/', protect, getMyMeetings);
router.post('/', protect, createMeeting);
router.patch('/:id/accept', protect, acceptMeeting);
router.patch('/:id/reject', protect, rejectMeeting);
router.patch('/:id/cancel', protect, cancelMeeting);
router.patch('/:id/reschedule', protect, rescheduleMeeting);

export default router;
