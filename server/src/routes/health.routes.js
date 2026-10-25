import express from 'express';
import mongoose from 'mongoose';

const router = express.Router();

router.get('/health', (req, res) => {
  const dbState = mongoose.connection.readyState;
  // 0: disconnected, 1: connected, 2: connecting, 3: disconnecting
  const dbStatusMap = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' };

  res.json({
    success: true,
    data: {
      status: 'ok',
      service: 'HireMate Nexus API Server',
      database: dbStatusMap[dbState] || 'unknown',
      databaseConnected: dbState === 1,
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    }
  });
});

export default router;
