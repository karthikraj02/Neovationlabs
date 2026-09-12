jest.mock("../src/models/DemoBooking");
jest.mock("../src/services/emailService", () => ({
  sendContactNotification: jest.fn().mockResolvedValue({ sent: false }),
  sendDemoBookingNotification: jest.fn().mockResolvedValue({ sent: false }),
}));

const request = require("supertest");
const app = require("../src/app");
const DemoBooking = require("../src/models/DemoBooking");

// Far enough ahead that the "not in the past" rule can't fail on a slow run.
function futureDate() {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + 7);
  return d.toISOString().slice(0, 10);
}

const validPayload = {
  name: "Grace Hopper",
  company: "Naval Systems",
  email: "grace@example.com",
  phone: "",
  demos: ["cross-camera-face-search", "offline-document-qa"],
  preferredDate: futureDate(),
  preferredTime: "13:00 – 15:00",
  timezone: "Asia/Kolkata",
  attendees: 3,
  notes: "Two people from security ops will join.",
};

describe("POST /api/demo-bookings", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("accepts a valid request and saves the booking", async () => {
    DemoBooking.create.mockResolvedValue({ _id: "booking123" });

    const res = await request(app).post("/api/demo-bookings").send(validPayload);

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(DemoBooking.create).toHaveBeenCalledTimes(1);
  });

  it("rejects empty input with field-level errors", async () => {
    const res = await request(app).post("/api/demo-bookings").send({});

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(Array.isArray(res.body.details)).toBe(true);
    expect(DemoBooking.create).not.toHaveBeenCalled();
  });

  it("rejects a booking with no demo selected", async () => {
    const res = await request(app)
      .post("/api/demo-bookings")
      .send({ ...validPayload, demos: [] });

    expect(res.statusCode).toBe(400);
    expect(res.body.details.map((d) => d.field)).toContain("demos");
    expect(DemoBooking.create).not.toHaveBeenCalled();
  });

  it("rejects an unknown demo slug", async () => {
    const res = await request(app)
      .post("/api/demo-bookings")
      .send({ ...validPayload, demos: ["not-a-real-demo"] });

    expect(res.statusCode).toBe(400);
    expect(DemoBooking.create).not.toHaveBeenCalled();
  });

  it("rejects a date in the past", async () => {
    const res = await request(app)
      .post("/api/demo-bookings")
      .send({ ...validPayload, preferredDate: "2020-01-01" });

    expect(res.statusCode).toBe(400);
    expect(res.body.details.map((d) => d.field)).toContain("preferredDate");
    expect(DemoBooking.create).not.toHaveBeenCalled();
  });

  it("rejects a time window that isn't offered", async () => {
    const res = await request(app)
      .post("/api/demo-bookings")
      .send({ ...validPayload, preferredTime: "03:00 – 04:00" });

    expect(res.statusCode).toBe(400);
    expect(DemoBooking.create).not.toHaveBeenCalled();
  });

  it("rejects requests where the honeypot field is filled in", async () => {
    const res = await request(app)
      .post("/api/demo-bookings")
      .send({ ...validPayload, website: "http://spam-bot.example" });

    expect(res.statusCode).toBe(400);
    expect(DemoBooking.create).not.toHaveBeenCalled();
  });

  it("returns a 500 with a safe message when the database save fails", async () => {
    DemoBooking.create.mockRejectedValue(new Error("connection timeout"));

    const res = await request(app).post("/api/demo-bookings").send(validPayload);

    expect(res.statusCode).toBe(500);
    expect(res.body.success).toBe(false);
  });
});
