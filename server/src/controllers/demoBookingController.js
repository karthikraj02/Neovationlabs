const DemoBooking = require("../models/DemoBooking");
const { sendDemoBookingNotification } = require("../services/emailService");
const { ApiError } = require("../middleware/errorHandler");

async function requestDemo(req, res, next) {
  try {
    // eslint-disable-next-line no-unused-vars
    const { website, ...data } = req.validatedBody;

    const booking = await DemoBooking.create({
      ...data,
      ip: req.ip,
    });

    sendDemoBookingNotification(data).catch((err) => {
      // eslint-disable-next-line no-console
      console.error("[email] Failed to send demo booking notification:", err.message);
    });

    return res.status(201).json({
      success: true,
      message: "Your demo request has been received.",
      id: booking._id,
    });
  } catch (err) {
    return next(
      new ApiError(500, "Could not save your demo request. Please try again.", err.message)
    );
  }
}

module.exports = { requestDemo };
