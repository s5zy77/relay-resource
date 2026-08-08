const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { ok, ApiError } = require('../utils/apiResponse');
const {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} = require('../utils/tokens');
const { NODE_ENV } = require('../config/env');

const REFRESH_COOKIE_NAME = 'refresh_token';

function cookieOptions() {
  return {
    httpOnly: true,
    secure: NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 30 * 24 * 60 * 60 * 1000,
    path: '/api/auth',
  };
}

async function signup(req, res) {
  const { name, email, password, role, phone, companyName, gstIn } = req.body;

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) throw new ApiError(409, 'A user with this email already exists', 'EMAIL_TAKEN');

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({
    name,
    email,
    passwordHash,
    role: role || 'customer',
    phone,
    companyName,
    gstIn,
  });

  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);
  res.cookie(REFRESH_COOKIE_NAME, refreshToken, cookieOptions());

  return ok(res, { user, accessToken }, 201);
}

async function login(req, res) {
  const { email, password } = req.body;
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) throw new ApiError(401, 'Invalid email or password', 'INVALID_CREDENTIALS');

  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) throw new ApiError(401, 'Invalid email or password', 'INVALID_CREDENTIALS');

  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);
  res.cookie(REFRESH_COOKIE_NAME, refreshToken, cookieOptions());

  return ok(res, { user, accessToken });
}

async function refresh(req, res) {
  const token = req.cookies?.[REFRESH_COOKIE_NAME];
  if (!token) throw new ApiError(401, 'Missing refresh token', 'NO_REFRESH_TOKEN');

  let payload;
  try {
    payload = verifyRefreshToken(token);
  } catch (e) {
    throw new ApiError(401, 'Invalid or expired refresh token', 'REFRESH_TOKEN_EXPIRED');
  }

  const user = await User.findById(payload.sub);
  if (!user || (user.tokenVersion || 0) !== (payload.tokenVersion || 0)) {
    throw new ApiError(401, 'Refresh token no longer valid', 'REFRESH_TOKEN_INVALID');
  }

  const accessToken = signAccessToken(user);
  const newRefreshToken = signRefreshToken(user);
  res.cookie(REFRESH_COOKIE_NAME, newRefreshToken, cookieOptions());

  return ok(res, { accessToken });
}

async function logout(req, res) {
  res.clearCookie(REFRESH_COOKIE_NAME, { path: '/api/auth' });
  return ok(res, { loggedOut: true });
}

async function me(req, res) {
  const user = await User.findById(req.user.id);
  if (!user) throw new ApiError(404, 'User not found', 'NOT_FOUND');
  return ok(res, user);
}

module.exports = { signup, login, refresh, logout, me, REFRESH_COOKIE_NAME };
