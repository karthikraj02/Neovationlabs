// Copyright (c) 2026 Karthik Raj. All rights reserved. https://beautiful-alpaca-6b1495.netlify.app/
const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");
const { jwtSecret } = require("../config/env");
const { ApiError } = require("./errorHandler");

const TOKEN_AUDIENCE = "neovation-admin";

function signAdminToken(admin, expiresIn) {
  return jwt.sign({ email: admin.email, name: admin.name }, jwtSecret, {
    subject: String(admin._id),
    audience: TOKEN_AUDIENCE,
    algorithm: "HS256",
    expiresIn,
  });
}

async function requireAdmin(req, res, next) {
  if (!jwtSecret) return next(new ApiError(503, "Admin access is not configured."));

  const [scheme, token] = (req.get("authorization") || "").split(" ");
  if (scheme !== "Bearer" || !token) return next(new ApiError(401, "Please sign in."));

  let payload;
  try {
    payload = jwt.verify(token, jwtSecret, { algorithms: ["HS256"], audience: TOKEN_AUDIENCE });
  } catch {
    return next(new ApiError(401, "Your session has expired. Please sign in again."));
  }

  try {
    // Looked up on every request so removing an admin revokes access at once.
    const admin = await Admin.findById(payload.sub).select("name email").lean();
    if (!admin) return next(new ApiError(401, "Please sign in."));
    req.admin = { id: String(admin._id), name: admin.name, email: admin.email };
    return next();
  } catch (err) {
    return next(new ApiError(500, "Could not verify your session.", err.message));
  }
}

function validId(req, res, next) {
  return /^[a-f0-9]{24}$/i.test(req.params.id) ? next() : next(new ApiError(400, "Invalid id."));
}

module.exports = { requireAdmin, signAdminToken, validId };
