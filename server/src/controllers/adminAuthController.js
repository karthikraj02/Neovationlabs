const bcrypt = require("bcryptjs");
const Admin = require("../models/Admin");
const { jwtSecret, adminTokenTtl } = require("../config/env");
const { signAdminToken } = require("../middleware/requireAdmin");
const { ApiError } = require("../middleware/errorHandler");

// Compared against when the email doesn't exist, so response timing doesn't
// reveal which addresses belong to an admin.
let dummyHash;
function getDummyHash() {
  if (!dummyHash) dummyHash = bcrypt.hashSync("not-a-real-admin-password", 10);
  return dummyHash;
}

async function login(req, res, next) {
  if (!jwtSecret) return next(new ApiError(503, "Admin access is not configured."));

  const { email, password } = req.validatedBody;
  try {
    const admin = await Admin.findOne({ email: email.toLowerCase() }).select("+passwordHash");
    const valid = await bcrypt.compare(password, admin?.passwordHash || getDummyHash());
    if (!admin || !valid) return next(new ApiError(401, "Invalid email or password."));

    await Admin.updateOne({ _id: admin._id }, { $set: { lastLoginAt: new Date() } });

    return res.json({
      success: true,
      token: signAdminToken(admin, adminTokenTtl),
      admin: { name: admin.name, email: admin.email },
    });
  } catch (err) {
    return next(new ApiError(500, "Could not sign in. Please try again.", err.message));
  }
}

function me(req, res) {
  res.json({ success: true, admin: { name: req.admin.name, email: req.admin.email } });
}

module.exports = { login, me };
