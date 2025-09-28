import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// ADDED: A sub-schema for a single 20-minute slot
const slotSubSchema = new mongoose.Schema({
  startTime: { type: String, required: true }, // e.g., "12:00 AM"
  endTime: { type: String, required: true },   // e.g., "12:20 AM"
  availableSeats: { type: Number, required: true, default: 0 },
  occupiedChairs: [{ type: Number }], // Array of chair numbers that are booked
  availableChairs: [{ type: Number }] // Array of chair numbers that are available
}, { _id: false }); // _id: false prevents Mongoose from creating IDs for sub-documents

// Sub-schemas for canvas layout
const borderSubSchema = new mongoose.Schema({
  id: { type: String, required: true },
  type: { type: String, enum: ['wall', 'boundary'], default: 'wall' },
  points: [{
    x: { type: Number, required: true },
    y: { type: Number, required: true }
  }],
  style: {
    color: { type: String, default: '#000000' },
    thickness: { type: Number, default: 2 }
  }
}, { _id: false });

const tableSubSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String },
  position: {
    x: { type: Number, required: true },
    y: { type: Number, required: true }
  },
  size: {
    width: { type: Number, default: 80 },
    height: { type: Number, default: 40 }
  },
  shape: { type: String, enum: ['rectangle', 'square', 'circle', 'oval'], default: 'rectangle' },
  rotation: { type: Number, default: 0 },
  style: {
    color: { type: String, default: '#8B4513' },
    borderColor: { type: String, default: '#654321' }
  }
}, { _id: false });

const chairSubSchema = new mongoose.Schema({
  id: { type: String, required: true },
  chairNumber: { type: Number, required: true },
  tableId: { type: String },
  position: {
    x: { type: Number, required: true },
    y: { type: Number, required: true }
  },
  size: {
    width: { type: Number, default: 30 },
    height: { type: Number, default: 30 }
  },
  rotation: { type: Number, default: 0 },
  style: {
    color: { type: String, default: '#4A90E2' },
    borderColor: { type: String, default: '#357ABD' }
  },
  isOccupied: { type: Boolean, default: false },
  bookingHistory: [{
    slotId: String,
    startTime: String,
    endTime: String,
    bookedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  }]
}, { _id: false });

const canteenLayoutSubSchema = new mongoose.Schema({
  canvas: {
    width: { type: Number, default: 800 },
    height: { type: Number, default: 600 },
    scale: { type: Number, default: 1 }
  },
  borders: [borderSubSchema],
  tables: [tableSubSchema],
  chairs: [chairSubSchema],
  metadata: {
    totalChairs: { type: Number, default: 0 },
    lastModified: { type: Date, default: Date.now },
    version: { type: Number, default: 1 }
  }
}, { _id: false });

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a name'],
    },
    email: {
      type: String,
      required: [true, 'Please add an email'],
      unique: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please add a valid email',
      ],
    },
    password: {
      type: String,
      required: [true, 'Please add a password'],
      minlength: 6,
      select: false,
    },
    role: {
      type: String,
      enum: ['student', 'canteen'],
      default: 'student',
    },
    // Student-specific details
    studentDetails: {
      studentId: { type: String },
      phone: { type: String },
      college: { type: String },
      address: { type: String },
    },
    // Canteen-specific details
    canteenDetails: {
      canteenName: {
        type: String,
        required: function () { return this.role === 'canteen'; },
      },
      canteenAddress: {
        type: String,
        required: function () { return this.role === 'canteen'; },
      },
      phone: { type: String },
      operatingHours: { type: String },
      // DEPRECATED: Keeping for backward compatibility, will be removed after migration
      numberOfSeats: {
        type: Number,
        default: 0,
      },
      // NEW: Canvas-based layout system
      canteenLayout: canteenLayoutSubSchema,
      // ADDED: An array to hold the 72 slots for a 24-hour period
      dailySlots: [slotSubSchema],
      cuisineTypes: { type: [String] },
      description: { type: String },
      isOpen: {
        type: Boolean,
        default: true,
      },
      profileImage: {
        type: String, // URL/path to the profile image
      },
    },
  },
  {
    timestamps: true,
  }
);

// Encrypt password using bcrypt
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Sign JWT and return
userSchema.methods.getSignedJwtToken = function () {
  const expiresIn = process.env.JWT_EXPIRE || '30d';
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: expiresIn,
  });
};

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export const User = mongoose.model('User', userSchema);