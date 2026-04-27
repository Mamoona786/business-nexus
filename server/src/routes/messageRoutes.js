import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  sendMessage,
  getConversations,
  getChatMessages,
  getUnreadMessageCount
} from '../controllers/messageController.js';

const router = express.Router();

router.get('/unread-count', protect, getUnreadMessageCount);
router.get('/conversations', protect, getConversations);
router.get('/:userId', protect, getChatMessages);
router.post('/', protect, sendMessage);

export default router;
