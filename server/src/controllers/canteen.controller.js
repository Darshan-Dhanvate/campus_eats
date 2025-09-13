import { User } from '../models/User.model.js';
import { MenuItem } from '../models/MenuItem.model.js';
import { Order } from '../models/Order.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import mongoose from 'mongoose';

// @desc    Get all canteens
// @route   GET /api/v1/canteens
// @access  Public
const getAllCanteens = asyncHandler(async (req, res) => {
    const canteens = await User.find({ role: 'canteen' }).select('-password');
    res.status(200).json(canteens);
});

// @desc    Get single canteen by ID
// @route   GET /api/v1/canteens/:id
// @access  Public
const getCanteenById = asyncHandler(async (req, res) => {
    const canteen = await User.findById(req.params.id).select('-password');
    if (canteen && canteen.role === 'canteen') {
        res.status(200).json(canteen);
    } else {
        res.status(404);
        throw new Error('Canteen not found');
    }
});

// @desc    Get a single canteen's menu
// @route   GET /api/v1/canteens/:id/menu
// @access  Public
const getCanteenMenu = asyncHandler(async (req, res) => {
    const menuItems = await MenuItem.find({ canteen: req.params.id }).populate('canteen', 'canteenDetails');
    res.status(200).json(menuItems);
});


// --- Canteen Owner Routes ---

// @desc    Get logged-in canteen's own menu
// @route   GET /api/v1/canteens/menu/my-menu
// @access  Private (Canteen)
const getMyCanteenMenu = asyncHandler(async (req, res) => {
    const menuItems = await MenuItem.find({ canteen: req.user._id });
    res.status(200).json(menuItems);
});

// @desc    Add a new menu item
// @route   POST /api/v1/canteens/menu
// @access  Private (Canteen)
const addMenuItem = asyncHandler(async (req, res) => {
    req.body.canteen = req.user._id;
    const menuItem = await MenuItem.create(req.body);
    res.status(201).json(menuItem);
});

// @desc    Update a menu item
// @route   PUT /api/v1/canteens/menu/:itemId
// @access  Private (Canteen)
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

// @desc    Delete a menu item
// @route   DELETE /api/v1/canteens/menu/:itemId
// @access  Private (Canteen)
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


// @desc    Get all orders for the logged-in canteen
// @route   GET /api/v1/canteens/orders
// @access  Private (Canteen)
const getMyCanteenOrders = asyncHandler(async (req, res) => {
    const orders = await Order.find({ canteen: req.user._id })
        .populate('user', 'name')
        .populate('items.menuItem', 'name');
    res.status(200).json(orders);
});

// @desc    Get analytics data for the logged-in canteen
// @route   GET /api/v1/canteens/analytics
// @access  Private (Canteen)
const getCanteenAnalytics = asyncHandler(async (req, res) => {
    const canteenId = new mongoose.Types.ObjectId(req.user.id);

    // 1. KPI Cards
    const completedOrders = await Order.find({ canteen: canteenId, status: 'Completed' });
    const totalRevenue = completedOrders.reduce((acc, order) => acc + order.totalAmount, 0);
    const totalOrders = await Order.countDocuments({ canteen: canteenId });
    const uniqueCustomers = await Order.distinct('user', { canteen: canteenId });

    // 2. Daily Sales for the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const dailySales = await Order.aggregate([
        { $match: { canteen: canteenId, status: 'Completed', createdAt: { $gte: sevenDaysAgo } } },
        {
            $group: {
                _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                totalSales: { $sum: "$totalAmount" },
                totalOrders: { $sum: 1 }
            }
        },
        { $sort: { _id: 1 } }
    ]);
    
    // 3. Popular Menu Items
    const popularItems = await Order.aggregate([
        { $match: { canteen: canteenId, status: 'Completed' } },
        { $unwind: "$items" },
        {
            $group: {
                _id: "$items.menuItem",
                count: { $sum: "$items.quantity" }
            }
        },
        { $sort: { count: -1 } },
        { $limit: 5 },
        {
            $lookup: {
                from: 'menuitems', // The actual collection name for MenuItem
                localField: '_id',
                foreignField: '_id',
                as: 'menuItemDetails'
            }
        },
        { $unwind: "$menuItemDetails" },
        {
            $project: {
                name: "$menuItemDetails.name",
                count: "$count"
            }
        }
    ]);


    res.status(200).json({
        kpi: {
            totalRevenue,
            totalOrders,
            avgRating: 4.6, // Placeholder, as review model is separate
            activeCustomers: uniqueCustomers.length
        },
        dailyData: dailySales,
        popularItems,
    });
});


export {
    getAllCanteens,
    getCanteenById,
    getCanteenMenu,
    getMyCanteenMenu,
    addMenuItem,
    updateMenuItem,
    deleteMenuItem,
    getMyCanteenOrders,
    getCanteenAnalytics // Export the new function
};

