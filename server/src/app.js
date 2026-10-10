import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { env } from './config/env.js';
import healthRoutes from './routes/health.routes.js';
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

const app = express();

app.use(helmet());
app.use(cors({
  origin: env.CLIENT_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']
}));

app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests, please try again later.'
    }
  }
});
app.use('/api/', generalLimiter);

// API v1 Routes
app.use('/api/v1', healthRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/applications', applicationRoutes);
app.use('/api/v1/resumes', resumeRoutes);
app.use('/api/v1/jobs', jobAnalysisRoutes);
app.use('/api/v1/company', companyResearchRoutes);
app.use('/api/v1/roadmap', roadmapRoutes);
app.use('/api/v1/practice', practiceRoutes);
app.use('/api/v1/interview-prep', interviewPrepRoutes);
app.use('/api/v1/readiness', readinessDashboardRoutes);
app.use('/api/v1/workflow', workflowRoutes);

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
      ...(env.NODE_ENV === 'development' ? { stack: err.stack } : {})
    }
  });
});

export default app;
