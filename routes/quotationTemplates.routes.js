const express = require('express');
const { verifyAccessTokenMw, requireRole } = require('../middleware/auth');
const qt = require('../controllers/quotationTemplateController');

const router = express.Router();
router.use(verifyAccessTokenMw, requireRole('admin', 'vendor'));

router.get('/', qt.listTemplates);
router.get('/:id', qt.getTemplate);
router.post('/', qt.createTemplate);
router.patch('/:id', qt.updateTemplate);
router.delete('/:id', qt.deleteTemplate);

module.exports = router;
