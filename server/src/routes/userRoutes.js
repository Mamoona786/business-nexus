import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  getAllUsers,
  getInvestors,
  getEntrepreneurs,
  getUserById
} from '../controllers/userController.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User discovery APIs
 */

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get all users except current user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Users fetched successfully
 */
router.get('/', protect, getAllUsers);

/**
 * @swagger
 * /users/investors:
 *   get:
 *     summary: Get investors with optional filters
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: stage
 *         schema:
 *           type: string
 *       - in: query
 *         name: interest
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Investors fetched successfully
 */
router.get('/investors', protect, getInvestors);

/**
 * @swagger
 * /users/entrepreneurs:
 *   get:
 *     summary: Get entrepreneurs with optional filters
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: industry
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Entrepreneurs fetched successfully
 */
router.get('/entrepreneurs', protect, getEntrepreneurs);

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Get user by ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User fetched successfully
 *       404:
 *         description: User not found
 */
router.get('/:id', protect, getUserById);

export default router;
