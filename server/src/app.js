import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { env } from './config/env.js';
import healthRoutes from './routes/health.routes.js';
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import applicationRoutes from './routes/application.routes.js';
import resumeRoutes from './routes/resume.routes.js';
import jobAnalysisRoutes from './routes/jobAnalysis.routes.js';
import companyResearchRoutes from './routes/companyResearch.routes.js';
import roadmapRoutes from './routes/roadmap.routes.js';
import practiceRoutes from './routes/practice.routes.js';
import interviewPrepRoutes from './routes/interviewPrep.routes.js';
import readinessDashboardRoutes from './routes/readinessDashboard.routes.js';
import workflowRoutes from './routes/workflow.routes.js';
import { checkDbConnection } from './middleware/dbCheck.middleware.js';

const app = express();

app.use(helmet());
app.use(cors({
  origin: env.CLIENT_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']
}));

app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

// Lightweight cookie parser middleware
app.use((req, res, next) => {
  if (req.headers.cookie) {
    req.cookies = req.headers.cookie.split(';').reduce((acc, cookie) => {
      const [name, ...rest] = cookie.trim().split('=');
      if (name) acc[name] = decodeURIComponent(rest.join('='));
      return acc;
    }, {});
  } else {
    req.cookies = {};
  }
  next();
});

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1500,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.method === 'OPTIONS',
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests. Please try again later.'
    }
  }
});
app.use('/api/', generalLimiter);

// API v1 Routes
app.use('/api/v1', healthRoutes);
app.use('/api/v1/auth', checkDbConnection, authRoutes);

// Database-dependent routes: guard so queries fail-fast with 503 instead of buffering/hanging
app.use('/api/v1/users', checkDbConnection, userRoutes);
app.use('/api/v1/applications', checkDbConnection, applicationRoutes);
app.use('/api/v1/resumes', checkDbConnection, resumeRoutes);
app.use('/api/v1/jobs', jobAnalysisRoutes);
app.use('/api/v1/company', companyResearchRoutes);
app.use('/api/v1/roadmap', checkDbConnection, roadmapRoutes);
app.use('/api/v1/practice', checkDbConnection, practiceRoutes);
app.use('/api/v1/interview-prep', checkDbConnection, interviewPrepRoutes);
app.use('/api/v1/readiness', checkDbConnection, readinessDashboardRoutes);
app.use('/api/v1/workflow', checkDbConnection, workflowRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Route ${req.method} ${req.originalUrl} not found`
    }
  });
});

// Centralized Error Handling
app.use((err, req, res, next) => {
  const statusCode = err.status || err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    error: {
      code: err.code || 'INTERNAL_SERVER_ERROR',
      message: err.message || 'An unexpected error occurred.',
      ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
    }
  });
});

export default app;
