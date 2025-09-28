import express from 'express';
import {
    createOrder,
    getMyOrders,
    updateOrderStatus,
    addOrderReview,
    getSpendingAnalysis,
} from '../controllers/order.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

router.route('/')
    .post(protect, createOrder);

router.route('/my-orders')
    .get(protect, getMyOrders);

router.route('/spending-analysis')
    .get(protect, authorize('student'), getSpendingAnalysis);

// FIX: Ensure authorize middleware is used for canteen-specific actions
router.route('/:id/status')
    .put(protect, authorize('canteen'), updateOrderStatus); 

router.route('/:orderId/review')
    .post(protect, authorize('student'), addOrderReview);

export default router;

