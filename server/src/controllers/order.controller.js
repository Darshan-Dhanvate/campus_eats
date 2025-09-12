import { Order } from '../models/Order.model.js';
import { Review } from '../models/Review.model.js';
import { MenuItem } from '../models/MenuItem.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// @desc    Create a new order
// @route   POST /api/v1/orders
// @access  Private (Student only)
const createOrder = asyncHandler(async (req, res) => {
  const { items, canteenId, totalAmount, paymentStatus } = req.body;

  if (!items || items.length === 0 || !canteenId || !totalAmount) {
    res.status(400);
    throw new Error('Missing required order information.');
  }

  // Ensure the user is a student
  if (req.user.role !== 'student') {
      res.status(403);
      throw new Error('Only students can place orders.');
  }

  const order = new Order({
    studentId: req.user._id,
    canteenId,
    items,
    totalAmount,
    paymentStatus: paymentStatus || 'Paid', // Default to 'Paid' assuming online payment
  });

  const createdOrder = await order.save();
  res.status(201).json(createdOrder);
});

// @desc    Get logged-in student's orders
// @route   GET /api/v1/orders/myorders
// @access  Private (Student only)
const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ studentId: req.user._id })
    .populate('canteenId', 'canteenDetails.canteenName')
    .populate('items.menuItem', 'name imageUrl')
    .sort({ createdAt: -1 });
    
  res.status(200).json(orders);
});

// @desc    Get order by ID
// @route   GET /api/v1/orders/:id
// @access  Private
const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate('studentId', 'name email')
    .populate('canteenId', 'canteenDetails.canteenName canteenDetails.address')
    .populate('items.menuItem', 'name price imageUrl');

  if (order) {
    // Authorization check: User must be the student who placed the order or the canteen owner
    if (
      order.studentId._id.toString() !== req.user._id.toString() &&
      order.canteenId._id.toString() !== req.user._id.toString()
    ) {
      res.status(403);
      throw new Error('Not authorized to view this order.');
    }
    res.status(200).json(order);
  } else {
    res.status(404);
    throw new Error('Order not found.');
  }
});

// @desc    Create a new review for an order
// @route   POST /api/v1/orders/:id/reviews
// @access  Private (Student only)
const addOrderReview = asyncHandler(async (req, res) => {
    const { rating, comment } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
        res.status(404);
        throw new Error('Order not found.');
    }
    
    // Authorization check
    if (order.studentId.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error('Not authorized to review this order.');
    }

    // Check if the order is completed
    if (order.status !== 'Completed') {
        res.status(400);
        throw new Error('You can only review completed orders.');
    }

    // Check if the order has already been reviewed
    if (order.isReviewed) {
        res.status(400);
        throw new Error('This order has already been reviewed.');
    }

    const review = new Review({
        studentId: req.user._id,
        canteenId: order.canteenId,
        orderId: req.params.id,
        rating,
        comment,
    });

    await review.save();

    order.isReviewed = true;
    await order.save();

    res.status(201).json({ message: 'Review added successfully.' });
});

export { createOrder, getMyOrders, getOrderById, addOrderReview };

