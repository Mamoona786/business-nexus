import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  scheduleMeeting,
  getMyMeetings,
  acceptMeeting,
  rejectMeeting,
  cancelMeeting,
  rescheduleMeeting
} from '../controllers/meetingController.js';

const router = express.Router();

router.get('/', protect, getMyMeetings);
router.post('/', protect, scheduleMeeting);
router.patch('/:meetingId/accept', protect, acceptMeeting);
router.patch('/:meetingId/reject', protect, rejectMeeting);
router.patch('/:meetingId/cancel', protect, cancelMeeting);
router.patch('/:meetingId/reschedule', protect, rescheduleMeeting);

export default router;
