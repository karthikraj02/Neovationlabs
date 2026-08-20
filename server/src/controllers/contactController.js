const ContactSubmission = require("../models/ContactSubmission");
const { sendContactNotification } = require("../services/emailService");
const { ApiError } = require("../middleware/errorHandler");

async function submitContact(req, res, next) {
  try {
    // eslint-disable-next-line no-unused-vars
    const { website, ...data } = req.validatedBody;

    const submission = await ContactSubmission.create({
      ...data,
      ip: req.ip,
    });

    sendContactNotification(data).catch((err) => {
      // eslint-disable-next-line no-console
      console.error("[email] Failed to send contact notification:", err.message);
    });

    return res.status(201).json({
      success: true,
      message: "Your project request has been received.",
      id: submission._id,
    });
  } catch (err) {
    return next(new ApiError(500, "Could not save your submission. Please try again.", err.message));
  }
}

module.exports = { submitContact };
