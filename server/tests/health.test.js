const request = require("supertest");
const app = require("../src/app");

describe("GET /api/health", () => {
  it("returns service status ok", async () => {
    const res = await request(app).get("/api/health");
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ status: "ok", service: "neovationlabs-api" });
  });
});

describe("Unknown route", () => {
  it("returns a 404 with a helpful message", async () => {
    const res = await request(app).get("/api/does-not-exist");
    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
  });
});
