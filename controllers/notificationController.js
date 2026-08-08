const Notification = require('../models/Notification');
const { ok, paginated, ApiError } = require('../utils/apiResponse');

async function listNotifications(req, res) {
  const { page = 1, limit = 20, unreadOnly } = req.query;
  const filter = { user: req.user.id };
  if (unreadOnly === 'true') filter.read = false;

  const total = await Notification.countDocuments(filter);
  const items = await Notification.find(filter)
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .sort({ createdAt: -1 });

  return paginated(res, items, total, page, limit);
}

async function markRead(req, res) {
  const n = await Notification.findOneAndUpdate(
    { _id: req.params.id, user: req.user.id },
    { read: true },
    { new: true }
  );
  if (!n) throw new ApiError(404, 'Notification not found', 'NOT_FOUND');
  return ok(res, n);
}

// Stubbed AI call endpoint (no real telephony integration for the hackathon)
async function triggerAiCall(req, res) {
  const outcomes = [
    'Customer confirmed pickup time via AI call.',
    'Customer requested a 1-day extension via AI call.',
    'No answer — voicemail left by AI call.',
    'Customer confirmed return condition via AI call.',
  ];
  const message = outcomes[Math.floor(Math.random() * outcomes.length)];

  const n = await Notification.create({
    user: req.body.user || req.user.id,
    rentalOrder: req.body.rentalOrder || null,
    type: 'ai_call_outcome',
    message,
  });

  return ok(res, n, 201);
}

module.exports = { listNotifications, markRead, triggerAiCall };
