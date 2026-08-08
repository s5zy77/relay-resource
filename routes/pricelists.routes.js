const express = require('express');
const { verifyAccessTokenMw, requireRole } = require('../middleware/auth');
const pl = require('../controllers/pricelistController');

const router = express.Router();
router.use(verifyAccessTokenMw);

router.get('/', pl.listPriceLists);
router.get('/:id', pl.getPriceList);
router.post('/', requireRole('admin', 'vendor'), pl.createPriceList);
router.patch('/:id', requireRole('admin', 'vendor'), pl.updatePriceList);
router.delete('/:id', requireRole('admin', 'vendor'), pl.deletePriceList);

module.exports = router;
