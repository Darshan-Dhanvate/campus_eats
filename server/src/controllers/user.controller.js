import { User } from '../models/User.model.js';
import { Order } from '../models/Order.model.js';
import { Review } from '../models/Review.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { addMinutes, addDays, format, parse } from 'date-fns';

const generateDailySlots = (operatingHours, canteenLayout) => {
  console.log('Operating Hours Passed to Function:', operatingHours); 
  console.log('Updating with layout chairs:', canteenLayout?.chairs?.length || 0);
  const allSlots = [];
  const baseDate = '2025-01-01';

  // Default to no operating hours if not properly set
  let openTime = null;
  let closeTime = null;

  if (operatingHours && operatingHours.includes(' - ')) {
    const [startTimeStr, endTimeStr] = operatingHours.split(' - ');
    try {
      openTime = parse(`${baseDate} ${startTimeStr}`, 'yyyy-MM-dd h:mm a', new Date());
      closeTime = parse(`${baseDate} ${endTimeStr}`, 'yyyy-MM-dd h:mm a', new Date());
      
      // Handle case where close time is before open time (next day)
      if (closeTime <= openTime) {
        closeTime = addDays(closeTime, 1);
      }
      
      console.log('Parsed times:', { 
        startTimeStr, 
        endTimeStr, 
        openTime: format(openTime, 'h:mm a'), 
        closeTime: format(closeTime, 'h:mm a') 
      });
    } catch (error) {
      console.error('Error parsing operating hours:', error, { startTimeStr, endTimeStr });
      openTime = null;
      closeTime = null;
    }
  }

  // If no valid operating hours, return empty slots
  if (!openTime || !closeTime) {
    console.log('No valid operating hours found, returning empty slots');
    return [];
  }

  // Get available chair numbers from layout (use chairNumber, not random id)
  const availableChairIds = canteenLayout?.chairs?.map(chair => chair.chairNumber) || [];
  const totalChairs = availableChairIds.length;

  // Only generate slots within operating hours
  for (let i = 0; i < 72; i++) {
    const minutesOffset = i * 20;
    const dayStart = parse(`${baseDate} 12:00 AM`, 'yyyy-MM-dd h:mm a', new Date());
    const slotStart = addMinutes(dayStart, minutesOffset);
    const slotEnd = addMinutes(slotStart, 20);
    const isWithinHours = slotStart >= openTime && slotStart < closeTime;

    if (isWithinHours) {
      allSlots.push({
        startTime: format(slotStart, 'h:mm a'),
        endTime: format(slotEnd, 'h:mm a'),
        availableSeats: totalChairs,
        availableChairs: [...availableChairIds],
        occupiedChairs: []
      });
    }
  }
  return allSlots;
};

const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');
  if (user) {
    res.status(200).json(user);
  } else {
    res.status(404);
    throw new Error('User not found.');
  }
});

const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error('User not found.');
  }

  user.name = req.body.name || user.name;
  if (req.body.password) {
    user.password = req.body.password;
  }

  if (user.role === 'student') {
    if (req.body.studentDetails) {
      user.studentDetails.phone = req.body.studentDetails.phone || user.studentDetails.phone;
    }
    if (req.body.phone) {
      user.studentDetails.phone = req.body.phone;
    }
  } else if (user.role === 'canteen') {
    const details = req.body.canteenDetails || {};
    let hasSlotInfoChanged = false;

    if (details.operatingHours && details.operatingHours !== user.canteenDetails.operatingHours) {
      user.canteenDetails.operatingHours = details.operatingHours;
      hasSlotInfoChanged = true;
    }
    if (details.numberOfSeats !== undefined && details.numberOfSeats !== user.canteenDetails.numberOfSeats) {
      user.canteenDetails.numberOfSeats = details.numberOfSeats;
      hasSlotInfoChanged = true;
    }

    user.canteenDetails.canteenName = details.canteenName || user.canteenDetails.canteenName;
    user.canteenDetails.canteenAddress = details.canteenAddress || user.canteenDetails.canteenAddress;
    if (req.body.phone !== undefined) {
      user.canteenDetails.phone = req.body.phone;
    }
    if (req.body.isOpen !== undefined) {
      user.canteenDetails.isOpen = req.body.isOpen;
    }

    if (hasSlotInfoChanged) {
      console.log('Slot info changed, regenerating slots with operating hours:', user.canteenDetails.operatingHours);
      // Clear existing slots first
      user.canteenDetails.dailySlots = [];
      user.markModified('canteenDetails.dailySlots');
      
      // Generate new slots
      user.canteenDetails.dailySlots = generateDailySlots(
        user.canteenDetails.operatingHours,
        user.canteenDetails.canteenLayout
      );
      console.log('Generated', user.canteenDetails.dailySlots.length, 'new slots');
    }
  }

  const updatedUser = await user.save();
  const userResponse = await User.findById(updatedUser._id).select('-password');

  res.status(200).json(userResponse);
});

const getStudentStats = asyncHandler(async (req, res) => {
  const studentId = req.user._id;

  const orders = await Order.find({ user: studentId, status: 'Completed' });
  const totalOrders = orders.length;
  const totalSpent = orders.reduce((acc, order) => acc + order.totalAmount, 0);

  const reviews = await Review.find({ user: studentId });
  const avgRating = reviews.length > 0
    ? (reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length).toFixed(1)
    : 0;

  res.status(200).json({
    totalOrders,
    totalSpent,
    avgRating,
  });
});

export { getUserProfile, updateUserProfile, getStudentStats, generateDailySlots };