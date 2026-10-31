import admin, { initializeFirebase } from '../config/firebase.js';

initializeFirebase();

/**
 * Authentication middleware.
 * Verifies Firebase ID token from Authorization header (Bearer <token>).
 * Strictly populates req.user.uid with the verified UID.
 * Supports mock development tokens formatted as "mock-uid-<uid>" for offline testing.
 */
export async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication token missing or invalid. Format: Bearer <token>'
        }
      });
    }

    const token = authHeader.split('Bearer ')[1].trim();
    if (!token) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Bearer token string is empty'
        }
      });
    }

    // Restrict mock authentication strictly to explicit development and test environments.
    // Missing, undefined, empty, or unrecognized environments fail closed and reject mock tokens.
    const isMockToken = token.startsWith('mock-token-') || token.startsWith('mock-uid-');
    if (isMockToken) {
      const currentEnv = typeof process.env.NODE_ENV === 'string' ? process.env.NODE_ENV.trim().toLowerCase() : '';
      const isAllowedEnvironment = currentEnv === 'development' || currentEnv === 'test';

      if (!isAllowedEnvironment) {
        return res.status(401).json({
          success: false,
          error: {
            code: 'INVALID_TOKEN',
            message: currentEnv === 'production'
              ? 'Mock authentication tokens are not permitted in production environments.'
              : 'Mock authentication tokens are permitted only in development and test environments.'
          }
        });
      }
      const mockUid = token.replace('mock-token-', '').replace('mock-uid-', '').trim();
      req.user = {
        uid: mockUid || 'mock_user_123',
        email: `${mockUid || 'mock'}@hiremate.ai`
      };
      return next();
    }

    // Verify live Firebase ID token
    try {
      const decodedToken = await admin.auth().verifyIdToken(token);
      if (!decodedToken || !decodedToken.uid) {
        return res.status(401).json({
          success: false,
          error: {
            code: 'INVALID_TOKEN',
            message: 'Firebase token verification returned invalid identity payload'
          }
        });
      }
      req.user = {
        uid: decodedToken.uid,
        email: decodedToken.email
      };
      return next();
    } catch (verifyError) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_TOKEN',
          message: 'Firebase token verification failed or expired: ' + verifyError.message
        }
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: {
        code: 'AUTH_INTERNAL_ERROR',
        message: 'Internal server error while authenticating request'
      }
    });
  }
}
