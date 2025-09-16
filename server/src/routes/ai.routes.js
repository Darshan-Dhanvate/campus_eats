import express from 'express';
import { getFoodRecommendation } from '../controllers/ai.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

// This route will be protected, only allowing students to access it.
router.route('/recommend').post(protect, authorize('student'), getFoodRecommendation);

export default router;
