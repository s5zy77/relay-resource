const express = require('express');
const { verifyAccessTokenMw, requireRole } = require('../middleware/auth');
const attrs = require('../controllers/attributeController');

const router = express.Router();
router.use(verifyAccessTokenMw, requireRole('admin', 'vendor'));

router.get('/', attrs.listAttributes);
router.get('/:id', attrs.getAttribute);
router.post('/', attrs.createAttribute);
router.patch('/:id', attrs.updateAttribute);
router.delete('/:id', attrs.deleteAttribute);

module.exports = router;
