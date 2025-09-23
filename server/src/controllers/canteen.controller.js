import { User } from '../models/User.model.js';
import { MenuItem } from '../models/MenuItem.model.js';
import { Order } from '../models/Order.model.js';
import { Review } from '../models/Review.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import mongoose from 'mongoose';

const getAllCanteens = asyncHandler(async (req, res) => {
    const canteens = await User.find({ role: 'canteen' }).select('-password');
    res.status(200).json(canteens);
});

const getCanteenById = asyncHandler(async (req, res) => {
    const canteen = await User.findById(req.params.id).select('-password');
    if (canteen && canteen.role === 'canteen') {
        res.status(200).json(canteen);
    } else {
        res.status(404);
        throw new Error('Canteen not found');
    }
});

const getCanteenMenu = asyncHandler(async (req, res) => {
    const menuItems = await MenuItem.find({ canteen: req.params.id }).populate('canteen', 'canteenDetails');
    res.status(200).json(menuItems);
});

const getMyCanteenMenu = asyncHandler(async (req, res) => {
    const menuItems = await MenuItem.find({ canteen: req.user._id });
    res.status(200).json(menuItems);
});

const addMenuItem = asyncHandler(async (req, res) => {
    req.body.canteen = req.user._id;
    const menuItem = await MenuItem.create(req.body);
    res.status(201).json(menuItem);
});

const updateMenuItem = asyncHandler(async (req, res) => {
    let menuItem = await MenuItem.findById(req.params.itemId);
    if (!menuItem) {
        res.status(404);
        throw new Error('Menu item not found');
    }
    if (menuItem.canteen.toString() !== req.user.id) {
        res.status(401);
        throw new Error('Not authorized to update this menu item');
    }
    menuItem = await MenuItem.findByIdAndUpdate(req.params.itemId, req.body, {
        new: true,
        runValidators: true
    });
    res.status(200).json(menuItem);
});

const deleteMenuItem = asyncHandler(async (req, res) => {
    const menuItem = await MenuItem.findById(req.params.itemId);
    if (!menuItem) {
        res.status(404);
        throw new Error('Menu item not found');
    }
    if (menuItem.canteen.toString() !== req.user.id) {
        res.status(401);
        throw new Error('Not authorized to delete this menu item');
    }
    await menuItem.deleteOne();
    res.status(200).json({ success: true, data: {} });
});

const getMyCanteenOrders = asyncHandler(async (req, res) => {
    const activeStatuses = ['Placed', 'Accepted', 'Preparing', 'Ready'];
    const orders = await Order.find({ canteen: req.user._id, status: { $in: activeStatuses } })
        .populate('user', 'name')
        .populate('items.menuItem', 'name');
    res.status(200).json(orders);
});

const updateOrderStatus = asyncHandler(async (req, res) => {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);
    if (order && order.canteen.toString() === req.user.id.toString()) {
        order.status = status;
        order.statusHistory.push({ status: status, timestamp: new Date() });
        const updatedOrder = await order.save();
        res.status(200).json(updatedOrder);
    } else {
        res.status(404);
        throw new Error('Order not found or user not authorized');
    }
});

const getCompletedOrderHistory = asyncHandler(async (req, res) => {
    const canteenId = new mongoose.Types.ObjectId(req.user.id);
    
    try {
        const orderHistory = await Order.aggregate([
            { $match: { canteen: canteenId, status: 'Completed' } },
            { $lookup: { from: 'reviews', localField: '_id', foreignField: 'order', as: 'review' } },
            { $lookup: { from: 'users', localField: 'user', foreignField: '_id', as: 'userDetails' } },
            { $unwind: '$userDetails' },
            { $unwind: { path: '$review', preserveNullAndEmptyArrays: true } },
            { $lookup: { from: 'menuitems', localField: 'items.menuItem', foreignField: '_id', as: 'menuItemDetails' } },
            {
                $project: {
                    _id: 1, createdAt: 1, totalAmount: 1,
                    studentName: '$userDetails.name',
                    rating: '$review.rating', comment: '$review.comment',
                    products: '$menuItemDetails.name',
                    estimatedPrepTime: { $sum: '$menuItemDetails.prepTime' },
                    statusHistory: 1,
                }
            },
            { $sort: { createdAt: -1 } }
        ]);

        const processedHistory = orderHistory.map(order => {
            let actualPrepTime = null;
            if (order.statusHistory && order.statusHistory.length > 0) {
                const acceptedEntry = order.statusHistory.find(h => h.status === 'Accepted');
                const readyEntry = order.statusHistory.find(h => h.status === 'Ready');
                if (acceptedEntry && readyEntry) {
                    actualPrepTime = ((readyEntry.timestamp - acceptedEntry.timestamp) / (1000 * 60)).toFixed(2);
                }
            }
            return { ...order, actualPrepTime };
        });

        res.status(200).json(processedHistory);
    } catch (error) {
        console.error("!!! ERROR FETCHING ORDER HISTORY !!!", error);
        res.status(500).json({ message: "Failed to fetch order history.", error: error.message });
    }
});

