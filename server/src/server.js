import app from './app.js';
import { env } from './config/env.js';

const PORT = env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`HireMate AI API server running on port ${PORT} [${env.NODE_ENV}]`);
});
