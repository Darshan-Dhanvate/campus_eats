import mongoose from 'mongoose';

// This sub-schema defines the structure of each item within an order
const orderItemSchema = new mongoose.Schema({
    menuItem: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MenuItem',
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
        min: 1,
    },
    price: {
        type: Number,
        required: true,
    },
});

const orderSchema = new mongoose.Schema(
    {
        // FIX: Changed 'studentId' to 'user' to match the controller
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        // FIX: Changed 'canteenId' to 'canteen' to match the controller
        canteen: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        items: [orderItemSchema], // Use the defined sub-schema
        totalAmount: {
            type: Number,
            required: true,
        },
        status: {
            type: String,
            required: true,
            enum: ['Placed', 'Accepted', 'Preparing', 'Ready', 'Completed', 'Cancelled'],
            default: 'Placed',
        },
        paymentMethod: {
            type: String,
            required: true,
            default: 'Card',
        },
        paymentStatus: {
            type: String,
            required: true,
            enum: ['Paid', 'Unpaid'],
            default: 'Paid',
        },
    },
    {
        timestamps: true,
    }
);

export const Order = mongoose.model('Order', orderSchema);

