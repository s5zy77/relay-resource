const { ApiError } = require('../utils/apiResponse');

/**
 * Generic Zod validation wrapper.
 * Usage: validate(schema, 'body' | 'query' | 'params')
 */
function validate(schema, source = 'body') {
  return function (req, res, next) {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      const message = result.error.issues
        .map((i) => `${i.path.join('.')}: ${i.message}`)
        .join('; ');
      throw new ApiError(400, message, 'VALIDATION_ERROR');
    }
    req[source] = result.data;
    next();
  };
}

module.exports = validate;
