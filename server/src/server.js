import app from './app.js';
import { env } from './config/env.js';
import { connectDB } from './config/db.js';

const PORT = env.PORT || 5000;

async function startServer() {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`HireMate Nexus API server running on port ${PORT} [${env.NODE_ENV}]`);
  });
}

startServer();
