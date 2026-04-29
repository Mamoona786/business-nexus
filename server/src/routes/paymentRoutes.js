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

/**
 * @swagger
 * tags:
 *   name: Payments
 *   description: Wallet, deposit, withdrawal, transfer and transaction APIs
 */

/**
 * @swagger
 * /payments/deposit:
 *   post:
 *     summary: Create deposit session
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 */
router.post('/deposit', protect, createDeposit);

/**
 * @swagger
 * /payments/deposit/status/{sessionId}:
 *   get:
 *     summary: Verify deposit status
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 */
router.get('/deposit/status/:sessionId', protect, verifyDepositStatus);

/**
 * @swagger
 * /payments/withdraw:
 *   post:
 *     summary: Withdraw funds
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 */
router.post('/withdraw', protect, withdrawFunds);

/**
 * @swagger
 * /payments/transfer:
 *   post:
 *     summary: Transfer funds to another user
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 */
router.post('/transfer', protect, transferFunds);

/**
 * @swagger
 * /payments/transactions:
 *   get:
 *     summary: Get transaction history
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 */
router.get('/transactions', protect, getTransactionHistory);

/**
 * @swagger
 * /payments/transactions/{id}/status:
 *   get:
 *     summary: Get transaction status
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 */
router.get('/transactions/:id/status', protect, getTransactionStatus);

export default router;
