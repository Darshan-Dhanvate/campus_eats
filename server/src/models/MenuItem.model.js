import mongoose, { Schema } from 'mongoose';

const menuItemSchema = new Schema(
  {
    canteenId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true, // Index for faster queries by canteen
    },
    name: {
      type: String,
      required: [true, 'Item name is required.'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Item description is required.'],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Item price is required.'],
    },
    category: {
      type: String,
      required: [true, 'Item category is required.'],
      trim: true,
    },
    imageUrl: {
      type: String,
      required: [true, 'Item image is required.'],
    },
    prepTime: {
      type: Number, // Estimated preparation time in minutes
      required: true,
    },
    inStock: {
      type: Boolean,
      default: true,
    },
    tags: {
        type: [String], // e.g., ['veg', 'spicy', 'best-seller']
        default: []
    }
  },
  {
    timestamps: true,
  }
);

export const MenuItem = mongoose.model('MenuItem', menuItemSchema);

