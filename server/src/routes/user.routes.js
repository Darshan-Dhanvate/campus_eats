import express from 'express';
import {
    getUserProfile,
    updateUserProfile,
    getStudentStats, // Import the new function
} from '../controllers/user.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

router.route('/profile')
    .get(protect, getUserProfile)
    .put(protect, updateUserProfile);

// FIX: Add the new route for fetching student stats
router.route('/stats')
    .get(protect, authorize('student'), getStudentStats);


export default router;

