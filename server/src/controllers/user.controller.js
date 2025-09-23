import { User } from '../models/User.model.js';
import { Order } from '../models/Order.model.js';
import { Review } from '../models/Review.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { addMinutes, format, parse } from 'date-fns';

const generateDailySlots = (operatingHours, numberOfSeats) => {
  console.log('Operating Hours Passed to Function:', operatingHours); 
  console.log('Updating Seats', numberOfSeats);
  const allSlots = [];
  const baseDate = '2025-01-01';

  let openTime = parse(`${baseDate} 11:59 PM`, 'yyyy-MM-dd h:mm a', new Date());
  let closeTime = parse(`${baseDate} 11:59 PM`, 'yyyy-MM-dd h:mm a', new Date());

  if (operatingHours && operatingHours.includes(' - ')) {
    const [startTimeStr, endTimeStr] = operatingHours.split(' - ');
    openTime = parse(`${baseDate} ${startTimeStr}`, 'yyyy-MM-dd h:mm a', new Date());
    closeTime = parse(`${baseDate} ${endTimeStr}`, 'yyyy-MM-dd h:mm a', new Date());
  }

  for (let i = 0; i < 72; i++) {
    const minutesOffset = i * 20;
    const dayStart = parse(`${baseDate} 12:00 AM`, 'yyyy-MM-dd h:mm a', new Date());
    const slotStart = addMinutes(dayStart, minutesOffset);
    const slotEnd = addMinutes(slotStart, 20);
    const isWithinHours = slotStart >= openTime && slotStart < closeTime;

    allSlots.push({
      startTime: format(slotStart, 'h:mm a'),
      endTime: format(slotEnd, 'h:mm a'),
      availableSeats: isWithinHours ? numberOfSeats : 0,
    });
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
      user.canteenDetails.dailySlots = generateDailySlots(
        user.canteenDetails.operatingHours,
        // 👇 THIS IS THE FIX: Use the updated value from the user object
        user.canteenDetails.numberOfSeats 
      );
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

export { getUserProfile, updateUserProfile, getStudentStats };