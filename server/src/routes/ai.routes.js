import express from 'express';
import { getFoodRecommendation, getCanteenAnalysis } from '../controllers/ai.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

// Route for the student's food recommender
router.route('/recommend').post(protect, authorize('student'), getFoodRecommendation);

// FIX: Add the new route for the canteen's performance analysis
router.route('/analyze').post(protect, authorize('canteen'), getCanteenAnalysis);


export default router;

