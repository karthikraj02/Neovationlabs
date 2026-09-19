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

describe("Unknown route", () => {
  it("returns a 404 with a helpful message", async () => {
    const res = await request(app).get("/api/does-not-exist");
    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
  });
});
