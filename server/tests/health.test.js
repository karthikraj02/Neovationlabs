// Copyright (c) 2026 Karthik Raj. All rights reserved. https://beautiful-alpaca-6b1495.netlify.app/
const request = require("supertest");
const app = require("../src/app");

describe("GET /api/health", () => {
  it("returns service status ok", async () => {
    const res = await request(app).get("/api/health");
    expect(res.statusCode).toBe(200);
    expect(res.body).toMatchObject({ status: "ok", service: "neovationlabs-api" });
  });

  it("says plainly that the database is not configured when there is no MONGODB_URI", async () => {
    const res = await request(app).get("/api/health");
    expect(res.body.database.status).toBe("not-configured");
    expect(res.body.database.hint).toMatch(/MONGODB_URI/);
  });
});

describe("GET /api/health notifications", () => {
  it("says whether email and WhatsApp alerts are set up, without exposing any secret or address", async () => {
    const res = await request(app).get("/api/health");

    expect(res.body.notifications.email).toMatchObject({ configured: false, provider: null });
    expect(res.body.notifications.email.hint).toMatch(/RESEND_API_KEY/);
    expect(res.body.notifications.whatsapp).toMatchObject({ configured: false, provider: null });
    const published = JSON.stringify(res.body);
    expect(published).not.toMatch(/neovationlabs@outlook\.com|neovationlabs\.official@gmail\.com/);
    expect(published).not.toMatch(/re_[A-Za-z0-9_]{10,}/);
  });
});

describe("Unknown route", () => {
  it("returns a 404 with a helpful message", async () => {
    const res = await request(app).get("/api/does-not-exist");
    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
  });
});
