import { User } from '../models/User.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';

/**
 * @description Get user profile
 * @route GET /api/v1/users/profile
 * @access Private
 */
const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');

  if (user) {
    res.status(200).json(user);
  } else {
    res.status(404);
    throw new Error('User not found.');
  }
});

/**
 * @description Update user profile
 * @route PUT /api/v1/users/profile
 * @access Private
 */
const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error('User not found.');
  }

  // Common fields for both students and canteens
  user.name = req.body.name || user.name;
  
  if (req.body.password) {
    user.password = req.body.password; // The pre-save hook will hash it
  }

  // Role-specific fields
  if (user.role === 'student') {
    user.studentDetails.phone = req.body.phone || user.studentDetails.phone;
    // Add other student fields as needed
  } else if (user.role === 'canteen') {
    const { canteenName, canteenAddress, phone, isOpen } = req.body;
    
    user.canteenDetails.canteenName = canteenName || user.canteenDetails.canteenName;
    user.canteenDetails.canteenAddress = canteenAddress || user.canteenDetails.canteenAddress;
    user.canteenDetails.phone = phone || user.canteenDetails.phone;

    // Handle the open/closed toggle
    if (isOpen !== undefined) {
        user.canteenDetails.isOpen = isOpen;
    }
  }

  const updatedUser = await user.save();

  // Return a comprehensive user object
  const userResponse = await User.findById(updatedUser._id).select('-password');

  res.status(200).json(userResponse);
});

export { getUserProfile, updateUserProfile };

