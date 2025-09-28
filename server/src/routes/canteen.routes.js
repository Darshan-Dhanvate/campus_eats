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
  uploadMenuItemImage,
  uploadCanteenProfileImage,
} from '../controllers/canteen.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';
import { uploadMenuItemImage as uploadMenuImage, uploadCanteenProfileImage as uploadProfileImage } from '../middleware/upload.middleware.js';

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

// --- Image Upload Routes ---
router
    .route('/upload/menu-item-image')
    .post(protect, authorize('canteen'), uploadMenuImage, uploadMenuItemImage);

router
    .route('/upload/profile-image')
    .post(protect, authorize('canteen'), uploadProfileImage, uploadCanteenProfileImage);

// --- Public Routes ---
router.route('/').get(getAllCanteens);
router.route('/:id').get(getCanteenById);
router.route('/:id/menu').get(getCanteenMenu);


// ADDED: Route for students to book a slot at a specific canteen
router
    .route('/:canteenId/slots/book')
    .post(protect, authorize('student'), bookCanteenSlot);


export default router;