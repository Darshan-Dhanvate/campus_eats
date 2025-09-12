import mongoose, { Schema } from 'mongoose';

const orderItemSchema = new Schema({
  menuItemId: {
    type: Schema.Types.ObjectId,
    ref: 'MenuItem',
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Quantity cannot be less than 1.'],
  },
  // We store the price here to lock it in at the time of purchase
  price: {
    type: Number,
    required: true,
  },
  name: { // Store name for easier display in order history
    type: String,
    required: true,
  }
}, { _id: false }); // Don't create a separate _id for subdocuments

const orderSchema = new Schema(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    canteenId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    items: [orderItemSchema],
    totalAmount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: ['Placed', 'Accepted', 'Preparing', 'Ready for Pickup', 'Completed', 'Cancelled'],
      default: 'Placed',
    },
    paymentDetails: {
        paymentId: { type: String },
        status: { 
            type: String,
            enum: ['Pending', 'Completed', 'Failed'],
            default: 'Pending'
        },
        method: { type: String } // e.g., 'Card', 'UPI'
    },
    // Adding a unique, human-readable order ID
    orderId: {
      type: String,
      required: true,
      unique: true,
    }
  },
  {
    timestamps: true,
  }
);

export const Order = mongoose.model('Order', orderSchema);

