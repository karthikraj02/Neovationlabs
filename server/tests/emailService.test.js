// Copyright (c) 2026 Karthik Raj. All rights reserved. https://beautiful-alpaca-6b1495.netlify.app/
const TEAM = ["neovationlabs@outlook.com", "neovationlabs.official@gmail.com"];

const submission = {
  name: "Ada Lovelace",
  company: "Analytical Engines Inc.",
  email: "ada@example.com",
  phone: "+44 20 7946 0000",
  projectType: "Generative AI",
  message: "We'd like to explore an internal knowledge assistant for our support team.",
};

// The config module reads process.env when it is first required, so each test
// sets its environment and then loads the service fresh.
function loadService(env = {}) {
  jest.resetModules();
  const sendMail = jest.fn().mockResolvedValue({});
  jest.doMock("nodemailer", () => ({ createTransport: jest.fn(() => ({ sendMail })) }));
  Object.assign(process.env, {
    SMTP_HOST: "smtp.test.example",
    SMTP_USER: "sender@test.example",
    SMTP_PASSWORD: "not-a-real-password",
    CONTACT_NOTIFY_EMAIL: "",
    ...env,
  });
  // eslint-disable-next-line global-require
  const service = require("../src/services/emailService");
  return { ...service, sendMail };
}

describe("contact notification email", () => {
  afterEach(() => {
    jest.dontMock("nodemailer");
    delete process.env.SMTP_HOST;
    delete process.env.SMTP_USER;
    delete process.env.SMTP_PASSWORD;
    delete process.env.CONTACT_NOTIFY_EMAIL;
  });

  it("goes to both team inboxes", async () => {
    const { sendContactNotification, sendMail } = loadService();

    const result = await sendContactNotification(submission);

    expect(result).toEqual({ sent: true });
    expect(sendMail).toHaveBeenCalledTimes(1);
    expect(sendMail.mock.calls[0][0].to).toEqual(TEAM);
  });

  it("still reaches both inboxes when the env var lists only one of them", async () => {
    const { sendContactNotification, sendMail } = loadService({
      CONTACT_NOTIFY_EMAIL: "NeovationLabs@Outlook.com",
    });

    await sendContactNotification(submission);

    expect(sendMail.mock.calls[0][0].to).toEqual(TEAM);
  });

  it("adds extra recipients from the env var without replacing the team inboxes", async () => {
    const { sendContactNotification, sendMail } = loadService({
      CONTACT_NOTIFY_EMAIL: "boss@example.com, ops@example.com",
    });

    await sendContactNotification(submission);

    expect(sendMail.mock.calls[0][0].to).toEqual([...TEAM, "boss@example.com", "ops@example.com"]);
  });

  it("lets the team reply straight to the visitor and includes their phone number", async () => {
    const { sendContactNotification, sendMail } = loadService();

    await sendContactNotification(submission);

    const mail = sendMail.mock.calls[0][0];
    expect(mail.replyTo).toBe("ada@example.com");
    expect(mail.text).toContain("Phone: +44 20 7946 0000");
    expect(mail.text).toContain("Project type: Generative AI");
    expect(mail.text).toContain(submission.message);
    expect(mail.text).not.toMatch(/budget/i);
  });

  it("is skipped, not thrown, when SMTP is not configured", async () => {
    const { sendContactNotification, sendMail } = loadService({ SMTP_HOST: "", SMTP_USER: "", SMTP_PASSWORD: "" });
    const warn = jest.spyOn(console, "warn").mockImplementation(() => {});

    const result = await sendContactNotification(submission);

    expect(result).toEqual({ sent: false, reason: "smtp-not-configured" });
    expect(sendMail).not.toHaveBeenCalled();
    warn.mockRestore();
  });
});
