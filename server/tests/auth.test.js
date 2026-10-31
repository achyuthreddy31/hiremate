import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import admin from '../src/config/firebase.js';
import { requireAuth } from '../src/middleware/auth.middleware.js';

describe('Auth & Ownership Middleware Tests', () => {
  it('rejects requests without Authorization header with 401', async () => {
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

  it('accepts valid mock token and populates req.user.uid strictly', async () => {
    const req = { headers: { authorization: 'Bearer mock-uid-user_test_99' } };
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn()
    };
    const next = vi.fn();

    await requireAuth(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(req.user).toBeDefined();
    expect(req.user.uid).toBe('user_test_99');
  });

  it('rejects malformed authorization header without Bearer prefix with 401', async () => {
    const req = { headers: { authorization: 'Basic mock-uid-user' } };
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

  it('accepts mock-token prefix in test environment', async () => {
    const req = { headers: { authorization: 'Bearer mock-token-candidate_42' } };
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn()
    };
    const next = vi.fn();

    await requireAuth(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(req.user).toBeDefined();
    expect(req.user.uid).toBe('candidate_42');
    expect(req.user.email).toBe('candidate_42@hiremate.ai');
  });

  describe('Production Environment Security Restrictions', () => {
    const originalEnv = process.env.NODE_ENV;

    beforeEach(() => {
      process.env.NODE_ENV = 'production';
    });

    afterEach(() => {
      process.env.NODE_ENV = originalEnv;
    });

    it('strictly rejects mock-uid tokens in production with 401', async () => {
      const req = { headers: { authorization: 'Bearer mock-uid-impersonated_victim' } };
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn()
      };
      const next = vi.fn();

      await requireAuth(req, res, next);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'INVALID_TOKEN',
          message: 'Mock authentication tokens are not permitted in production environments.'
        }
      });
      expect(next).not.toHaveBeenCalled();
      expect(req.user).toBeUndefined();
    });

    it('strictly rejects mock-token tokens in production with 401', async () => {
      const req = { headers: { authorization: 'Bearer mock-token-admin_user' } };
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
      expect(req.user).toBeUndefined();
    });

    it('does not leak token value or sensitive credentials in error response', async () => {
      const sensitiveToken = 'mock-uid-secret_123456';
      const req = { headers: { authorization: `Bearer ${sensitiveToken}` } };
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn()
      };
      const next = vi.fn();

      await requireAuth(req, res, next);
      const responsePayload = JSON.stringify(res.json.mock.calls[0][0]);
      expect(responsePayload).not.toContain(sensitiveToken);
    });
  });

  describe('Fail-Closed Environment Security (Missing, Empty, or Unrecognized NODE_ENV)', () => {
    const originalEnv = process.env.NODE_ENV;

    afterEach(() => {
      process.env.NODE_ENV = originalEnv;
    });

    it('strictly rejects mock tokens when NODE_ENV is undefined', async () => {
      delete process.env.NODE_ENV;
      const req = { headers: { authorization: 'Bearer mock-uid-attacker' } };
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn()
      };
      const next = vi.fn();

      await requireAuth(req, res, next);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        error: expect.objectContaining({
          code: 'INVALID_TOKEN',
          message: 'Mock authentication tokens are permitted only in development and test environments.'
        })
      }));
      expect(next).not.toHaveBeenCalled();
      expect(req.user).toBeUndefined();
    });

    it('strictly rejects mock tokens when NODE_ENV is empty string', async () => {
      process.env.NODE_ENV = '';
      const req = { headers: { authorization: 'Bearer mock-token-attacker' } };
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn()
      };
      const next = vi.fn();

      await requireAuth(req, res, next);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        error: expect.objectContaining({
          code: 'INVALID_TOKEN',
          message: 'Mock authentication tokens are permitted only in development and test environments.'
        })
      }));
      expect(next).not.toHaveBeenCalled();
      expect(req.user).toBeUndefined();
    });

    it('strictly rejects mock tokens when NODE_ENV is whitespace only', async () => {
      process.env.NODE_ENV = '   ';
      const req = { headers: { authorization: 'Bearer mock-uid-whitespace' } };
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn()
      };
      const next = vi.fn();

      await requireAuth(req, res, next);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        error: expect.objectContaining({
          code: 'INVALID_TOKEN'
        })
      }));
      expect(next).not.toHaveBeenCalled();
      expect(req.user).toBeUndefined();
    });

    it('strictly rejects mock tokens when NODE_ENV is unrecognized (staging, preview, qa)', async () => {
      for (const envVal of ['staging', 'preview', 'qa', 'unknown']) {
        process.env.NODE_ENV = envVal;
        const req = { headers: { authorization: 'Bearer mock-uid-test' } };
        const res = {
          status: vi.fn().mockReturnThis(),
          json: vi.fn()
        };
        const next = vi.fn();

        await requireAuth(req, res, next);
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
          success: false,
          error: expect.objectContaining({
            code: 'INVALID_TOKEN',
            message: 'Mock authentication tokens are permitted only in development and test environments.'
          })
        }));
        expect(next).not.toHaveBeenCalled();
        expect(req.user).toBeUndefined();
      }
    });

    it('preserves valid Firebase token verification even when NODE_ENV is undefined or unrecognized', async () => {
      delete process.env.NODE_ENV;
      const verifyIdTokenMock = vi.fn().mockResolvedValueOnce({
        uid: 'verified_firebase_uid_unrecognized_env',
        email: 'user@hiremate.ai'
      });
      const authSpy = vi.spyOn(admin, 'auth').mockReturnValue({
        verifyIdToken: verifyIdTokenMock
      });

      const req = { headers: { authorization: 'Bearer valid_firebase_jwt' } };
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn()
      };
      const next = vi.fn();

      await requireAuth(req, res, next);
      expect(verifyIdTokenMock).toHaveBeenCalledWith('valid_firebase_jwt');
      expect(next).toHaveBeenCalled();
      expect(req.user).toEqual({
        uid: 'verified_firebase_uid_unrecognized_env',
        email: 'user@hiremate.ai'
      });

      authSpy.mockRestore();
    });
  });

  describe('Live Firebase Token Verification Flow', () => {
    it('authenticates user when Firebase token is verified successfully', async () => {
      const verifyIdTokenMock = vi.fn().mockResolvedValueOnce({
        uid: 'verified_firebase_uid_123',
        email: 'candidate@example.com'
      });
      const authSpy = vi.spyOn(admin, 'auth').mockReturnValue({
        verifyIdToken: verifyIdTokenMock
      });

      const req = { headers: { authorization: 'Bearer live_valid_firebase_jwt_token' } };
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn()
      };
      const next = vi.fn();

      await requireAuth(req, res, next);
      expect(verifyIdTokenMock).toHaveBeenCalledWith('live_valid_firebase_jwt_token');
      expect(next).toHaveBeenCalled();
      expect(req.user).toEqual({
        uid: 'verified_firebase_uid_123',
        email: 'candidate@example.com'
      });

      authSpy.mockRestore();
    });

    it('rejects with 401 when Firebase token verification fails or expires', async () => {
      const verifyIdTokenMock = vi.fn().mockRejectedValueOnce(
        new Error('Token signature is invalid or expired')
      );
      const authSpy = vi.spyOn(admin, 'auth').mockReturnValue({
        verifyIdToken: verifyIdTokenMock
      });

      const req = { headers: { authorization: 'Bearer invalid_or_expired_jwt' } };
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn()
      };
      const next = vi.fn();

      await requireAuth(req, res, next);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        error: expect.objectContaining({
          code: 'INVALID_TOKEN'
        })
      }));
      expect(next).not.toHaveBeenCalled();

      authSpy.mockRestore();
    });

    it('rejects with 401 when Firebase token returns empty or null uid payload', async () => {
      const verifyIdTokenMock = vi.fn().mockResolvedValueOnce({
        uid: '',
        email: 'no_uid@example.com'
      });
      const authSpy = vi.spyOn(admin, 'auth').mockReturnValue({
        verifyIdToken: verifyIdTokenMock
      });

      const req = { headers: { authorization: 'Bearer malformed_payload_jwt' } };
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn()
      };
      const next = vi.fn();

      await requireAuth(req, res, next);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        error: expect.objectContaining({
          code: 'INVALID_TOKEN'
        })
      }));
      expect(next).not.toHaveBeenCalled();

      authSpy.mockRestore();
    });
  });

  it('rejects empty bearer token with 401', async () => {
    const req = { headers: { authorization: 'Bearer ' } };
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn()
    };
    const next = vi.fn();

    await requireAuth(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });
});
