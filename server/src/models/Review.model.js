import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    // FIX: Changed 'studentId' to 'user' to match other models
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // FIX: Changed 'canteenId' to 'canteen' to match other models
    canteen: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // FIX: Changed 'orderId' to 'order' to match other models
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
      unique: true, // A user should only be able to review an order once
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

export const Review = mongoose.model('Review', reviewSchema);

