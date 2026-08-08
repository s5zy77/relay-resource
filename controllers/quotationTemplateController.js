const QuotationTemplate = require('../models/QuotationTemplate');
const { ok, paginated, ApiError } = require('../utils/apiResponse');

function vendorFilter(req, filter = {}) {
  if (req.user.role === 'vendor') filter.vendor = req.user.id;
  return filter;
}

async function listTemplates(req, res) {
  const { page = 1, limit = 50 } = req.query;
  const filter = vendorFilter(req);
  const total = await QuotationTemplate.countDocuments(filter);
  const items = await QuotationTemplate.find(filter)
    .populate('lines.product')
    .skip((page - 1) * limit)
    .limit(Number(limit));
  return paginated(res, items, total, page, limit);
}

async function getTemplate(req, res) {
  const t = await QuotationTemplate.findById(req.params.id).populate('lines.product');
  if (!t) throw new ApiError(404, 'Template not found', 'NOT_FOUND');
  return ok(res, t);
}

async function createTemplate(req, res) {
  const vendor = req.user.role === 'vendor' ? req.user.id : req.body.vendor;
  const t = await QuotationTemplate.create({ ...req.body, vendor });
  return ok(res, t, 201);
}

async function updateTemplate(req, res) {
  const t = await QuotationTemplate.findById(req.params.id);
  if (!t) throw new ApiError(404, 'Template not found', 'NOT_FOUND');
  if (req.user.role === 'vendor' && t.vendor.toString() !== req.user.id) {
    throw new ApiError(403, 'You do not own this template', 'FORBIDDEN');
  }
  Object.assign(t, req.body);
  await t.save();
  return ok(res, t);
}

async function deleteTemplate(req, res) {
  const t = await QuotationTemplate.findById(req.params.id);
  if (!t) throw new ApiError(404, 'Template not found', 'NOT_FOUND');
  if (req.user.role === 'vendor' && t.vendor.toString() !== req.user.id) {
    throw new ApiError(403, 'You do not own this template', 'FORBIDDEN');
  }
  await t.deleteOne();
  return ok(res, { deleted: true });
}

module.exports = { listTemplates, getTemplate, createTemplate, updateTemplate, deleteTemplate };
