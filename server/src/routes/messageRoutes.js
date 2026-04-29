import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  sendMessage,
  getConversations,
  getChatMessages,
  getUnreadMessageCount
} from '../controllers/messageController.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Messages
 *   description: Chat and conversation APIs
 */

/**
 * @swagger
 * /messages/unread-count:
 *   get:
 *     summary: Get unread message count
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Unread message count fetched
 */
router.get('/unread-count', protect, getUnreadMessageCount);

/**
 * @swagger
 * /messages/conversations:
 *   get:
 *     summary: Get user conversations
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Conversations fetched successfully
 */
router.get('/conversations', protect, getConversations);

/**
 * @swagger
 * /messages/{userId}:
 *   get:
 *     summary: Get chat messages with a specific user
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Chat messages fetched successfully
 */
router.get('/:userId', protect, getChatMessages);

/**
 * @swagger
 * /messages:
 *   post:
 *     summary: Send a message
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             receiverId: "65f123456789abcdef123456"
 *             content: Hello, I want to discuss investment.
 *     responses:
 *       201:
 *         description: Message sent successfully
 */
router.post('/', protect, sendMessage);

export default router;
