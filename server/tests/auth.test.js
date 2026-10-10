import { describe, it, expect, vi } from 'vitest';
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
