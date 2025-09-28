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
        // Security Check
        if (order.canteen.toString() !== req.user._id.toString()) {
            res.status(403);
            throw new Error('User not authorized to update this order');
        }

        const newStatus = req.body.status;
        if (newStatus) {
            order.status = newStatus;
            // FIX: Add the new status change to the history array
            order.statusHistory.push({ status: newStatus, timestamp: new Date() });
        }
        
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


// @desc    Get spending analysis for logged in user
// @route   GET /api/v1/orders/spending-analysis
// @access  Private
const getSpendingAnalysis = asyncHandler(async (req, res) => {
    const { period = 'monthly' } = req.query;
    const userId = req.user._id;
    
    let dateFilter = {};
    let groupBy = {};
    
    const now = new Date();
    
    switch (period) {
        case 'weekly':
            const startOfWeek = new Date(now);
            startOfWeek.setDate(now.getDate() - now.getDay());
            startOfWeek.setHours(0, 0, 0, 0);
            dateFilter = { createdAt: { $gte: startOfWeek } };
            groupBy = { $dayOfWeek: '$createdAt' };
            break;
        case 'yearly':
            const startOfYear = new Date(now.getFullYear(), 0, 1);
            dateFilter = { createdAt: { $gte: startOfYear } };
            groupBy = { $month: '$createdAt' };
            break;
        default: // monthly
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            dateFilter = { createdAt: { $gte: startOfMonth } };
            groupBy = { $dayOfMonth: '$createdAt' };
    }
    
    // Get completed orders for the user in the specified period
    const orders = await Order.find({
        user: userId,
        status: 'Completed',
        ...dateFilter
    }).populate('canteen', 'canteenDetails').populate('items.menuItem', 'name category');
    
    // Calculate summary
    const totalSpent = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    const totalOrders = orders.length;
    const avgOrderValue = totalOrders > 0 ? (totalSpent / totalOrders).toFixed(2) : 0;
    
    // Time-based data
    const timeData = [];
    if (period === 'weekly') {
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        for (let i = 0; i < 7; i++) {
            const dayOrders = orders.filter(order => new Date(order.createdAt).getDay() === i);
            const dayAmount = dayOrders.reduce((sum, order) => sum + order.totalAmount, 0);
            timeData.push({ period: days[i], amount: dayAmount });
        }
    } else if (period === 'monthly') {
        for (let i = 1; i <= new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate(); i += 5) {
            const periodOrders = orders.filter(order => {
                const day = new Date(order.createdAt).getDate();
                return day >= i && day < i + 5;
            });
            const periodAmount = periodOrders.reduce((sum, order) => sum + order.totalAmount, 0);
            timeData.push({ period: `${i}-${i+4}`, amount: periodAmount });
        }
    } else { // yearly
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        for (let i = 0; i < 12; i++) {
            const monthOrders = orders.filter(order => new Date(order.createdAt).getMonth() === i);
            const monthAmount = monthOrders.reduce((sum, order) => sum + order.totalAmount, 0);
            timeData.push({ period: months[i], amount: monthAmount });
        }
    }
    
    // Category data
    const categoryMap = {};
    orders.forEach(order => {
        order.items.forEach(item => {
            const category = item.menuItem.category || 'Other';
            const amount = item.price * item.quantity;
            categoryMap[category] = (categoryMap[category] || 0) + amount;
        });
    });
    
    const categoryData = Object.entries(categoryMap).map(([name, amount]) => ({
        name,
        amount: Math.round(amount)
    }));
    
    // Top canteens
    const canteenMap = {};
    orders.forEach(order => {
        const canteenName = order.canteen.canteenDetails.canteenName;
        if (!canteenMap[canteenName]) {
            canteenMap[canteenName] = { name: canteenName, amount: 0, orders: 0 };
        }
        canteenMap[canteenName].amount += order.totalAmount;
        canteenMap[canteenName].orders += 1;
    });
    
    const topCanteens = Object.values(canteenMap)
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 5)
        .map(canteen => ({
            ...canteen,
            amount: Math.round(canteen.amount)
        }));
    
    res.json({
        summary: {
            totalSpent: Math.round(totalSpent),
            totalOrders,
            avgOrderValue: Math.round(avgOrderValue)
        },
        timeData,
        categoryData,
        topCanteens
    });
});

export { createOrder, getMyOrders, updateOrderStatus, addOrderReview, getSpendingAnalysis };

