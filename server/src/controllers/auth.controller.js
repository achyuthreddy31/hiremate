import { User } from '../models/user.model.js';
import { signToken } from '../utils/token.js';
import { env } from '../config/env.js';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function setAuthCookie(res, token) {
  res.cookie('token', token, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });
}

/**
 * Register a new user account.
 * POST /api/v1/auth/register
 */
export async function register(req, res) {
  try {
    const { name, email, password, confirmPassword } = req.body;

    // 1. Input validation
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_NAME',
          message: 'Full name is required and must be at least 2 characters long.'
        }
      });
    }

    if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_EMAIL',
          message: 'Please provide a valid email address.'
        }
      });
    }

    if (!password || typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_PASSWORD',
          message: 'Password must be at least 6 characters long.'
        }
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'PASSWORD_MISMATCH',
          message: 'Password and confirm password do not match.'
        }
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // 2. Prevent duplicate accounts
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: {
          code: 'EMAIL_ALREADY_EXISTS',
          message: 'An account with this email address already exists.'
        }
      });
    }

    // 3. Create user in MongoDB (pre-save hook hashes the password)
    const user = new User({
      name: name.trim(),
      email: normalizedEmail,
      password
    });
    await user.save();

    // 4. Generate JWT token
    const tokenPayload = {
      id: user._id.toString(),
      uid: user.firebaseUid || user._id.toString(),
      email: user.email,
      name: user.name
    };
    const token = signToken(tokenPayload);

    // 5. Set HttpOnly cookie
    setAuthCookie(res, token);

    return res.status(201).json({
      success: true,
      data: {
        token,
        user: {
          id: user._id,
          uid: user.firebaseUid || user._id.toString(),
          email: user.email,
          name: user.name
        }
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: {
        code: 'REGISTRATION_ERROR',
        message: 'Failed to register user: ' + error.message
      }
    });
  }
}

/**
 * Log in using registered email and password.
 * POST /api/v1/auth/login
 */
export async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_CREDENTIALS',
          message: 'Email and password are required.'
        }
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Query user and explicitly include password field
    const user = await User.findOne({ email: normalizedEmail }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password.'
        }
      });
    }

    // Check if user was migrated without a password
    if (!user.password) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'PASSWORD_NOT_SET',
          message: 'This account was migrated from legacy authentication and has no password set. Please contact support or register your account.'
        }
      });
    }

    // Verify hashed password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password.'
        }
      });
    }

    // Generate JWT token
    const tokenPayload = {
      id: user._id.toString(),
      uid: user.firebaseUid || user._id.toString(),
      email: user.email,
      name: user.name
    };
    const token = signToken(tokenPayload);

    // Set HttpOnly cookie
    setAuthCookie(res, token);

    return res.status(200).json({
      success: true,
      data: {
        token,
        user: {
          id: user._id,
          uid: user.firebaseUid || user._id.toString(),
          email: user.email,
          name: user.name
        }
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: {
        code: 'LOGIN_ERROR',
        message: 'Failed to log in: ' + error.message
      }
    });
  }
}

/**
 * Log out and clear session cookie.
 * POST /api/v1/auth/logout
 */
export async function logout(req, res) {
  try {
    res.clearCookie('token', {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax'
    });

    return res.status(200).json({
      success: true,
      data: {
        message: 'Logged out successfully'
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: {
        code: 'LOGOUT_ERROR',
        message: 'Failed to log out: ' + error.message
      }
    });
  }
}

/**
 * Get currently authenticated user profile.
 * GET /api/v1/auth/me
 */
export async function getCurrentUser(req, res) {
  try {
    const user = await User.findOne({
      $or: [
        { firebaseUid: req.user.uid },
        { _id: req.user.id }
      ]
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User profile not found.'
        }
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          uid: user.firebaseUid || user._id.toString(),
          email: user.email,
          name: user.name,
          currentLevel: user.currentLevel,
          skills: user.skills || [],
          links: user.links || {}
        }
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: {
        code: 'ME_FETCH_ERROR',
        message: 'Failed to fetch current user: ' + error.message
      }
    });
  }
}

/**
 * Insecure unauthenticated password reset disabled for security (Bug 1 fix).
 * POST /api/v1/auth/reset-password
 * Refuses direct password modification based solely on an email address.
 */
export async function resetPassword(req, res) {
  return res.status(403).json({
    success: false,
    error: {
      code: 'PASSWORD_RESET_DISABLED',
      message: 'Direct unauthenticated password reset is disabled for account security. Please contact support or use verified account recovery.'
    }
  });
}
