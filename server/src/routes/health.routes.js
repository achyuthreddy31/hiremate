import express from 'express';

const router = express.Router();

router.get('/health', (req, res) => {
  res.json({
    success: true,
    data: {
      status: 'ok',
      service: 'HireMate AI API Server',
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    }
  });
});

export default router;
