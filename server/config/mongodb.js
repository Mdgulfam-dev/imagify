import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    mongoose.connection.on('connected', () => {
      console.log('MongoDB connected');
    });
    mongoose.connection.on('error', (err) => {
      console.error(' MongoDB error:', err);
    });
    mongoose.connection.on('disconnected', () => {
      console.log(' MongoDB disconnected');
    });

    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
    });
  } catch (err) {
    throw new Error(`MongoDB connection failed: ${err.message}`);
  }
};

export default connectDB;
