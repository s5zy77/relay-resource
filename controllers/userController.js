const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { ok, paginated, ApiError } = require('../utils/apiResponse');

async function listUsers(req, res) {
  const { page = 1, limit = 20, role, search } = req.query;
  const filter = {};
  if (role) filter.role = role;
  if (search) filter.$or = [
    { name: new RegExp(search, 'i') },
    { email: new RegExp(search, 'i') },
  ];

  const total = await User.countDocuments(filter);
  const items = await User.find(filter)
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .sort({ createdAt: -1 });

  return paginated(res, items, total, page, limit);
}

async function getUser(req, res) {
  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError(404, 'User not found', 'NOT_FOUND');
  return ok(res, user);
}

async function updateProfile(req, res) {
  const targetId = req.params.id || req.user.id;
  if (targetId !== req.user.id && req.user.role !== 'admin') {
    throw new ApiError(403, 'You can only edit your own profile', 'FORBIDDEN');
  }

  const allowed = [
    'name', 'phone', 'companyName', 'companyLogoUrl', 'gstIn', 'address', 'workInfo',
  ];
  const updates = {};
  for (const key of allowed) {
    if (req.body[key] !== undefined) updates[key] = req.body[key];
  }
  if (req.user.role === 'admin' && req.body.role) updates.role = req.body.role;

  const user = await User.findByIdAndUpdate(targetId, updates, { new: true, runValidators: true });
  if (!user) throw new ApiError(404, 'User not found', 'NOT_FOUND');
  return ok(res, user);
}

async function changePassword(req, res) {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user.id);
  const match = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!match) throw new ApiError(401, 'Current password is incorrect', 'INVALID_PASSWORD');

  user.passwordHash = await bcrypt.hash(newPassword, 10);
  user.tokenVersion = (user.tokenVersion || 0) + 1; // invalidate old refresh tokens
  await user.save();

  return ok(res, { changed: true });
}

async function deleteUser(req, res) {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) throw new ApiError(404, 'User not found', 'NOT_FOUND');
  return ok(res, { deleted: true });
}

module.exports = { listUsers, getUser, updateProfile, changePassword, deleteUser };
