import mongoose from 'mongoose';

/**
 * Middleware that ensures MongoDB connection is established before route handlers run.
 * Prevents Mongoose from silently buffering operations and timing out after 10000ms.
 */
export function checkDbConnection(req, res, next) {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      success: false,
      error: {
        code: 'DATABASE_UNAVAILABLE',
        message: 'Database is not connected. Please verify MongoDB connection settings.'
      }
    });
  }
  next();
}
