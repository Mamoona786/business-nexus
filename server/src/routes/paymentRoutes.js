import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  createDeposit,
  verifyDepositStatus,
  withdrawFunds,
  transferFunds,
  getTransactionHistory,
  getTransactionStatus
} from '../controllers/paymentController.js';

const router = express.Router();

router.post('/deposit', protect, createDeposit);
router.get('/deposit/status/:sessionId', protect, verifyDepositStatus);
router.post('/withdraw', protect, withdrawFunds);
router.post('/transfer', protect, transferFunds);
router.get('/transactions', protect, getTransactionHistory);
router.get('/transactions/:id/status', protect, getTransactionStatus);

export default router;
