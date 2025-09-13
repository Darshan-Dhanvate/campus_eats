import { Order } from '../models/Order.model.js';
import { Review } from '../models/Review.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// @desc    Create new order
// @route   POST /api/v1/orders
// @access  Private
const createOrder = asyncHandler(async (req, res) => {
    const { canteen, items, totalAmount, paymentMethod, paymentStatus } = req.body;

    if (!items || items.length === 0) {
        res.status(400);
        throw new Error('No order items provided');
    }

    const order = new Order({
        user: req.user._id,
        canteen,
        items,
        totalAmount,
        paymentMethod: paymentMethod || 'Card',
        paymentStatus: paymentStatus || 'Paid',
    });

    const createdOrder = await order.save();
    res.status(201).json(createdOrder);
});

// @desc    Get logged in user's orders
// @route   GET /api/v1/orders/my-orders
// @access  Private
const getMyOrders = asyncHandler(async (req, res) => {
    const orders = await Order.find({ user: req.user._id })
        .populate('canteen', 'canteenDetails')
        .populate('items.menuItem', 'name');
    res.status(200).json(orders);
});

// @desc    Update order status (for canteen owners)
// @route   PUT /api/v1/orders/:id/status
// @access  Private (Canteen)
const updateOrderStatus = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);

    if (order) {
        // Security Check: Ensure the user updating the order is the owner of the canteen for that order.
        if (order.canteen.toString() !== req.user._id.toString()) {
            res.status(403); // 403 Forbidden is more appropriate than 401 Unauthorized
            throw new Error('User not authorized to update this order');
        }

        order.status = req.body.status || order.status;
        const updatedOrder = await order.save();
        res.json(updatedOrder);
    } else {
        res.status(404);
        throw new Error('Order not found');
    }
});

// @desc    Add a review to an order
// @route   POST /api/v1/orders/:orderId/review
// @access  Private (Student)
const addOrderReview = asyncHandler(async (req, res) => {
    const { rating, comment } = req.body;
    const { orderId } = req.params;

    const order = await Order.findById(orderId);

    if (!order) {
        res.status(404);
        throw new Error('Order not found');
    }
    if (order.user.toString() !== req.user._id.toString()) {
        res.status(401);
        throw new Error('Not authorized to review this order');
    }
    if (order.status !== 'Completed') {
        res.status(400);
        throw new Error('Order is not yet completed');
    }
    const existingReview = await Review.findOne({ order: orderId });
    if (existingReview) {
        res.status(400);
        throw new Error('Order already reviewed');
    }

    const review = await Review.create({
        user: req.user._id,
        canteen: order.canteen,
        order: orderId,
        rating,
        comment,
    });
    
    res.status(201).json(review);
});


export { createOrder, getMyOrders, updateOrderStatus, addOrderReview };