const getCanteenAnalytics = asyncHandler(async (req, res) => {
    const canteenId = new mongoose.Types.ObjectId(req.user.id);
    const completedOrders = await Order.find({ canteen: canteenId, status: 'Completed' }).populate('items.menuItem', 'prepTime');
    const totalRevenue = completedOrders.reduce((acc, order) => acc + order.totalAmount, 0);
    const totalOrders = await Order.countDocuments({ canteen: canteenId });
    const uniqueCustomers = await Order.distinct('user', { canteen: canteenId });
    const reviews = await Review.find({ canteen: canteenId });
    const avgRating = reviews.length > 0
        ? (reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length).toFixed(1)
        : 0;
    let totalActualPrepTime = 0;
    let totalEstimatedPrepTime = 0;
    let ordersWithPrepTime = 0;
    completedOrders.forEach(order => {
        const acceptedEntry = order.statusHistory.find(h => h.status === 'Accepted');
        const readyEntry = order.statusHistory.find(h => h.status === 'Ready');
        const estimatedTime = order.items.reduce((acc, item) => acc + (item.menuItem?.prepTime || 0), 0);
        if (acceptedEntry && readyEntry) {
            totalActualPrepTime += (readyEntry.timestamp - acceptedEntry.timestamp) / (1000 * 60);
            totalEstimatedPrepTime += estimatedTime;
            ordersWithPrepTime++;
        }
    });
    const avgActualPrepTime = ordersWithPrepTime > 0 ? (totalActualPrepTime / ordersWithPrepTime).toFixed(2) : 0;
    const avgEstimatedPrepTime = ordersWithPrepTime > 0 ? (totalEstimatedPrepTime / ordersWithPrepTime).toFixed(2) : 0;
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const dailySales = await Order.aggregate([
        { $match: { canteen: canteenId, status: 'Completed', createdAt: { $gte: sevenDaysAgo } } },
        { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, totalSales: { $sum: "$totalAmount" }, totalOrders: { $sum: 1 } } },
        { $sort: { _id: 1 } }
    ]);
    const popularItems = await Order.aggregate([
        { $match: { canteen: canteenId, status: 'Completed' } }, { $unwind: "$items" },
        { $group: { _id: "$items.menuItem", count: { $sum: "$items.quantity" } } },
        { $sort: { count: -1 } }, { $limit: 5 },
        { $lookup: { from: 'menuitems', localField: '_id', foreignField: '_id', as: 'menuItemDetails' } },
        { $unwind: "$menuItemDetails" },
        { $project: { name: "$menuItemDetails.name", count: "$count" } }
    ]);
    res.status(200).json({
        kpi: {
            totalRevenue, totalOrders,
            avgRating: parseFloat(avgRating),
            activeCustomers: uniqueCustomers.length,
            avgActualPrepTime: parseFloat(avgActualPrepTime),
            avgEstimatedPrepTime: parseFloat(avgEstimatedPrepTime),
        },
        dailyData: dailySales,
        popularItems,
    });
});

const bookCanteenSlot = asyncHandler(async (req, res) => {
    const { canteenId } = req.params;
    const { startTime, seatsNeeded } = req.body;

    if (!startTime || !seatsNeeded) {
        res.status(400);
        throw new Error('Slot start time and number of seats are required.');
    }

    const canteen = await User.findById(canteenId);
    if (!canteen || canteen.role !== 'canteen') {
        res.status(404);
        throw new Error('Canteen not found.');
    }

    const slot = canteen.canteenDetails.dailySlots.find(s => s.startTime === startTime);

    if (!slot) {
        res.status(404);
        throw new Error('The selected time slot does not exist.');
    }

    if (slot.availableSeats < seatsNeeded) {
        res.status(400);
        throw new Error('Not enough available seats in this slot.');
    }

    // Decrement the available seats
    slot.availableSeats -= seatsNeeded;

    // Mark the array as modified so Mongoose knows to save the change
    canteen.markModified('canteenDetails.dailySlots');
    await canteen.save();

    res.status(200).json({
        success: true,
        message: 'Slot booked successfully!',
        slot: {
            startTime: slot.startTime,
            availableSeats: slot.availableSeats
        }
    });
});

export {
    getAllCanteens, getCanteenById, getCanteenMenu,
    getMyCanteenMenu, addMenuItem, updateMenuItem, deleteMenuItem,
    getMyCanteenOrders, updateOrderStatus, getCompletedOrderHistory,
    getCanteenAnalytics,
    bookCanteenSlot
};