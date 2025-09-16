import express from 'express';
import {
  getAllCanteens,
  getCanteenById,
  getCanteenMenu,
  addMenuItem,
  updateMenuItem,
  deleteMenuItem,
  getMyCanteenMenu,
  getMyCanteenOrders,
  getCompletedOrderHistory, // Import the new function
  getCanteenAnalytics,
} from '../controllers/canteen.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

// --- Canteen Owner (Private) Routes ---
router
  .route('/menu')
  .post(protect, authorize('canteen'), addMenuItem);

router
  .route('/menu/my-menu')
  .get(protect, authorize('canteen'), getMyCanteenMenu);

router
  .route('/menu/:itemId')
  .put(protect, authorize('canteen'), updateMenuItem)
  .delete(protect, authorize('canteen'), deleteMenuItem);

router
  .route('/orders')
  .get(protect, authorize('canteen'), getMyCanteenOrders);

// FIX: Add the new route for completed order history
router
    .route('/orders/history')
    .get(protect, authorize('canteen'), getCompletedOrderHistory);

router
    .route('/analytics')
    .get(protect, authorize('canteen'), getCanteenAnalytics);


// --- Public Routes ---
router.route('/').get(getAllCanteens);
router.route('/:id').get(getCanteenById);
router.route('/:id/menu').get(getCanteenMenu);


export default router;

