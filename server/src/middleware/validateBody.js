const { ApiError } = require("./errorHandler");

function validateBody(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const details = result.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      }));
      return next(new ApiError(400, "Validation failed", details));
    }
    req.validatedBody = result.data;
    next();
  };
}

module.exports = { validateBody };
