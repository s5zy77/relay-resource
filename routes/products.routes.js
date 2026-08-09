const express = require('express');
const { verifyAccessTokenMw, optionalAuth, requireRole } = require('../middleware/auth');
const products = require('../controllers/productController');

const router = express.Router();

// Public browsing — guests can list/view products without logging in
router.get('/', optionalAuth, products.listProducts);
router.get('/:id', optionalAuth, products.getProduct);

// Write operations require a verified session
router.post('/', verifyAccessTokenMw, requireRole('admin', 'vendor'), products.createProduct);
router.patch('/:id', verifyAccessTokenMw, requireRole('admin', 'vendor'), products.updateProduct);
router.patch('/:id/publish', verifyAccessTokenMw, requireRole('admin'), products.togglePublish);
router.delete('/:id', verifyAccessTokenMw, requireRole('admin', 'vendor'), products.deleteProduct);

module.exports = router;

