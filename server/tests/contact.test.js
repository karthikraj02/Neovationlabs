// Copyright (c) 2026 Karthik Raj. All rights reserved. https://beautiful-alpaca-6b1495.netlify.app/
jest.mock("../src/models/ContactSubmission");
jest.mock("../src/services/emailService", () => ({
  sendContactNotification: jest.fn().mockResolvedValue({ sent: false }),
}));
jest.mock("../src/services/whatsappService", () => ({
  sendContactWhatsApp: jest.fn().mockResolvedValue({ sent: false }),
}));

const request = require("supertest");
const app = require("../src/app");
const ContactSubmission = require("../src/models/ContactSubmission");
const { sendContactNotification } = require("../src/services/emailService");
const { sendContactWhatsApp } = require("../src/services/whatsappService");

const validPayload = {
  name: "Ada Lovelace",
  company: "Analytical Engines Inc.",
  email: "ada@example.com",
  phone: "",
  projectType: "Generative AI",
  message: "We'd like to explore an internal knowledge assistant for our support team.",
};

describe("POST /api/contact", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("accepts valid input and saves a submission", async () => {
    ContactSubmission.create.mockResolvedValue({ _id: "abc123" });

    const res = await request(app).post("/api/contact").send(validPayload);

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(ContactSubmission.create).toHaveBeenCalledTimes(1);
  });

  it("alerts the team by email and by WhatsApp with the saved details", async () => {
    ContactSubmission.create.mockResolvedValue({ _id: "abc123" });

    const res = await request(app).post("/api/contact").send(validPayload);

    expect(res.statusCode).toBe(201);
    expect(sendContactNotification).toHaveBeenCalledTimes(1);
    expect(sendContactWhatsApp).toHaveBeenCalledTimes(1);
    expect(sendContactWhatsApp.mock.calls[0][0]).toMatchObject({
      name: "Ada Lovelace",
      email: "ada@example.com",
      projectType: "Generative AI",
    });
  });

  it("still succeeds, and stays saved, when the WhatsApp and email alerts both fail", async () => {
    ContactSubmission.create.mockResolvedValue({ _id: "abc123" });
    sendContactNotification.mockRejectedValueOnce(new Error("smtp down"));
    sendContactWhatsApp.mockRejectedValueOnce(new Error("whatsapp down"));
    const error = jest.spyOn(console, "error").mockImplementation(() => {});

    const res = await request(app).post("/api/contact").send(validPayload);

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(ContactSubmission.create).toHaveBeenCalledTimes(1);
    expect(error).toHaveBeenCalledWith(expect.stringContaining("[whatsapp]"), "whatsapp down");
    expect(error).toHaveBeenCalledWith(expect.stringContaining("[email]"), "smtp down");
    error.mockRestore();
  });

  describe("records what happened to the alerts with the enquiry", () => {
    const savedAlerts = () => ContactSubmission.updateOne.mock.calls[0][1].$set.alerts;

    it("notes when both alerts were sent", async () => {
      ContactSubmission.create.mockResolvedValue({ _id: "abc123" });
      sendContactNotification.mockResolvedValueOnce({ sent: true });
      sendContactWhatsApp.mockResolvedValueOnce({ sent: true, provider: "callmebot" });

      await request(app).post("/api/contact").send(validPayload);

      expect(ContactSubmission.updateOne.mock.calls[0][0]).toEqual({ _id: "abc123" });
      expect(savedAlerts().email).toEqual({ status: "sent" });
      expect(savedAlerts().whatsapp).toEqual({ status: "sent" });
      expect(savedAlerts().at).toBeInstanceOf(Date);
    });

    it("notes when an alert was skipped because that service is not set up", async () => {
      ContactSubmission.create.mockResolvedValue({ _id: "abc123" });
      sendContactNotification.mockResolvedValueOnce({ sent: false, reason: "email-not-configured" });
      sendContactWhatsApp.mockResolvedValueOnce({ sent: false, reason: "whatsapp-not-configured" });

      await request(app).post("/api/contact").send(validPayload);

      expect(savedAlerts().email).toEqual({ status: "skipped", detail: "email-not-configured" });
      expect(savedAlerts().whatsapp).toEqual({ status: "skipped", detail: "whatsapp-not-configured" });
    });

    it("notes a partial delivery, naming who missed out", async () => {
      ContactSubmission.create.mockResolvedValue({ _id: "abc123" });
      sendContactNotification.mockResolvedValueOnce({ sent: true, failed: ["neovationlabs@outlook.com"] });

      await request(app).post("/api/contact").send(validPayload);

      expect(savedAlerts().email).toEqual({
        status: "partial",
        detail: "Not delivered to neovationlabs@outlook.com",
      });
    });

    it("notes a failure with the reason, while the visitor still gets a success", async () => {
      ContactSubmission.create.mockResolvedValue({ _id: "abc123" });
      sendContactNotification.mockRejectedValueOnce(new Error("Resend delivered to no one. Resend responded 403"));
      const error = jest.spyOn(console, "error").mockImplementation(() => {});

      const res = await request(app).post("/api/contact").send(validPayload);

      expect(res.statusCode).toBe(201);
      expect(savedAlerts().email).toEqual({ status: "failed", detail: "Resend delivered to no one. Resend responded 403" });
      error.mockRestore();
    });

    it("does not fail the submission if recording the outcome itself fails", async () => {
      ContactSubmission.create.mockResolvedValue({ _id: "abc123" });
      ContactSubmission.updateOne.mockRejectedValueOnce(new Error("database hiccup"));
      const error = jest.spyOn(console, "error").mockImplementation(() => {});

      const res = await request(app).post("/api/contact").send(validPayload);

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      error.mockRestore();
    });
  });

  it("does not hold the visitor up when an alert provider never answers", async () => {
    jest.useFakeTimers();
    try {
      ContactSubmission.create.mockResolvedValue({ _id: "abc123" });
      sendContactWhatsApp.mockImplementationOnce(() => new Promise(() => {})); // hangs forever

      // eslint-disable-next-line global-require
      const { submitContact } = require("../src/controllers/contactController");
      const req = { validatedBody: { ...validPayload, website: "" }, ip: "203.0.113.9" };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      const finished = submitContact(req, res, jest.fn());

      await jest.advanceTimersByTimeAsync(7000);
      expect(res.json).not.toHaveBeenCalled(); // still waiting, within the cap

      await jest.advanceTimersByTimeAsync(1500);
      await finished;
      expect(res.status).toHaveBeenCalledWith(201); // gave up waiting and answered
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
    } finally {
      jest.useRealTimers();
    }
  });

  it("does not send any alert for a submission that fails validation", async () => {
    const res = await request(app).post("/api/contact").send({ ...validPayload, email: "nope" });

    expect(res.statusCode).toBe(400);
    expect(sendContactNotification).not.toHaveBeenCalled();
    expect(sendContactWhatsApp).not.toHaveBeenCalled();
  });

  it("does not require a budget", async () => {
    ContactSubmission.create.mockResolvedValue({ _id: "abc123" });

    const res = await request(app).post("/api/contact").send(validPayload);

    expect(res.statusCode).toBe(201);
    expect(validPayload).not.toHaveProperty("budget");
  });

  it("still accepts a submission from an older page that sends a budget, and ignores it", async () => {
    ContactSubmission.create.mockResolvedValue({ _id: "abc123" });

    const res = await request(app)
      .post("/api/contact")
      .send({ ...validPayload, budget: "$25k – $75k" });

    expect(res.statusCode).toBe(201);
    const saved = ContactSubmission.create.mock.calls[0][0];
    expect(saved).not.toHaveProperty("budget");
  });

  it("rejects empty input with field-level errors", async () => {
    const res = await request(app).post("/api/contact").send({});

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(Array.isArray(res.body.details)).toBe(true);
    expect(res.body.details.length).toBeGreaterThan(0);
    expect(ContactSubmission.create).not.toHaveBeenCalled();
  });

  it("rejects invalid input (bad email, short message, unknown project type)", async () => {
    const res = await request(app)
      .post("/api/contact")
      .send({
        ...validPayload,
        email: "not-an-email",
        message: "too short",
        projectType: "Something Else",
      });

    expect(res.statusCode).toBe(400);
    const fields = res.body.details.map((d) => d.field);
    expect(fields).toEqual(expect.arrayContaining(["email", "message", "projectType"]));
    expect(ContactSubmission.create).not.toHaveBeenCalled();
  });

  it("strips NoSQL operator injection attempts before validation", async () => {
    const res = await request(app)
      .post("/api/contact")
      .send({
        ...validPayload,
        email: { $ne: null },
      });

    // The sanitizer strips the object down to {}, so the field then fails
    // normal type validation rather than reaching the database as an operator.
    expect(res.statusCode).toBe(400);
    expect(ContactSubmission.create).not.toHaveBeenCalled();
  });

  it("rejects submissions where the honeypot field is filled in", async () => {
    const res = await request(app)
      .post("/api/contact")
      .send({ ...validPayload, website: "http://spam-bot.example" });

    expect(res.statusCode).toBe(400);
    expect(ContactSubmission.create).not.toHaveBeenCalled();
  });

  it.each(["Networking", "Internet of Things"])("accepts the %s project type", async (projectType) => {
    ContactSubmission.create.mockResolvedValue({ _id: "abc123" });

    const res = await request(app).post("/api/contact").send({ ...validPayload, projectType });

    expect(res.statusCode).toBe(201);
    expect(ContactSubmission.create).toHaveBeenCalledWith(expect.objectContaining({ projectType }));
  });

  it("returns a 500 with a safe message when the database save fails", async () => {
    ContactSubmission.create.mockRejectedValue(new Error("connection timeout"));

    const res = await request(app).post("/api/contact").send(validPayload);

    expect(res.statusCode).toBe(500);
    expect(res.body.success).toBe(false);
  });
});
