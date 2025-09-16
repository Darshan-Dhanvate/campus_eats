import mongoose from 'mongoose';

// A new sub-schema to track the history of each status change
const statusHistorySchema = new mongoose.Schema({
    status: {
        type: String,
        required: true,
        enum: ['Placed', 'Accepted', 'Preparing', 'Ready', 'Completed', 'Cancelled'],
    },
    timestamp: {
        type: Date,
        default: Date.now,
    },
}, { _id: false }); // We don't need separate IDs for history entries

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
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        canteen: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        items: [orderItemSchema],
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
        // FIX: Add the new field to store the history of status changes
        statusHistory: [statusHistorySchema],
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

// Mongoose middleware to automatically add the initial status to the history
orderSchema.pre('save', function(next) {
    // If the document is new, add the 'Placed' status to its history
    if (this.isNew) {
        this.statusHistory.push({ status: 'Placed', timestamp: new Date() });
    }
    next();
});

export const Order = mongoose.model('Order', orderSchema);

