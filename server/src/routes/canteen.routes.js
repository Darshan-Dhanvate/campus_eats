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
  getCompletedOrderHistory,
  getCanteenAnalytics,
  bookCanteenSlot, // ADDED: Import the new controller
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


// ADDED: Route for students to book a slot at a specific canteen
router
    .route('/:canteenId/slots/book')
    .post(protect, authorize('student'), bookCanteenSlot);


export default router;