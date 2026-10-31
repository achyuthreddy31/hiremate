import { verifyToken } from '../utils/token.js';

/**
 * Authentication middleware.
 * Verifies JWT token from Authorization header (Bearer <token>) or HttpOnly cookie.
 * Populates req.user with { id, uid, email, name }.
 */
export async function requireAuth(req, res, next) {
  try {
    let token = null;

    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split('Bearer ')[1].trim();
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    } else if (req.headers.cookie) {
      const match = req.headers.cookie.match(/(?:^|;\s*)token=([^;]+)/);
      if (match) {
        token = decodeURIComponent(match[1]);
      }
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication token missing or invalid. Format: Bearer <token>'
        }
      });
    }

    try {
      const decoded = verifyToken(token);
      if (!decoded || (!decoded.uid && !decoded.id)) {
        return res.status(401).json({
          success: false,
          error: {
            code: 'INVALID_TOKEN',
            message: 'Authentication token verification returned invalid identity payload'
          }
        });
      }

      req.user = {
        id: decoded.id || decoded.uid,
        uid: decoded.uid || decoded.id,
        email: decoded.email,
        name: decoded.name
      };

      return next();
    } catch (verifyError) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_TOKEN',
          message: 'Authentication token verification failed or expired: ' + verifyError.message
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
