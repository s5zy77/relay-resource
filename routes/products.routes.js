const express = require('express');
const { verifyAccessTokenMw, requireRole } = require('../middleware/auth');
const products = require('../controllers/productController');

const router = express.Router();
router.use(verifyAccessTokenMw);

router.get('/', products.listProducts);
router.get('/:id', products.getProduct);
router.post('/', requireRole('admin', 'vendor'), products.createProduct);
router.patch('/:id', requireRole('admin', 'vendor'), products.updateProduct);
router.patch('/:id/publish', requireRole('admin'), products.togglePublish);
router.delete('/:id', requireRole('admin', 'vendor'), products.deleteProduct);

module.exports = router;
