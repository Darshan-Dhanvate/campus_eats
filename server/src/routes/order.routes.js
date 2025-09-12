import express from 'express';
import {
  createOrder,
  getMyOrders,
  addOrderReview,
} from '../controllers/order.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// Middleware to check if the user is a student
const isStudent = (req, res, next) => {
  if (req.user && req.user.role === 'student') {
    next();
  } else {
    res.status(403);
    throw new Error('Not authorized. Student access only.');
  }
};

// @route   POST /api/v1/orders
// @desc    Create a new order
// @access  Private (Student)
router.post('/', protect, isStudent, createOrder);

// @route   GET /api/v1/orders/my-orders
// @desc    Get logged in user's orders
// @access  Private (Student)
router.get('/my-orders', protect, isStudent, getMyOrders);

// @route   POST /api/v1/orders/:id/reviews
// @desc    Create a new review for an order
// @access  Private (Student)
router.post('/:id/reviews', protect, isStudent, addOrderReview);

export default router;

