// Copyright (c) 2026 Karthik Raj. All rights reserved. https://beautiful-alpaca-6b1495.netlify.app/
const ContactSubmission = require("../models/ContactSubmission");
const { sendContactNotification } = require("../services/emailService");
const { sendContactWhatsApp } = require("../services/whatsappService");
const { ApiError } = require("../middleware/errorHandler");

// Alerts are awaited (not fired and forgotten) because on serverless hosting the
// process can be frozen as soon as the response is sent, which would silently drop
// them. The wait is capped so a slow provider can't hold up the visitor, and a
// failed alert is logged but never fails the submission (it is already saved).
const NOTIFY_WAIT_MS = 8000;

async function waitForAlerts(alerts) {
  let timer;
  const cap = new Promise((resolve) => {
    timer = setTimeout(resolve, NOTIFY_WAIT_MS);
  });
  try {
    await Promise.race([Promise.all(alerts), cap]);
  } finally {
    clearTimeout(timer);
  }
}

// What an alert returned, as the short record kept with the enquiry.
function outcomeOf(result) {
  if (result && result.sent) {
    return result.failed && result.failed.length
      ? { status: "partial", detail: `Not delivered to ${result.failed.join(", ")}` }
      : { status: "sent" };
  }
  return { status: "skipped", detail: (result && result.reason) || "not configured" };
}

const failureOf = (err) => ({ status: "failed", detail: String((err && err.message) || err).slice(0, 400) });

async function submitContact(req, res, next) {
  try {
    // eslint-disable-next-line no-unused-vars
    const { website, ...data } = req.validatedBody;

    const submission = await ContactSubmission.create({
      ...data,
      ip: req.ip,
    });

    const alerts = { email: null, whatsapp: null };
    await waitForAlerts([
      sendContactNotification(data)
        .then((result) => {
          alerts.email = outcomeOf(result);
        })
        .catch((err) => {
          // eslint-disable-next-line no-console
          console.error("[email] Failed to send contact notification:", err.message);
          alerts.email = failureOf(err);
        }),
      sendContactWhatsApp(data)
        .then((result) => {
          alerts.whatsapp = outcomeOf(result);
        })
        .catch((err) => {
          // eslint-disable-next-line no-console
          console.error("[whatsapp] Failed to send contact alert:", err.message);
          alerts.whatsapp = failureOf(err);
        }),
    ]);

    // Keep the outcome with the enquiry, so "did anyone get told?" always has an answer.
    // An alert still running when the wait cap hit is recorded as timed-out. This must
    // never fail the submission, which is already saved.
    try {
      const timedOut = { status: "timed-out", detail: "Still running when the response was sent" };
      await ContactSubmission.updateOne(
        { _id: submission._id },
        { $set: { alerts: { email: alerts.email || timedOut, whatsapp: alerts.whatsapp || timedOut, at: new Date() } } }
      );
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("[alerts] Could not record the alert outcome:", err.message);
    }

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
