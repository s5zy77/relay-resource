const express = require('express');
const { verifyAccessTokenMw } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { uploadFile } = require('../controllers/uploadController');

const router = express.Router();
router.use(verifyAccessTokenMw);

router.post('/', upload.single('file'), uploadFile);

module.exports = router;
