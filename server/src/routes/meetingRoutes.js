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

/**
 * @swagger
 * tags:
 *   name: Meetings
 *   description: Meeting scheduling and status APIs
 */

/**
 * @swagger
 * /meetings:
 *   get:
 *     summary: Get my meetings
 *     tags: [Meetings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Meetings fetched successfully
 */
router.get('/', protect, getMyMeetings);

/**
 * @swagger
 * /meetings:
 *   post:
 *     summary: Schedule a meeting
 *     tags: [Meetings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             participantId: "65f123456789abcdef123456"
 *             title: Investor meeting
 *             date: "2026-05-01"
 *             startTime: "10:00"
 *             endTime: "11:00"
 *             meetingType: video
 *             notes: Discuss startup pitch
 *     responses:
 *       201:
 *         description: Meeting scheduled successfully
 */
router.post('/', protect, scheduleMeeting);

/**
 * @swagger
 * /meetings/{meetingId}/accept:
 *   patch:
 *     summary: Accept a meeting
 *     tags: [Meetings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: meetingId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Meeting accepted
 */
router.patch('/:meetingId/accept', protect, acceptMeeting);

/**
 * @swagger
 * /meetings/{meetingId}/reject:
 *   patch:
 *     summary: Reject a meeting
 *     tags: [Meetings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: meetingId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Meeting rejected
 */
router.patch('/:meetingId/reject', protect, rejectMeeting);

/**
 * @swagger
 * /meetings/{meetingId}/cancel:
 *   patch:
 *     summary: Cancel a meeting
 *     tags: [Meetings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: meetingId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Meeting cancelled
 */
router.patch('/:meetingId/cancel', protect, cancelMeeting);

/**
 * @swagger
 * /meetings/{meetingId}/reschedule:
 *   patch:
 *     summary: Reschedule a meeting
 *     tags: [Meetings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: meetingId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             date: "2026-05-02"
 *             startTime: "12:00"
 *             endTime: "13:00"
 *     responses:
 *       200:
 *         description: Meeting rescheduled
 */
router.patch('/:meetingId/reschedule', protect, rescheduleMeeting);

export default router;
