function ok(res, data, status = 200) {
  return res.status(status).json({ success: true, data });
}

function paginated(res, items, total, page, limit) {
  return res.status(200).json({
    success: true,
    data: {
      items,
      total,
      page: Number(page),
      pages: Math.max(1, Math.ceil(total / limit)),
    },
  });
}

function fail(res, status, message, code = 'ERROR') {
  return res.status(status).json({ success: false, error: { message, code } });
}

class ApiError extends Error {
  constructor(status, message, code = 'ERROR') {
    super(message);
    this.status = status;
    this.code = code;
  }
}

module.exports = { ok, paginated, fail, ApiError };
