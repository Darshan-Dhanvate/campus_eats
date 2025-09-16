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
    if (!canteen || !totalAmount) {
        res.status(400);
        throw new Error('Missing required order information');
    }

    try {
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
    } catch (error) {
        // Log the error for the developer but send a clean message to the user
        console.error("!!! ERROR SAVING ORDER !!!", error);
        res.status(500).json({ message: "Failed to save the order to the database." });
    }
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

// @desc    Update order status
// @route   PUT /api/v1/orders/:id/status
// @access  Private (Canteen role required)
const updateOrderStatus = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);

    if (order) {
        if (order.canteen.toString() !== req.user._id.toString()) {
            res.status(403);
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
// @access  Private
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

