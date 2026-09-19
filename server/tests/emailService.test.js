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
    RESEND_API_KEY: "",
    EMAIL_FROM: "",
    ...env,
  });
  // eslint-disable-next-line global-require
  const service = require("../src/services/emailService");
  return { ...service, sendMail };
}

describe("contact notification email", () => {
  afterEach(() => {
    jest.dontMock("nodemailer");
    process.env.SMTP_HOST = "";
    process.env.SMTP_USER = "";
    process.env.SMTP_PASSWORD = "";
    process.env.CONTACT_NOTIFY_EMAIL = "";
    process.env.RESEND_API_KEY = "";
    process.env.EMAIL_FROM = "";
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

    expect(result).toEqual({ sent: false, reason: "email-not-configured" });
    expect(sendMail).not.toHaveBeenCalled();
    warn.mockRestore();
  });
});

describe("email through Resend", () => {
  const realFetch = global.fetch;
  const ok = { ok: true, status: 200, json: async () => ({ id: "email-id" }) };
  const refuse = (message) => ({ ok: false, status: 403, json: async () => ({ statusCode: 403, message }) });

  const withResend = (env = {}, fetchImpl) => {
    global.fetch = fetchImpl || jest.fn().mockResolvedValue(ok);
    return loadService({
      RESEND_API_KEY: "re_test_key_123",
      SMTP_HOST: "",
      SMTP_USER: "",
      SMTP_PASSWORD: "",
      ...env,
    });
  };

  afterEach(() => {
    global.fetch = realFetch;
    process.env.RESEND_API_KEY = "";
    process.env.EMAIL_FROM = "";
  });

  it("sends one email to each team inbox, authenticated with the key", async () => {
    const { sendContactNotification } = withResend();

    const result = await sendContactNotification(submission);

    expect(result).toEqual({ sent: true });
    expect(global.fetch).toHaveBeenCalledTimes(2);
    const sentTo = global.fetch.mock.calls.map(([, init]) => JSON.parse(init.body).to);
    expect(sentTo).toEqual([[TEAM[0]], [TEAM[1]]]);
    const [url, init] = global.fetch.mock.calls[0];
    expect(url).toBe("https://api.resend.com/emails");
    expect(init.method).toBe("POST");
    expect(init.headers.Authorization).toBe("Bearer re_test_key_123");
  });

  it("sends the same content as the SMTP path, with the visitor as the reply-to", async () => {
    const { sendContactNotification } = withResend();

    await sendContactNotification(submission);

    const body = JSON.parse(global.fetch.mock.calls[0][1].body);
    expect(body.reply_to).toBe("ada@example.com");
    expect(body.subject).toBe("New project request — Generative AI (Ada Lovelace)");
    expect(body.text).toContain("Phone: +44 20 7946 0000");
    expect(body.text).toContain(submission.message);
    expect(body.text).not.toMatch(/budget/i);
  });

  it("sends from onboarding@resend.dev by default, and formats a custom EMAIL_FROM", async () => {
    const first = withResend();
    await first.sendContactNotification(submission);
    expect(JSON.parse(global.fetch.mock.calls[0][1].body).from).toBe("NeovationLabs <onboarding@resend.dev>");

    const custom = withResend({ EMAIL_FROM: "alerts@neovationlabs.example" });
    await custom.sendContactNotification(submission);
    expect(JSON.parse(global.fetch.mock.calls[0][1].body).from).toBe("NeovationLabs <alerts@neovationlabs.example>");

    const named = withResend({ EMAIL_FROM: "Team Neovation <alerts@neovationlabs.example>" });
    await named.sendContactNotification(submission);
    expect(JSON.parse(global.fetch.mock.calls[0][1].body).from).toBe("Team Neovation <alerts@neovationlabs.example>");
  });

  it("still delivers to the allowed inbox when Resend refuses the other (no verified domain)", async () => {
    // Without a verified domain Resend only delivers to the account owner's address.
    const fetchImpl = jest.fn((url, init) =>
      Promise.resolve(
        JSON.parse(init.body).to[0] === TEAM[0]
          ? ok
          : refuse("You can only send testing emails to your own email address")
      )
    );
    const { sendContactNotification } = withResend({}, fetchImpl);
    const error = jest.spyOn(console, "error").mockImplementation(() => {});

    const result = await sendContactNotification(submission);

    expect(result).toEqual({ sent: true, failed: [TEAM[1]] });
    expect(error).toHaveBeenCalledWith(expect.stringContaining(TEAM[1]));
    error.mockRestore();
  });

  it("fails, without exposing the key, when Resend delivers to nobody", async () => {
    const { sendContactNotification } = withResend({}, jest.fn().mockResolvedValue(refuse("API key is invalid")));

    let thrown;
    try {
      await sendContactNotification(submission);
    } catch (err) {
      thrown = err;
    }

    expect(thrown.message).toMatch(/delivered to no one/i);
    expect(thrown.message).toMatch(/403/);
    expect(thrown.message).not.toContain("re_test_key_123");
  });

  it("uses Resend rather than SMTP when both are configured", async () => {
    const { sendContactNotification, sendMail } = withResend({
      SMTP_HOST: "smtp.test.example",
      SMTP_USER: "sender@test.example",
      SMTP_PASSWORD: "not-a-real-password",
    });

    await sendContactNotification(submission);

    expect(sendMail).not.toHaveBeenCalled();
    expect(global.fetch).toHaveBeenCalledTimes(2);
  });

  it("also carries demo booking requests to both inboxes", async () => {
    const { sendDemoBookingNotification } = withResend();

    const result = await sendDemoBookingNotification({
      name: "Grace Hopper",
      company: "Naval Systems",
      email: "grace@example.com",
      phone: "",
      demos: ["offline-document-qa"],
      preferredDate: "2026-09-20",
      preferredTime: "13:00 – 15:00",
      timezone: "Asia/Kolkata",
      attendees: 3,
      notes: "",
    });

    expect(result).toEqual({ sent: true });
    const bodies = global.fetch.mock.calls.map(([, init]) => JSON.parse(init.body));
    expect(bodies.map((b) => b.to[0])).toEqual(TEAM);
    expect(bodies[0].subject).toContain("Live demo request");
    expect(bodies[0].text).toContain("DocQuery — Offline Document Q&A");
    expect(bodies[0].reply_to).toBe("grace@example.com");
  });
});

describe("test environment", () => {
  it("never picks up real credentials from a developer's .env", () => {
    jest.resetModules();
    // eslint-disable-next-line global-require
    const config = require("../src/config/env");

    expect(config.email.resendApiKey).toBe("");
    expect(config.smtp.password).toBe("");
    expect(config.whatsapp.callmebot.apiKey).toBe("");
    expect(config.whatsapp.cloud.token).toBe("");
  });

  it("refuses to call a real messaging API from a test", () => {
    // `fetch` here is the guard installed by tests/setup.js.
    const guarded = global.fetch;
    expect(() => guarded("https://api.resend.com/emails", { method: "POST" })).toThrow(/real messaging API/);
    expect(() => guarded("https://api.callmebot.com/whatsapp.php?apikey=x")).toThrow(/real messaging API/);
    expect(() => guarded("https://graph.facebook.com/v21.0/1/messages")).toThrow(/real messaging API/);
  });
});
