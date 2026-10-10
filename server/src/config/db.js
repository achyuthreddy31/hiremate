import mongoose from 'mongoose';
import { env } from './env.js';

let isConnected = false;

export async function connectDB() {
  if (isConnected) return mongoose.connection;

  // In test mode without live DB, support graceful fallback / mock
  if (process.env.NODE_ENV === 'test' && !process.env.MONGODB_URI) {
    console.log('Test mode: Skipping live MongoDB connection');
    return null;
  }

  try {
    const conn = await mongoose.connect(env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000
    });
    isConnected = true;
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    if (env.NODE_ENV === 'production') {
      process.exit(1);
    }
    return null;
  }
}

export async function disconnectDB() {
  if (isConnected) {
    await mongoose.disconnect();
    isConnected = false;
  }
}
