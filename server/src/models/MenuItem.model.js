import mongoose from 'mongoose';

const menuItemSchema = new mongoose.Schema(
  {
    canteen: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Please add a name for the menu item'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please add a description'],
    },
    price: {
      type: Number,
      required: [true, 'Please add a price'],
    },
    category: {
      type: String,
      required: [true, 'Please add a category (e.g., Snacks, Main Course)'],
    },
    imageUrl: {
      type: String,
      // FIX: Removed the 'required' validation to make it optional
    },
    prepTime: {
      type: Number, // Preparation time in minutes
    },
    discountPercentage: {
      type: Number,
      default: 0,
      min: [0, 'Discount cannot be negative'],
      max: [100, 'Discount cannot exceed 100%'],
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export const MenuItem = mongoose.model('MenuItem', menuItemSchema);

