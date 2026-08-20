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
  budget: "$25k – $75k",
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

  it("returns a 500 with a safe message when the database save fails", async () => {
    ContactSubmission.create.mockRejectedValue(new Error("connection timeout"));

    const res = await request(app).post("/api/contact").send(validPayload);

    expect(res.statusCode).toBe(500);
    expect(res.body.success).toBe(false);
  });
});
