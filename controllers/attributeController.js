const Attribute = require('../models/Attribute');
const { ok, paginated, ApiError } = require('../utils/apiResponse');

function vendorFilter(req, filter = {}) {
  if (req.user.role === 'vendor') filter.vendor = req.user.id;
  return filter;
}

async function listAttributes(req, res) {
  const { page = 1, limit = 50 } = req.query;
  const filter = vendorFilter(req);
  const total = await Attribute.countDocuments(filter);
  const items = await Attribute.find(filter).skip((page - 1) * limit).limit(Number(limit));
  return paginated(res, items, total, page, limit);
}

async function getAttribute(req, res) {
  const attr = await Attribute.findById(req.params.id);
  if (!attr) throw new ApiError(404, 'Attribute not found', 'NOT_FOUND');
  return ok(res, attr);
}

async function createAttribute(req, res) {
  const vendor = req.user.role === 'vendor' ? req.user.id : req.body.vendor;
  const attr = await Attribute.create({ ...req.body, vendor });
  return ok(res, attr, 201);
}

async function updateAttribute(req, res) {
  const attr = await Attribute.findById(req.params.id);
  if (!attr) throw new ApiError(404, 'Attribute not found', 'NOT_FOUND');
  if (req.user.role === 'vendor' && attr.vendor.toString() !== req.user.id) {
    throw new ApiError(403, 'You do not own this attribute', 'FORBIDDEN');
  }
  Object.assign(attr, req.body);
  await attr.save();
  return ok(res, attr);
}

async function deleteAttribute(req, res) {
  const attr = await Attribute.findById(req.params.id);
  if (!attr) throw new ApiError(404, 'Attribute not found', 'NOT_FOUND');
  if (req.user.role === 'vendor' && attr.vendor.toString() !== req.user.id) {
    throw new ApiError(403, 'You do not own this attribute', 'FORBIDDEN');
  }
  await attr.deleteOne();
  return ok(res, { deleted: true });
}

module.exports = { listAttributes, getAttribute, createAttribute, updateAttribute, deleteAttribute };
