import { User } from '../models/User.model.js';
import { MenuItem } from '../models/MenuItem.model.js';
import { Order } from '../models/Order.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';

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

// @desc    Get a canteen's menu
// @route   GET /api/v1/canteens/:id/menu
// @access  Public
const getCanteenMenu = asyncHandler(async (req, res) => {
    const menuItems = await MenuItem.find({ canteenId: req.params.id });
    res.status(200).json(menuItems);
});

// @desc    Get logged-in canteen's menu
// @route   GET /api/v1/canteens/my-menu
// @access  Private/Canteen
const getMyCanteenMenu = asyncHandler(async (req, res) => {
    const menuItems = await MenuItem.find({ canteenId: req.user.id });
    res.status(200).json(menuItems);
});


// @desc    Add a new menu item
// @route   POST /api/v1/canteens/my-menu
// @access  Private/Canteen
const addMenuItem = asyncHandler(async (req, res) => {
    const { name, description, price, category, prepTime, inStock } = req.body;

    const menuItem = new MenuItem({
        canteenId: req.user.id,
        name,
        description,
        price,
        category,
        prepTime,
        inStock,
    });

    const createdMenuItem = await menuItem.save();
    res.status(201).json(createdMenuItem);
});

// @desc    Update a menu item
// @route   PUT /api/v1/canteens/my-menu/:itemId
// @access  Private/Canteen
const updateMenuItem = asyncHandler(async (req, res) => {
    const { name, description, price, category, prepTime, inStock } = req.body;

    const menuItem = await MenuItem.findById(req.params.itemId);

    if (menuItem && menuItem.canteenId.toString() === req.user.id.toString()) {
        menuItem.name = name || menuItem.name;
        menuItem.description = description || menuItem.description;
        menuItem.price = price || menuItem.price;
        menuItem.category = category || menuItem.category;
        menuItem.prepTime = prepTime || menuItem.prepTime;
        menuItem.inStock = inStock !== undefined ? inStock : menuItem.inStock;

        const updatedMenuItem = await menuItem.save();
        res.status(200).json(updatedMenuItem);
    } else {
        res.status(404);
        throw new Error('Menu item not found or user not authorized');
    }
});

// @desc    Delete a menu item
// @route   DELETE /api/v1/canteens/my-menu/:itemId
// @access  Private/Canteen
const deleteMenuItem = asyncHandler(async (req, res) => {
    const menuItem = await MenuItem.findById(req.params.itemId);

    if (menuItem && menuItem.canteenId.toString() === req.user.id.toString()) {
        await menuItem.deleteOne();
        res.status(200).json({ message: 'Menu item removed' });
    } else {
        res.status(404);
        throw new Error('Menu item not found or user not authorized');
    }
});

// @desc    Get all orders for the logged-in canteen
// @route   GET /api/v1/canteens/my-orders
// @access  Private/Canteen
const getMyCanteenOrders = asyncHandler(async (req, res) => {
    const orders = await Order.find({ canteenId: req.user.id }).populate('studentId', 'name email');
    res.status(200).json(orders);
});

// @desc    Update order status
// @route   PUT /api/v1/canteens/my-orders/:orderId
// @access  Private/Canteen
const updateOrderStatus = asyncHandler(async (req, res) => {
    const { status } = req.body;
    const order = await Order.findById(req.params.orderId);

    if (order && order.canteenId.toString() === req.user.id.toString()) {
        order.status = status;
        const updatedOrder = await order.save();
        res.status(200).json(updatedOrder);
    } else {
        res.status(404);
        throw new Error('Order not found or user not authorized');
    }
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
    updateOrderStatus
};

