// Copyright (c) 2026 Karthik Raj. All rights reserved. https://beautiful-alpaca-6b1495.netlify.app/
jest.mock("../src/models/ContactSubmission");
jest.mock("../src/services/emailService", () => ({
  sendContactNotification: jest.fn().mockResolvedValue({ sent: false }),
}));

const request = require("supertest");
const app = require("../src/app");
const ContactSubmission = require("../src/models/ContactSubmission");

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
