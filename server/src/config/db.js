import mongoose from 'mongoose';

/**
 * Establishes a connection to the MongoDB database.
 * The function uses the MONGO_URI from the environment variables.
 * It will log a success message upon a successful connection or
 * log an error and exit the process if the connection fails.
 */
const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(process.env.MONGO_URI);
    console.log(`\n📄 MongoDB connected! DB HOST: ${connectionInstance.connection.host}`);
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error);
    process.exit(1); // Exit the application with a failure code
  }
};

export default connectDB;

