const { verifyAccessToken } = require('../utils/tokens');
const { ApiError } = require('../utils/apiResponse');
const User = require('../models/User');

async function verifyAccessTokenMw(req, res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    throw new ApiError(401, 'Missing or malformed Authorization header', 'UNAUTHORIZED');
  }

  let payload;
  try {
    payload = verifyAccessToken(token);
  } catch (e) {
    throw new ApiError(401, 'Invalid or expired access token', 'TOKEN_EXPIRED');
  }

  const user = await User.findById(payload.sub);
  if (!user) {
    throw new ApiError(401, 'User no longer exists', 'UNAUTHORIZED');
  }

  req.user = { id: user._id.toString(), role: user.role, email: user.email };
  next();
}

/** Attaches req.user if a valid Bearer token is present, but never blocks the request. */
async function optionalAuth(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const [scheme, token] = header.split(' ');
    if (scheme === 'Bearer' && token) {
      const payload = verifyAccessToken(token);
      const user = await User.findById(payload.sub);
      if (user) req.user = { id: user._id.toString(), role: user.role, email: user.email };
    }
  } catch (_) { /* ignore — guest access allowed */ }
  next();
}

function requireRole(...roles) {
  return function (req, res, next) {
    if (!req.user) {
      throw new ApiError(401, 'Not authenticated', 'UNAUTHORIZED');
    }
    if (!roles.includes(req.user.role)) {
      throw new ApiError(403, 'You do not have permission to perform this action', 'FORBIDDEN');
    }
    next();
  };
}

module.exports = { verifyAccessTokenMw, optionalAuth, requireRole };
