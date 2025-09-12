import express from 'express';
import {
  registerUser,
  loginUser,
  logoutUser,
} from '../controllers/auth.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// @route   POST /api/v1/auth/register
// @desc    Register a new user (student or canteen)
// @access  Public
router.post('/register', registerUser);

// @route   POST /api/v1/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', loginUser);

// @route   POST /api/v1/auth/logout
// @desc    Logout user and clear cookie
// @access  Private
router.post('/logout', protect, logoutUser);

export default router;

