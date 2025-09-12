import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import connectDB from './src/config/db.js';
import { notFound, errorHandler } from './src/middleware/error.middleware.js';

// Import Routes
import authRoutes from './src/routes/auth.routes.js';
import userRoutes from './src/routes/user.routes.js';
import canteenRoutes from './src/routes/canteen.routes.js';
import orderRoutes from './src/routes/order.routes.js';

// Load environment variables
dotenv.config({ path: './.env' });

// Connect to Database
connectDB();

const app = express();

// Middleware
// Enable CORS - Cross-Origin Resource Sharing
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173', // Allow frontend to connect
    credentials: true, // Allow cookies to be sent
  })
);

app.use(express.json({ limit: '16kb' })); // To parse JSON request bodies
app.use(express.urlencoded({ extended: true, limit: '16kb' })); // To parse URL-encoded data
app.use(cookieParser()); // To parse cookies

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/canteens', canteenRoutes);
app.use('/api/v1/orders', orderRoutes);

// Base Route
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Error Handling Middleware (should be the last thing to be used)
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(
    `🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`
  );
});

