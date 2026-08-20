function stripBadKeys(value) {
  if (Array.isArray(value)) {
    return value.map(stripBadKeys);
  }
  if (value && typeof value === "object") {
    const clean = {};
    for (const [key, val] of Object.entries(value)) {
      if (key.startsWith("$") || key.includes(".")) continue;
      clean[key] = stripBadKeys(val);
    }
    return clean;
  }
  return value;
}

// Express 5 makes req.query / req.params read-only getters, so this only
// sanitizes req.body (the only place this API accepts structured input).
function sanitizeBody(req, res, next) {
  if (req.body && typeof req.body === "object") {
    req.body = stripBadKeys(req.body);
  }
  next();
}

module.exports = { sanitizeBody };
