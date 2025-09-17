import express from 'express';
import { getFoodRecommendation, getCanteenAnalysis, getCanteenFollowUp } from '../controllers/ai.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

// Student food recommender
router.route('/recommend').post(protect, authorize('student'), getFoodRecommendation);

// Canteen performance analysis
router.route('/analyze').post(protect, authorize('canteen'), getCanteenAnalysis);

// Follow-up questions
router.route('/follow-up').post(protect, authorize('canteen'), getCanteenFollowUp);

export default router;
