const PriceList = require('../models/PriceList');
const { ok, paginated, ApiError } = require('../utils/apiResponse');

function vendorFilter(req, filter = {}) {
  if (req.user.role === 'vendor') filter.vendor = req.user.id;
  return filter;
}

async function listPriceLists(req, res) {
  const { page = 1, limit = 50 } = req.query;
  const filter = vendorFilter(req);
  const total = await PriceList.countDocuments(filter);
  const items = await PriceList.find(filter).skip((page - 1) * limit).limit(Number(limit));
  return paginated(res, items, total, page, limit);
}

async function getPriceList(req, res) {
  const pl = await PriceList.findById(req.params.id);
  if (!pl) throw new ApiError(404, 'Price list not found', 'NOT_FOUND');
  return ok(res, pl);
}

async function createPriceList(req, res) {
  const vendor = req.user.role === 'vendor' ? req.user.id : req.body.vendor;
  const pl = await PriceList.create({ ...req.body, vendor });
  return ok(res, pl, 201);
}

async function updatePriceList(req, res) {
  const pl = await PriceList.findById(req.params.id);
  if (!pl) throw new ApiError(404, 'Price list not found', 'NOT_FOUND');
  if (req.user.role === 'vendor' && pl.vendor.toString() !== req.user.id) {
    throw new ApiError(403, 'You do not own this price list', 'FORBIDDEN');
  }
  Object.assign(pl, req.body);
  await pl.save();
  return ok(res, pl);
}

async function deletePriceList(req, res) {
  const pl = await PriceList.findById(req.params.id);
  if (!pl) throw new ApiError(404, 'Price list not found', 'NOT_FOUND');
  if (req.user.role === 'vendor' && pl.vendor.toString() !== req.user.id) {
    throw new ApiError(403, 'You do not own this price list', 'FORBIDDEN');
  }
  await pl.deleteOne();
  return ok(res, { deleted: true });
}

module.exports = { listPriceLists, getPriceList, createPriceList, updatePriceList, deletePriceList };
