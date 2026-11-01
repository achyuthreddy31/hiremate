import { describe, it, expect, vi, beforeEach } from 'vitest';
import { requireAuth } from '../src/middleware/auth.middleware.js';
import { signToken } from '../src/utils/token.js';
import { envSchema, INSECURE_DEFAULT_JWT_SECRET } from '../src/config/env.js';
import { register, login, logout, getCurrentUser, resetPassword } from '../src/controllers/auth.controller.js';
import { User } from '../src/models/user.model.js';
import bcrypt from 'bcryptjs';

describe('HireMate Nexus MongoDB Authentication & Security Tests', () => {
  describe('Authentication Middleware (requireAuth)', () => {
    it('rejects requests without Authorization header or cookie with 401', async () => {
      const req = { headers: {} };
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn()
      };
      const next = vi.fn();

      await requireAuth(req, res, next);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        error: expect.objectContaining({ code: 'UNAUTHORIZED' })
      }));
      expect(next).not.toHaveBeenCalled();
    });

    it('rejects malformed authorization header without Bearer prefix with 401', async () => {
      const req = { headers: { authorization: 'Basic some-credentials' } };
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn()
      };
      const next = vi.fn();

      await requireAuth(req, res, next);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        error: expect.objectContaining({ code: 'UNAUTHORIZED' })
      }));
      expect(next).not.toHaveBeenCalled();
    });

    it('rejects empty Bearer token string with 401', async () => {
      const req = { headers: { authorization: 'Bearer   ' } };
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn()
      };
      const next = vi.fn();

      await requireAuth(req, res, next);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        error: expect.objectContaining({ code: 'UNAUTHORIZED' })
      }));
      expect(next).not.toHaveBeenCalled();
    });

    it('rejects invalid or tampered JWT token with 401', async () => {
      const req = { headers: { authorization: 'Bearer invalid.jwt.token' } };
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn()
      };
      const next = vi.fn();

      await requireAuth(req, res, next);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        error: expect.objectContaining({ code: 'INVALID_TOKEN' })
      }));
      expect(next).not.toHaveBeenCalled();
    });

    it('accepts valid JWT token and populates req.user correctly', async () => {
      const validToken = signToken({
        id: '67c1234567890abcdef12345',
        uid: 'user_nexus_101',
        email: 'candidate@hiremate.ai',
        name: 'Alex Nexus'
      });

      const req = { headers: { authorization: `Bearer ${validToken}` } };
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn()
      };
      const next = vi.fn();

      await requireAuth(req, res, next);
      expect(next).toHaveBeenCalled();
      expect(req.user).toBeDefined();
      expect(req.user.uid).toBe('user_nexus_101');
      expect(req.user.email).toBe('candidate@hiremate.ai');
      expect(req.user.name).toBe('Alex Nexus');
    });

    it('accepts valid JWT token from HttpOnly cookie', async () => {
      const validToken = signToken({
        id: '67c1234567890abcdef12345',
        uid: 'user_cookie_99',
        email: 'cookie_candidate@hiremate.ai',
        name: 'Cookie User'
      });

      const req = {
        headers: {},
        cookies: { token: validToken }
      };
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn()
      };
      const next = vi.fn();

      await requireAuth(req, res, next);
      expect(next).toHaveBeenCalled();
      expect(req.user).toBeDefined();
      expect(req.user.uid).toBe('user_cookie_99');
      expect(req.user.email).toBe('cookie_candidate@hiremate.ai');
    });

    it('accepts valid JWT token parsed from raw Cookie header string', async () => {
      const validToken = signToken({
        id: '67c1234567890abcdef12345',
        uid: 'user_raw_cookie_1',
        email: 'raw@hiremate.ai',
        name: 'Raw Cookie User'
      });

      const req = {
        headers: { cookie: `sessionId=12345; token=${validToken}; other=true` }
      };
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn()
      };
      const next = vi.fn();

      await requireAuth(req, res, next);
      expect(next).toHaveBeenCalled();
      expect(req.user).toBeDefined();
      expect(req.user.uid).toBe('user_raw_cookie_1');
    });
  });

  describe('User Registration (register)', () => {
    it('validates required fields and password match', async () => {
      const testCases = [
        { body: { name: '', email: 'a@b.com', password: 'password123', confirmPassword: 'password123' }, expectedCode: 'INVALID_NAME' },
        { body: { name: 'A', email: 'a@b.com', password: 'password123', confirmPassword: 'password123' }, expectedCode: 'INVALID_NAME' },
        { body: { name: 'Alex', email: 'not-an-email', password: 'password123', confirmPassword: 'password123' }, expectedCode: 'INVALID_EMAIL' },
        { body: { name: 'Alex', email: 'alex@example.com', password: '123', confirmPassword: '123' }, expectedCode: 'INVALID_PASSWORD' },
        { body: { name: 'Alex', email: 'alex@example.com', password: 'password123', confirmPassword: 'different' }, expectedCode: 'PASSWORD_MISMATCH' }
      ];

      for (const tc of testCases) {
        const req = { body: tc.body };
        const res = { status: vi.fn().mockReturnThis(), json: vi.fn() };
        await register(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
          success: false,
          error: expect.objectContaining({ code: tc.expectedCode })
        }));
      }
    });

    it('prevents duplicate email registrations with 409 Conflict', async () => {
      vi.spyOn(User, 'findOne').mockResolvedValueOnce({ _id: 'existing_id', email: 'duplicate@example.com' });

      const req = {
        body: {
          name: 'Existing Candidate',
          email: 'duplicate@example.com',
          password: 'Password123!',
          confirmPassword: 'Password123!'
        }
      };
      const res = { status: vi.fn().mockReturnThis(), json: vi.fn() };

      await register(req, res);
      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        error: expect.objectContaining({ code: 'EMAIL_ALREADY_EXISTS' })
      }));
    });

    it('successfully registers new user, sets cookie, and returns JWT', async () => {
      vi.spyOn(User, 'findOne').mockResolvedValueOnce(null);
      vi.spyOn(User.prototype, 'save').mockImplementation(async function () {
        this._id = 'mock_mongo_id_123';
        this.firebaseUid = 'mock_mongo_id_123';
        return this;
      });

      const req = {
        body: {
          name: 'Sarah Connor',
          email: 'sarah@example.com',
          password: 'SecurePassword123!',
          confirmPassword: 'SecurePassword123!'
        }
      };
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
        cookie: vi.fn()
      };

      await register(req, res);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.cookie).toHaveBeenCalledWith('token', expect.any(String), expect.any(Object));
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        data: expect.objectContaining({
          token: expect.any(String),
          user: expect.objectContaining({
            email: 'sarah@example.com',
            name: 'Sarah Connor'
          })
        })
      }));
    });
  });

  describe('User Login (login)', () => {
    it('validates presence of email and password', async () => {
      const req = { body: { email: '', password: '' } };
      const res = { status: vi.fn().mockReturnThis(), json: vi.fn() };

      await login(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        error: expect.objectContaining({ code: 'MISSING_CREDENTIALS' })
      }));
    });

    it('returns 401 when email is not registered', async () => {
      vi.spyOn(User, 'findOne').mockReturnValueOnce({
        select: vi.fn().mockResolvedValueOnce(null)
      });

      const req = { body: { email: 'nonexistent@example.com', password: 'password123' } };
      const res = { status: vi.fn().mockReturnThis(), json: vi.fn() };

      await login(req, res);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        error: expect.objectContaining({ code: 'INVALID_CREDENTIALS' })
      }));
    });

    it('returns 401 when password does not match', async () => {
      const mockUser = {
        _id: 'mock_id',
        email: 'user@example.com',
        name: 'User',
        password: 'hashed_password',
        comparePassword: vi.fn().mockResolvedValueOnce(false)
      };

      vi.spyOn(User, 'findOne').mockReturnValueOnce({
        select: vi.fn().mockResolvedValueOnce(mockUser)
      });

      const req = { body: { email: 'user@example.com', password: 'wrongPassword' } };
      const res = { status: vi.fn().mockReturnThis(), json: vi.fn() };

      await login(req, res);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        error: expect.objectContaining({ code: 'INVALID_CREDENTIALS' })
      }));
    });

    it('authenticates valid credentials, sets cookie, and returns JWT', async () => {
      const mockUser = {
        _id: 'user_valid_id',
        firebaseUid: 'user_valid_id',
        email: 'valid@example.com',
        name: 'Valid User',
        password: 'hashed_password',
        comparePassword: vi.fn().mockResolvedValueOnce(true)
      };

      vi.spyOn(User, 'findOne').mockReturnValueOnce({
        select: vi.fn().mockResolvedValueOnce(mockUser)
      });

      const req = { body: { email: 'valid@example.com', password: 'correctPassword' } };
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
        cookie: vi.fn()
      };

      await login(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.cookie).toHaveBeenCalledWith('token', expect.any(String), expect.any(Object));
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        data: expect.objectContaining({
          token: expect.any(String),
          user: expect.objectContaining({
            email: 'valid@example.com',
            name: 'Valid User'
          })
        })
      }));
    });
  });

  describe('Session Management & Logout (getCurrentUser, logout, resetPassword)', () => {
    it('getCurrentUser returns authenticated profile from MongoDB', async () => {
      const mockUser = {
        _id: 'u123',
        firebaseUid: 'u123',
        email: 'profile@example.com',
        name: 'Profile User',
        currentLevel: 'intermediate',
        skills: ['JavaScript', 'Python'],
        links: { github: 'https://github.com/profile' }
      };

      vi.spyOn(User, 'findOne').mockResolvedValueOnce(mockUser);

      const req = { user: { id: 'u123', uid: 'u123' } };
      const res = { status: vi.fn().mockReturnThis(), json: vi.fn() };

      await getCurrentUser(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        data: expect.objectContaining({
          user: expect.objectContaining({
            email: 'profile@example.com',
            name: 'Profile User'
          })
        })
      }));
    });

    it('logout clears the auth cookie and returns success', async () => {
      const req = {};
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
        clearCookie: vi.fn()
      };

      await logout(req, res);
      expect(res.clearCookie).toHaveBeenCalledWith('token', expect.any(Object));
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true
      }));
    });

    it('resetPassword disables unauthenticated password resets (Bug 1 fix)', async () => {
      const mockUser = {
        _id: 'user_reset',
        email: 'reset@example.com',
        save: vi.fn()
      };

      vi.spyOn(User, 'findOne').mockResolvedValueOnce(mockUser);

      const req = {
        body: {
          email: 'reset@example.com',
          password: 'newPassword123!',
          confirmPassword: 'newPassword123!'
        }
      };
      const res = { status: vi.fn().mockReturnThis(), json: vi.fn() };

      await resetPassword(req, res);
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        error: expect.objectContaining({
          code: 'PASSWORD_RESET_DISABLED'
        })
      }));
      expect(mockUser.save).not.toHaveBeenCalled();
    });
  describe('Production JWT Secret Enforcement & Validation (Bug 2 fix)', () => {
    it('refuses production startup when JWT_SECRET is missing or empty', () => {
      const prodEnv = {
        NODE_ENV: 'production',
        PORT: '5000',
        CLIENT_URL: 'https://hiremate-lilac.vercel.app',
        MONGODB_URI: 'mongodb://localhost:27017/hiremate_ai',
        JWT_SECRET: ''
      };
      const result = envSchema.safeParse(prodEnv);
      expect(result.success).toBe(false);
      const errors = result.error.errors.map(e => e.message);
      expect(errors.some(msg => msg.includes('JWT_SECRET is required in production'))).toBe(true);
    });

    it('refuses production startup when JWT_SECRET equals the insecure default', () => {
      const prodEnv = {
        NODE_ENV: 'production',
        PORT: '5000',
        CLIENT_URL: 'https://hiremate-lilac.vercel.app',
        MONGODB_URI: 'mongodb://localhost:27017/hiremate_ai',
        JWT_SECRET: INSECURE_DEFAULT_JWT_SECRET
      };
      const result = envSchema.safeParse(prodEnv);
      expect(result.success).toBe(false);
      const errors = result.error.errors.map(e => e.message);
      expect(errors.some(msg => msg.includes('Insecure default JWT_SECRET cannot be used in production'))).toBe(true);
    });

    it('refuses production startup when JWT_SECRET is shorter than 32 characters', () => {
      const prodEnv = {
        NODE_ENV: 'production',
        PORT: '5000',
        CLIENT_URL: 'https://hiremate-lilac.vercel.app',
        MONGODB_URI: 'mongodb://localhost:27017/hiremate_ai',
        JWT_SECRET: 'short-secret-under-32-chars!'
      };
      const result = envSchema.safeParse(prodEnv);
      expect(result.success).toBe(false);
      const errors = result.error.errors.map(e => e.message);
      expect(errors.some(msg => msg.includes('must be at least 32 characters long'))).toBe(true);
    });

    it('succeeds in production when a valid unpredictable 32+ character secret is provided', () => {
      const prodEnv = {
        NODE_ENV: 'production',
        PORT: '5000',
        CLIENT_URL: 'https://hiremate-lilac.vercel.app',
        MONGODB_URI: 'mongodb://localhost:27017/hiremate_ai',
        JWT_SECRET: 'c8f3a9e2d1b740589a6c3e1f7b2a9d8e4f5c6b7a8d9e0f1a2b3c4d5e6f7a8b9c'
      };
      const result = envSchema.safeParse(prodEnv);
      expect(result.success).toBe(true);
      expect(result.data.JWT_SECRET).toBe('c8f3a9e2d1b740589a6c3e1f7b2a9d8e4f5c6b7a8d9e0f1a2b3c4d5e6f7a8b9c');
    });

    it('permits default fallback in development and test environments', () => {
      const devEnv = {
        NODE_ENV: 'development',
        PORT: '5000'
      };
      const result = envSchema.safeParse(devEnv);
      expect(result.success).toBe(true);
      expect(result.data.JWT_SECRET).toBe(INSECURE_DEFAULT_JWT_SECRET);
    });
  });

  });
});
