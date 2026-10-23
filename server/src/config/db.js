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
    // Sanitize connection URI for logging (mask passwords/credentials if present)
    const sanitizedUri = env.MONGODB_URI.replace(/\/\/([^:]+):([^@]+)@/, '//$1:***@');
    console.log(`[DB] Attempting MongoDB connection: ${sanitizedUri.split('?')[0]}`);

    const conn = await mongoose.connect(env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000
    });
    isConnected = true;
    console.log(`[DB] ✅ MongoDB Connected successfully to host: ${conn.connection.host} (db: ${conn.connection.name})`);
    return conn;
  } catch (error) {
    console.error(`[DB] ❌ MongoDB connection error: ${error.message}`);
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
