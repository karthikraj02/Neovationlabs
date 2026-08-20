const nodemailer = require("nodemailer");
const { smtp } = require("../config/env");

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;
  if (!smtp.host || !smtp.user || !smtp.password) return null;

  transporter = nodemailer.createTransport({
    host: smtp.host,
    port: smtp.port,
    secure: smtp.port === 465,
    auth: { user: smtp.user, pass: smtp.password },
  });
  return transporter;
}

async function sendContactNotification(submission) {
  const mailer = getTransporter();
  if (!mailer) {
    // eslint-disable-next-line no-console
    console.warn("[email] SMTP not configured — skipping notification email.");
    return { sent: false, reason: "smtp-not-configured" };
  }

  const { name, company, email, projectType, budget, message } = submission;

  await mailer.sendMail({
    from: `"NeovationLabs" <${smtp.user}>`,
    to: smtp.notifyTo,
    replyTo: email,
    subject: `New project request — ${projectType} (${name})`,
    text: [
      `Name: ${name}`,
      `Company: ${company || "—"}`,
      `Email: ${email}`,
      `Project type: ${projectType}`,
      `Budget: ${budget}`,
      "",
      message,
    ].join("\n"),
  });

  return { sent: true };
}

module.exports = { sendContactNotification };
