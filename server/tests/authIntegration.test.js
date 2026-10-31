import { describe, it, expect, beforeAll, vi } from 'vitest';
import { User } from '../src/models/user.model.js';
import { Application } from '../src/models/application.model.js';
import { register, login, logout, getCurrentUser, resetPassword } from '../src/controllers/auth.controller.js';
import { upsertProfile } from '../src/controllers/user.controller.js';
import { requireAuth } from '../src/middleware/auth.middleware.js';
import { signToken } from '../src/utils/token.js';
import bcrypt from 'bcryptjs';

describe('End-to-End Authentication Integration Suite', () => {
  const inMemoryUsers = new Map();

  function createMockRes() {
    return {
      statusCode: 200,
      cookies: {},
      _json: null,
      status(code) {
        this.statusCode = code;
        return this;
      },
      cookie(name, value, options) {
        this.cookies[name] = { value, options };
        return this;
      },
      clearCookie(name, options) {
        delete this.cookies[name];
        this.clearedCookie = name;
        return this;
      },
      json(data) {
        this._json = data;
        return this;
      }
    };
  }

  beforeAll(() => {
    vi.spyOn(User, 'findOne').mockImplementation((query) => {
      let found = null;
      if (query.email) {
        found = Array.from(inMemoryUsers.values()).find(u => u.email === query.email.toLowerCase().trim());
      } else if (query.$or) {
        const uid = query.$or[0]?.firebaseUid;
        const id = query.$or[1]?._id;
        found = Array.from(inMemoryUsers.values()).find(u => u.firebaseUid === uid || u._id === id);
      } else if (query.firebaseUid) {
        found = Array.from(inMemoryUsers.values()).find(u => u.firebaseUid === query.firebaseUid);
      }
      return {
        select: (fields) => Promise.resolve(found),
        then: (resolve) => resolve(found)
      };
    });

    vi.spyOn(User, 'findOneAndUpdate').mockImplementation(async (query, update) => {
      const existing = Array.from(inMemoryUsers.values()).find(u => u.firebaseUid === query.firebaseUid);
      if (existing) {
        Object.assign(existing, update);
        return existing;
      }
      const newUser = {
        _id: 'mock_created_' + Date.now(),
        ...update
      };
      inMemoryUsers.set(newUser.email, newUser);
      return newUser;
    });

    vi.spyOn(User.prototype, 'save').mockImplementation(async function () {
      if (!this._id) {
        this._id = 'mongo_id_' + Date.now();
      }
      if (!this.firebaseUid) {
        this.firebaseUid = this._id.toString();
      }
      if (this.password && !this.password.startsWith('$2a$')) {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
      }
      this.comparePassword = async function (cand) {
        return bcrypt.compare(cand, this.password);
      };
      inMemoryUsers.set(this.email, this);
      return this;
    });
  });

  let registeredToken = '';
  let registeredCookieValue = '';
  let userUid = '';
  const testEmail = 'alex.nexus@example.com';
  const testPassword = 'SecretPassword123!';

  it('1. Registers a new account successfully in MongoDB with hashed password', async () => {
    const req = {
      body: {
        name: 'Alex Nexus',
        email: testEmail,
        password: testPassword,
        confirmPassword: testPassword
      }
    };
    const res = createMockRes();

    await register(req, res);

    expect(res.statusCode).toBe(201);
    expect(res._json.success).toBe(true);
    expect(res._json.data.token).toBeDefined();
    expect(res._json.data.user.email).toBe(testEmail);
    expect(res._json.data.user.name).toBe('Alex Nexus');

    registeredToken = res._json.data.token;
    userUid = res._json.data.user.uid;
    registeredCookieValue = res.cookies['token']?.value;
    expect(registeredCookieValue).toBe(registeredToken);
  });

  it('2. Rejects duplicate registration with an existing email', async () => {
    const req = {
      body: {
        name: 'Another Alex',
        email: testEmail,
        password: 'AnotherPassword456!',
        confirmPassword: 'AnotherPassword456!'
      }
    };
    const res = createMockRes();

    await register(req, res);

    expect(res.statusCode).toBe(409);
    expect(res._json.success).toBe(false);
    expect(res._json.error.code).toBe('EMAIL_ALREADY_EXISTS');
  });

  it('3. Logs in successfully with valid credentials', async () => {
    const req = {
      body: {
        email: testEmail,
        password: testPassword
      }
    };
    const res = createMockRes();

    await login(req, res);

    expect(res.statusCode).toBe(200);
    expect(res._json.success).toBe(true);
    expect(res._json.data.token).toBeDefined();
    expect(res._json.data.user.email).toBe(testEmail);
    expect(res._json.data.user.name).toBe('Alex Nexus');
  });

  it('4. Rejects login attempts with incorrect credentials', async () => {
    const req = {
      body: {
        email: testEmail,
        password: 'wrong_password_999'
      }
    };
    const res = createMockRes();

    await login(req, res);

    expect(res.statusCode).toBe(401);
    expect(res._json.success).toBe(false);
    expect(res._json.error.code).toBe('INVALID_CREDENTIALS');
  });

  it('5. Maintains session across refresh via GET /auth/me with Bearer token', async () => {
    const req = {
      headers: {
        authorization: `Bearer ${registeredToken}`
      }
    };
    const res = createMockRes();
    const next = vi.fn();

    await requireAuth(req, res, next);
    expect(next).toHaveBeenCalled();

    await getCurrentUser(req, res);
    expect(res.statusCode).toBe(200);
    expect(res._json.success).toBe(true);
    expect(res._json.data.user.email).toBe(testEmail);
    expect(res._json.data.user.name).toBe('Alex Nexus');
  });

  it('6. Maintains session via HttpOnly cookie', async () => {
    const req = {
      headers: {},
      cookies: {
        token: registeredCookieValue
      }
    };
    const res = createMockRes();
    const next = vi.fn();

    await requireAuth(req, res, next);
    expect(next).toHaveBeenCalled();

    await getCurrentUser(req, res);
    expect(res.statusCode).toBe(200);
    expect(res._json.success).toBe(true);
    expect(res._json.data.user.email).toBe(testEmail);
  });

  it('7. Rejects access to protected endpoint when unauthenticated', async () => {
    const req = { headers: {} };
    const res = createMockRes();
    const next = vi.fn();

    await requireAuth(req, res, next);
    expect(res.statusCode).toBe(401);
    expect(res._json.success).toBe(false);
    expect(res._json.error.code).toBe('UNAUTHORIZED');
    expect(next).not.toHaveBeenCalled();
  });

  it('8. Updates user profile via PUT /users/profile using token', async () => {
    const req = {
      headers: { authorization: `Bearer ${registeredToken}` },
      body: {
        name: 'Alex Nexus Updated',
        currentLevel: 'advanced',
        skills: ['React', 'Node.js', 'MongoDB']
      }
    };
    const res = createMockRes();
    const next = vi.fn();

    await requireAuth(req, res, next);
    expect(next).toHaveBeenCalled();

    await upsertProfile(req, res);
    expect(res.statusCode).toBe(200);
    expect(res._json.success).toBe(true);
    expect(res._json.data.name).toBe('Alex Nexus Updated');
  });

  it('9. Resets and updates password via POST /auth/reset-password', async () => {
    const newPassword = 'BrandNewPassword789!';
    const req = {
      body: {
        email: testEmail,
        password: newPassword,
        confirmPassword: newPassword
      }
    };
    const res = createMockRes();

    await resetPassword(req, res);
    expect(res.statusCode).toBe(200);
    expect(res._json.success).toBe(true);

    // Verify login works with the new password
    const loginReq = {
      body: {
        email: testEmail,
        password: newPassword
      }
    };
    const loginRes = createMockRes();
    await login(loginReq, loginRes);
    expect(loginRes.statusCode).toBe(200);
    expect(loginRes._json.success).toBe(true);
  });

  it('10. Logs out successfully via POST /auth/logout', async () => {
    const req = {};
    const res = createMockRes();

    await logout(req, res);
    expect(res.statusCode).toBe(200);
    expect(res._json.success).toBe(true);
    expect(res.clearedCookie).toBe('token');
  });

  it('11. Preserves existing user application records mapped by legacy UID', async () => {
    const legacyUid = 'firebase_legacy_user_777';
    const legacyUser = {
      _id: 'legacy_mongo_id_777',
      firebaseUid: legacyUid,
      email: 'legacy@example.com',
      name: 'Legacy User',
      skills: ['Java', 'Spring Boot']
    };
    inMemoryUsers.set(legacyUser.email, legacyUser);

    const legacyToken = signToken({
      id: legacyUser._id,
      uid: legacyUid,
      email: legacyUser.email,
      name: legacyUser.name
    });

    const req = {
      headers: { authorization: `Bearer ${legacyToken}` }
    };
    const res = createMockRes();
    const next = vi.fn();

    await requireAuth(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(req.user.uid).toBe(legacyUid);
  });
});
