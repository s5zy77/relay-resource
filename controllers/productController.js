const Product = require('../models/Product');
const { ok, paginated, ApiError } = require('../utils/apiResponse');

function scopeToVendor(req, filter) {
  const role = req.user?.role;
  if (role === 'vendor') filter.vendor = req.user.id;
  if (!role || role === 'customer') filter.publish = true; // guests + customers see only published
  return filter;
}

async function listProducts(req, res) {
  const { page = 1, limit = 20, search, type, publish, vendor } = req.query;
  const filter = {};
  if (search) filter.name = new RegExp(search, 'i');
  if (type) filter.type = type;
  if (publish !== undefined && req.user?.role === 'admin') filter.publish = publish === 'true';
  if (vendor && req.user?.role === 'admin') filter.vendor = vendor;
  scopeToVendor(req, filter);


  const total = await Product.countDocuments(filter);
  const items = await Product.find(filter)
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .sort({ createdAt: -1 });

  return paginated(res, items, total, page, limit);
}

async function getProduct(req, res) {
  const product = await Product.findById(req.params.id);
  if (!product) throw new ApiError(404, 'Product not found', 'NOT_FOUND');
  return ok(res, product);
}

async function createProduct(req, res) {
  const vendor = req.user.role === 'vendor' ? req.user.id : req.body.vendor;
  if (!vendor) throw new ApiError(400, 'vendor is required', 'VALIDATION_ERROR');

  const payload = { ...req.body, vendor };
  // Only admins may publish at creation time
  if (req.user.role !== 'admin') payload.publish = false;

  const product = await Product.create(payload);
  return ok(res, product, 201);
}

async function updateProduct(req, res) {
  const product = await Product.findById(req.params.id);
  if (!product) throw new ApiError(404, 'Product not found', 'NOT_FOUND');

  if (req.user.role === 'vendor' && product.vendor.toString() !== req.user.id) {
    throw new ApiError(403, 'You do not own this product', 'FORBIDDEN');
  }

  const updates = { ...req.body };
  if (req.user.role !== 'admin') delete updates.publish; // publish toggle is admin-only

  Object.assign(product, updates);
  await product.save();
  return ok(res, product);
}

async function togglePublish(req, res) {
  if (req.user.role !== 'admin') {
    throw new ApiError(403, 'Only admins can publish products', 'FORBIDDEN');
  }
  const product = await Product.findById(req.params.id);
  if (!product) throw new ApiError(404, 'Product not found', 'NOT_FOUND');

  product.publish = req.body.publish !== undefined ? !!req.body.publish : !product.publish;
  await product.save();
  return ok(res, product);
}

async function deleteProduct(req, res) {
  const product = await Product.findById(req.params.id);
  if (!product) throw new ApiError(404, 'Product not found', 'NOT_FOUND');
  if (req.user.role === 'vendor' && product.vendor.toString() !== req.user.id) {
    throw new ApiError(403, 'You do not own this product', 'FORBIDDEN');
  }
  await product.deleteOne();
  return ok(res, { deleted: true });
}

module.exports = {
  listProducts,
  getProduct,
  createProduct,
  updateProduct,
  togglePublish,
  deleteProduct,
};
