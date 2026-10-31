import app from './app.js';
import { env } from './config/env.js';
import { connectDB } from './config/db.js';
import { cleanStaleJobsOnStartup } from './services/workflow.service.js';

const PORT = env.PORT || 5000;

export async function startServer(port = (env.NODE_ENV === 'test' ? 0 : PORT)) {
  const conn = await connectDB();
  if (conn) {
    try {
      await cleanStaleJobsOnStartup();
    } catch (cleanupErr) {
      console.warn('Startup stale job cleanup warning:', cleanupErr.message);
    }
  } else if (env.NODE_ENV === 'production') {
    console.error('Fatal: Database connection failed during startup. Aborting server start.');
    process.exit(1);
  }

  const server = app.listen(port, () => {
    console.log(`HireMate Nexus API server running on port ${port} [${env.NODE_ENV}]`);
  });
  return server;
}

if (process.env.NODE_ENV !== 'test') {
  startServer();
}
