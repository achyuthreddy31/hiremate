import { describe, it, expect, vi, beforeEach } from 'vitest';
import { requireAuth } from '../src/middleware/auth.middleware.js';
import { signToken } from '../src/utils/token.js';
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

    it('resetPassword updates user password securely', async () => {
      const mockUser = {
        _id: 'user_reset',
        email: 'reset@example.com',
        save: vi.fn().mockResolvedValueOnce(true)
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
      expect(res.status).toHaveBeenCalledWith(200);
      expect(mockUser.save).toHaveBeenCalled();
      expect(mockUser.password).toBe('newPassword123!');
    });
  });
});
