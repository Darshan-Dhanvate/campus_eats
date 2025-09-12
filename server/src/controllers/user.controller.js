import { User } from '../models/User.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';

/**
 * @description Get user profile
 * @route GET /api/v1/users/profile
 * @access Private
 */
const getUserProfile = asyncHandler(async (req, res) => {
  // The user object is attached to the request by the 'protect' middleware
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
  user.email = req.body.email || user.email;
  
  if (req.body.password) {
    user.password = req.body.password;
  }

  // Role-specific fields
  if (user.role === 'student') {
    user.studentDetails.studentId = req.body.studentId || user.studentDetails.studentId;
    user.studentDetails.phone = req.body.phone || user.studentDetails.phone;
    user.studentDetails.college = req.body.college || user.studentDetails.college;
    user.studentDetails.address = req.body.address || user.studentDetails.address;
  } else if (user.role === 'canteen') {
    // Canteen specific details from the body
    const { canteenName, ownerName, phone, address, operatingHours, cuisineTypes, description, isOpen } = req.body;
    
    // The main user 'name' is the owner's name
    user.name = ownerName || user.name;

    user.canteenDetails.canteenName = canteenName || user.canteenDetails.canteenName;
    user.canteenDetails.phone = phone || user.canteenDetails.phone;
    user.canteenDetails.address = address || user.canteenDetails.address;
    user.canteenDetails.operatingHours = operatingHours || user.canteenDetails.operatingHours;
    user.canteenDetails.cuisineTypes = cuisineTypes || user.canteenDetails.cuisineTypes;
    user.canteenDetails.description = description || user.canteenDetails.description;

    // Handle the open/closed toggle
    if (isOpen !== undefined) {
        user.canteenDetails.isOpen = isOpen;
    }
  }

  const updatedUser = await user.save();

  res.status(200).json({
    _id: updatedUser._id,
    name: updatedUser.name,
    email: updatedUser.email,
    role: updatedUser.role,
    studentDetails: updatedUser.studentDetails,
    canteenDetails: updatedUser.canteenDetails,
  });
});

export { getUserProfile, updateUserProfile };
