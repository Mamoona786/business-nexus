import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  getInvestors,
  getEntrepreneurs,
  getUserById
} from '../controllers/userController.js';

const router = express.Router();

router.get('/investors', protect, getInvestors);
router.get('/entrepreneurs', protect, getEntrepreneurs);
router.get('/:id', protect, getUserById);

export default router;
