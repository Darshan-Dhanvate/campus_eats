import { User } from '../models/User.model.js';
import { MenuItem } from '../models/MenuItem.model.js';
import { Order } from '../models/Order.model.js';
import { Review } from '../models/Review.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import mongoose from 'mongoose';
import fs from 'fs';

const getAllCanteens = asyncHandler(async (req, res) => {
    const canteens = await User.find({ role: 'canteen' }).select('-password');
    res.status(200).json(canteens);
});

const getCanteenById = asyncHandler(async (req, res) => {
    const canteen = await User.findById(req.params.id).select('-password');
    if (canteen && canteen.role === 'canteen') {
        // TEMPORARY: Convert string chairIds to numbers in existing data
        let dataUpdated = false;
        if (canteen.canteenDetails?.dailySlots) {
            canteen.canteenDetails.dailySlots.forEach(slot => {
                if (slot.occupiedChairs && slot.occupiedChairs.length > 0) {
                    const originalChairs = [...slot.occupiedChairs];
                    slot.occupiedChairs = slot.occupiedChairs.map(chairId => {
                        const numId = typeof chairId === 'string' ? parseInt(chairId, 10) : chairId;
                        if (typeof chairId === 'string') dataUpdated = true;
                        return numId;
                    });
                    console.log(`🔄 Converted chairs from [${originalChairs.join(', ')}] to [${slot.occupiedChairs.join(', ')}]`);
                }
            });
        }
        
        // Save the updated data if needed
        if (dataUpdated) {
            await canteen.save();
            console.log('💾 Saved converted chair IDs to database');
        }
        
        // Log slot data being returned
        console.log(`📤 Returning canteen data for ${canteen.canteenDetails?.canteenName}`);
        if (canteen.canteenDetails?.dailySlots) {
            const slotsWithBookings = canteen.canteenDetails.dailySlots.filter(s => s.occupiedChairs?.length > 0);
            console.log(`📊 Slots with bookings (${slotsWithBookings.length}):`, 
                slotsWithBookings.map(s => ({ 
                    startTime: s.startTime, 
                    occupiedChairs: s.occupiedChairs,
                    occupiedChairTypes: s.occupiedChairs.map(c => typeof c),
                    availableSeats: s.availableSeats 
                }))
            );
        }
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
        // Get completed orders with proper population for receipt modal compatibility
        const orders = await Order.find({ canteen: canteenId, status: 'Completed' })
            .populate('user', 'name')
            .populate('canteen', 'canteenDetails')
            .populate('items.menuItem', 'name price')
            .sort({ createdAt: -1 });

        // Get reviews for these orders
        const orderIds = orders.map(order => order._id);
        const reviews = await Review.find({ order: { $in: orderIds } });
        const reviewMap = {};
        reviews.forEach(review => {
            reviewMap[review.order.toString()] = review;
        });

        const processedHistory = orders.map(order => {
            let actualPrepTime = null;
            if (order.statusHistory && order.statusHistory.length > 0) {
                const acceptedEntry = order.statusHistory.find(h => h.status === 'Accepted');
                const readyEntry = order.statusHistory.find(h => h.status === 'Ready');
                if (acceptedEntry && readyEntry) {
                    actualPrepTime = ((readyEntry.timestamp - acceptedEntry.timestamp) / (1000 * 60)).toFixed(2);
                }
            }

            const review = reviewMap[order._id.toString()];
            const estimatedPrepTime = order.items.reduce((sum, item) => sum + (item.menuItem.prepTime || 0), 0);

            return {
                _id: order._id,
                createdAt: order.createdAt,
                totalAmount: order.totalAmount,
                status: order.status,
                items: order.items,
                canteen: order.canteen,
                deliverySlot: order.deliverySlot,
                statusHistory: order.statusHistory,
                studentName: order.user.name,
                rating: review ? review.rating : null,
                comment: review ? review.comment : null,
                products: order.items.map(item => item.menuItem.name),
                estimatedPrepTime,
                actualPrepTime
            };
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
    const { startTime, chairIds } = req.body; // Changed from seatsNeeded to chairIds

    if (!startTime || !chairIds || !Array.isArray(chairIds) || chairIds.length === 0) {
        res.status(400);
        throw new Error('Slot start time and chair IDs are required.');
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

    // Check if all requested chairs are available
    const alreadyOccupied = chairIds.filter(chairId => 
        slot.occupiedChairs.includes(chairId)
    );

    if (alreadyOccupied.length > 0) {
        res.status(400);
        throw new Error(`Chairs ${alreadyOccupied.join(', ')} are already occupied in this slot.`);
    }

    // Validate that all chairs exist in the layout
    const layout = canteen.canteenDetails.canteenLayout;
    if (layout && layout.chairs) {
        const layoutChairIds = layout.chairs.map(chair => chair.chairNumber);
        const invalidChairs = chairIds.filter(chairId => 
            !layoutChairIds.includes(chairId)
        );

        if (invalidChairs.length > 0) {
            res.status(400);
            throw new Error(`Invalid chair IDs: ${invalidChairs.join(', ')}`);
        }
    }

    // Book the chairs
    console.log('🔴 BEFORE booking - occupiedChairs:', slot.occupiedChairs);
    console.log('🟢 BEFORE booking - availableChairs:', slot.availableChairs);
    console.log('📝 Booking chair IDs:', chairIds, 'types:', chairIds.map(id => typeof id));
    
    slot.occupiedChairs.push(...chairIds);
    slot.availableChairs = slot.availableChairs.filter(chairId => 
        !chairIds.includes(chairId)
    );

    console.log('🔴 AFTER booking - occupiedChairs:', slot.occupiedChairs);
    console.log('🟢 AFTER booking - availableChairs:', slot.availableChairs);

    // Update backward compatibility field
    slot.availableSeats = slot.availableChairs.length;

    // Update chair booking history in layout
    if (layout && layout.chairs) {
        chairIds.forEach(chairId => {
            const chair = layout.chairs.find(c => c.chairNumber === chairId);
            if (chair) {
                if (!chair.bookingHistory) chair.bookingHistory = [];
                chair.bookingHistory.push({
                    slotId: slot._id,
                    startTime: slot.startTime,
                    endTime: slot.endTime,
                    bookedBy: req.user._id
                });
                chair.isOccupied = true;
            }
        });
        canteen.markModified('canteenDetails.canteenLayout');
    }

    // Mark the array as modified so Mongoose knows to save the change
    canteen.markModified('canteenDetails.dailySlots');
    await canteen.save();

    res.status(200).json({
        success: true,
        message: `Successfully booked ${chairIds.length} chair(s)!`,
        bookedChairs: chairIds,
        slot: {
            startTime: slot.startTime,
            availableSeats: slot.availableSeats,
            occupiedChairs: slot.occupiedChairs,
            availableChairs: slot.availableChairs
        }
    });
});

// @desc    Upload menu item image
// @route   POST /api/v1/canteens/upload/menu-item-image
// @access  Private (Canteen)
const uploadMenuItemImage = asyncHandler(async (req, res) => {
    console.log('\n=== UPLOAD CONTROLLER ===');
    console.log('User:', req.user ? `${req.user.name} (${req.user._id})` : 'No user (auth disabled / optional)');
    console.log('File received:', !!req.file);
    console.log('File details:', req.file ? {
        filename: req.file.filename,
        size: req.file.size,
        mimetype: req.file.mimetype,
        destination: req.file.destination
    } : 'No file');
    
    if (!req.file) {
        console.log('ERROR: No file provided (controller)');
        return res.status(400).json({ success: false, error: 'No image file provided' });
    }

    try {
        // Build absolute & relative URLs
        const base = process.env.BASE_URL || 'http://localhost:8000';
        const relativeUrl = `/images/menu-items/${req.file.filename}`;
        const absoluteUrl = `${base}${relativeUrl}`;
        console.log('SUCCESS: Returning image URL', { relativeUrl, absoluteUrl });

        return res.status(200).json({
            success: true,
            message: 'Image uploaded successfully',
            imageUrl: relativeUrl,
            absoluteUrl,
            filename: req.file.filename
        });
    } catch (e) {
        console.error('UNEXPECTED ERROR in uploadMenuItemImage controller:', e);
        return res.status(500).json({ success: false, error: 'Unexpected error processing image' });
    }
});

// @desc    Upload canteen profile image
// @route   POST /api/v1/canteens/upload/profile-image
// @access  Private (Canteen)
const uploadCanteenProfileImage = asyncHandler(async (req, res) => {
    if (!req.file) {
        res.status(400);
        throw new Error('No image file provided');
    }

    const imageUrl = `/images/canteen-profiles/${req.file.filename}`;

    // Update canteen profile with new image
    const canteen = await User.findById(req.user._id);
    if (canteen) {
        // Delete old profile image if exists
        if (canteen.canteenDetails.profileImage) {
            try {
                const oldImagePath = `public${canteen.canteenDetails.profileImage}`;
                if (fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath);
                }
            } catch (error) {
                console.log('Error deleting old profile image:', error);
            }
        }

        canteen.canteenDetails.profileImage = imageUrl;
        await canteen.save();
    }

    res.status(200).json({
        success: true,
        message: 'Profile image updated successfully',
        imageUrl,
        filename: req.file.filename
    });
});

// @desc    Save canteen layout
// @route   PUT /api/v1/canteens/layout
// @access  Private (Canteen)
const saveCanteenLayout = asyncHandler(async (req, res) => {
    const { layout } = req.body;

    if (!layout) {
        res.status(400);
        throw new Error('Layout data is required.');
    }

    // Validate layout structure
    if (!layout.canvas || !layout.chairs || !Array.isArray(layout.chairs)) {
        res.status(400);
        throw new Error('Invalid layout structure.');
    }

    const canteen = await User.findById(req.user._id);
    if (!canteen || canteen.role !== 'canteen') {
        res.status(404);
        throw new Error('Canteen not found.');
    }

    // Update the layout
    canteen.canteenDetails.canteenLayout = layout;
    
    // Regenerate slots with new chair layout and operating hours restrictions
    const { generateDailySlots } = await import('./user.controller.js');
    console.log('Regenerating slots for layout change with operating hours:', canteen.canteenDetails.operatingHours);
    canteen.canteenDetails.dailySlots = generateDailySlots(
        canteen.canteenDetails.operatingHours,
        canteen.canteenDetails.canteenLayout
    );

    canteen.markModified('canteenDetails.canteenLayout');
    canteen.markModified('canteenDetails.dailySlots');
    await canteen.save();

    res.status(200).json({
        success: true,
        message: 'Layout saved successfully!',
        layout: canteen.canteenDetails.canteenLayout
    });
});

// @desc    Get canteen layout
// @route   GET /api/v1/canteens/layout
// @access  Private (Canteen)
const getCanteenLayout = asyncHandler(async (req, res) => {
    const canteen = await User.findById(req.user._id);
    if (!canteen || canteen.role !== 'canteen') {
        res.status(404);
        throw new Error('Canteen not found.');
    }

    const layout = canteen.canteenDetails.canteenLayout || {
        canvas: { width: 800, height: 600, scale: 1 },
        borders: [],
        tables: [],
        chairs: [],
        metadata: { totalChairs: 0, lastModified: new Date(), version: 1 }
    };

    res.status(200).json({
        success: true,
        layout
    });
});

// @desc    Get canteen layout for students (public)
// @route   GET /api/v1/canteens/:canteenId/layout
// @access  Public
const getCanteenLayoutPublic = asyncHandler(async (req, res) => {
    const { canteenId } = req.params;
    
    const canteen = await User.findById(canteenId);
    if (!canteen || canteen.role !== 'canteen') {
        res.status(404);
        throw new Error('Canteen not found.');
    }

    const layout = canteen.canteenDetails.canteenLayout || {
        canvas: { width: 800, height: 600, scale: 1 },
        borders: [],
        tables: [],
        chairs: [],
        metadata: { totalChairs: 0, lastModified: new Date(), version: 1 }
    };

    // Include real-time chair availability for the current slots
    const currentTime = new Date();
    const currentSlot = canteen.canteenDetails.dailySlots.find(slot => {
        // This is a simplified check - you might want more sophisticated time matching
        const slotStart = new Date();
        const [time, period] = slot.startTime.split(' ');
        const [hours, minutes] = time.split(':');
        let hour24 = parseInt(hours);
        if (period === 'PM' && hour24 !== 12) hour24 += 12;
        if (period === 'AM' && hour24 === 12) hour24 = 0;
        slotStart.setHours(hour24, parseInt(minutes), 0, 0);
        
        const slotEnd = new Date(slotStart);
        slotEnd.setMinutes(slotEnd.getMinutes() + 20);
        
        return currentTime >= slotStart && currentTime <= slotEnd;
    });

    if (currentSlot && layout.chairs) {
        layout.chairs.forEach(chair => {
            chair.isOccupied = currentSlot.occupiedChairs.includes(chair.id);
        });
    }

    res.status(200).json({
        success: true,
        layout,
        canteenName: canteen.canteenDetails.canteenName
    });
});

export {
    getAllCanteens, getCanteenById, getCanteenMenu,
    getMyCanteenMenu, addMenuItem, updateMenuItem, deleteMenuItem,
    getMyCanteenOrders, updateOrderStatus, getCompletedOrderHistory,
    getCanteenAnalytics,
    bookCanteenSlot,
    uploadMenuItemImage, uploadCanteenProfileImage,
    saveCanteenLayout, getCanteenLayout, getCanteenLayoutPublic
};