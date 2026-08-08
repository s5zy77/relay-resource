const { ok, ApiError } = require('../utils/apiResponse');

async function uploadFile(req, res) {
  if (!req.file) throw new ApiError(400, 'No file uploaded', 'VALIDATION_ERROR');
  const url = `/uploads/${req.file.filename}`;
  return ok(res, { url, filename: req.file.filename }, 201);
}

module.exports = { uploadFile };
