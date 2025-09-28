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
  saveCanteenLayout,
  getCanteenLayout,
  getCanteenLayoutPublic,
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
// Enhanced logging wrapper for menu item image upload (auth intentionally omitted per current requirement)
router.post('/upload/menu-item-image', (req, res, next) => {
  console.log('\n[UPLOAD] Incoming menu item image upload');
  console.log('[UPLOAD] Headers:', req.headers['content-type']);
  uploadMenuImage(req, res, function (err) {
    if (err) {
      console.error('[UPLOAD] Multer error:', err.message);
      if (!res.headersSent) {
        // Tag client-friendly error if it's a known validation
        const status = err.message.startsWith('Only image files') ? 400 : 500;
        res.status(status).json({ success: false, error: err.message });
      }
      return; // Do not proceed to controller
    }
    console.log('[UPLOAD] Multer passed. File present?', !!req.file);
    uploadMenuItemImage(req, res, next);
  });
});

router
    .route('/upload/profile-image')
    .post(protect, authorize('canteen'), uploadProfileImage, uploadCanteenProfileImage);

// Layout management routes
router
    .route('/layout')
    .get(protect, authorize('canteen'), getCanteenLayout)
    .put(protect, authorize('canteen'), saveCanteenLayout);

// --- Public Routes ---
router.route('/').get(getAllCanteens);
router.route('/:id').get(getCanteenById);
router.route('/:id/menu').get(getCanteenMenu);
router.route('/:canteenId/layout').get(getCanteenLayoutPublic);


// ADDED: Route for students to book a slot at a specific canteen
router
    .route('/:canteenId/slots/book')
    .post(protect, authorize('student'), bookCanteenSlot);


export default router;