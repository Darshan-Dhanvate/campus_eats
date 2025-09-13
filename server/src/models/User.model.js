import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

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
      cuisineTypes: { type: [String] },
      description: { type: String },
      isOpen: {
        type: Boolean,
        default: true,
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

