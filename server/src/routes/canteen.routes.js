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
  getCanteenAnalytics, // Import the new analytics function
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

// FIX: Add the new analytics route
router
    .route('/analytics')
    .get(protect, authorize('canteen'), getCanteenAnalytics);


// --- Public Routes ---
router.route('/').get(getAllCanteens);
router.route('/:id').get(getCanteenById); // Route to get a single canteen's details
router.route('/:id/menu').get(getCanteenMenu);


export default router;

