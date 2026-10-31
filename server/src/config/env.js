import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { z } from 'zod';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load root .env
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).default('5000'),
  CLIENT_URL: z.string().url().default('http://localhost:5173'),
  MONGODB_URI: z.string().default('mongodb://localhost:27017/hiremate_ai'),
  JWT_SECRET: z.string().default('hiremate-nexus-secure-jwt-secret-key-32chars-min'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  GEMINI_API_KEY: z.string().default('mock-gemini-key'),
  GEMINI_MODEL: z.string().default('gemini-2.5-flash'),
  MAX_FILE_SIZE: z.string().transform(Number).default('5242880')
});

let parsedEnv;
try {
  parsedEnv = envSchema.parse(process.env);
} catch (error) {
  if (error instanceof z.ZodError) {
    const missing = error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join('\n');
    console.error('====================================================');
    console.error('❌ FATAL: Environment validation failed:');
    console.error(missing);
    console.error('Please configure the required environment variables in your .env file.');
    console.error('====================================================');
  } else {
    console.error('Fatal environment configuration error:', error);
  }
  if (process.env.NODE_ENV !== 'test') {
    process.exit(1);
  } else {
    throw error;
  }
}

export const env = parsedEnv;
