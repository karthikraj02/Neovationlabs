// Copyright (c) 2026 Karthik Raj. All rights reserved. https://beautiful-alpaca-6b1495.netlify.app/
const request = require("supertest");

// The gate is only active when MONGODB_URI is set, and the app reads it when first
// required, so each test sets it and loads the app fresh with a stand-in db module.
function appWith({ connectDB, status = { status: "connected" } }) {
  jest.resetModules();
  process.env.MONGODB_URI = "mongodb+srv://user:pw@cluster.example.mongodb.net/db";
  const fake = { connectDB: jest.fn(connectDB), getDbStatus: jest.fn(() => status) };
  jest.doMock("../src/config/db", () => fake);
  // eslint-disable-next-line global-require
  return { app: require("../src/app"), fake };
}

describe("database gate on API requests", () => {
  afterEach(() => {
    jest.dontMock("../src/config/db");
    process.env.MONGODB_URI = "";
  });

  it("makes sure the database is connected before handling an API request", async () => {
    const { app, fake } = appWith({ connectDB: async () => ({}) });

    const res = await request(app).get("/api/does-not-exist");

    expect(fake.connectDB).toHaveBeenCalledTimes(1);
    expect(res.statusCode).toBe(404); // got past the gate to the normal not-found handler
  });

  it("answers 503 with a plain message, not a 10-second hang, when it cannot connect", async () => {
    const { app } = appWith({
      connectDB: async () => {
        throw new Error("Could not connect to any servers");
      },
    });

    const res = await request(app).get("/api/services");

    expect(res.statusCode).toBe(503);
    expect(res.body).toEqual({
      success: false,
      message: "We're having trouble reaching our database. Please try again in a moment.",
    });
  });

  it("does not leak the underlying error text to the visitor", async () => {
    const { app } = appWith({
      connectDB: async () => {
        throw new Error("bad auth for user some-user at private-cluster.example.mongodb.net");
      },
    });

    const res = await request(app).post("/api/contact").send({});

    expect(res.statusCode).toBe(503);
    expect(JSON.stringify(res.body)).not.toContain("some-user");
    expect(JSON.stringify(res.body)).not.toContain("private-cluster");
  });

  it("lets the health page answer even when the database is down, without connecting", async () => {
    const { app, fake } = appWith({
      connectDB: async () => {
        throw new Error("down");
      },
      status: { status: "failed", reason: "cluster-unreachable-or-blocked", hint: "Allow 0.0.0.0/0 in Atlas." },
    });

    const res = await request(app).get("/api/health");

    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe("ok");
    expect(res.body.database).toMatchObject({ status: "failed", reason: "cluster-unreachable-or-blocked" });
    expect(fake.connectDB).not.toHaveBeenCalled();
  });

  it("makes a live attempt for /api/health?db=1, and still answers if it fails", async () => {
    const { app, fake } = appWith({
      connectDB: async () => {
        throw new Error("down");
      },
      status: { status: "failed", reason: "authentication-failed", hint: "Wrong password." },
    });

    const res = await request(app).get("/api/health?db=1");

    expect(fake.connectDB).toHaveBeenCalledTimes(1);
    expect(res.statusCode).toBe(200);
    expect(res.body.database.reason).toBe("authentication-failed");
  });

  it("does nothing when no database is configured (local work and tests use mocks)", async () => {
    jest.resetModules();
    process.env.MONGODB_URI = "";
    const fake = { connectDB: jest.fn(), getDbStatus: jest.fn(() => ({ status: "not-configured" })) };
    jest.doMock("../src/config/db", () => fake);
    // eslint-disable-next-line global-require
    const app = require("../src/app");

    const res = await request(app).get("/api/does-not-exist");

    expect(fake.connectDB).not.toHaveBeenCalled();
    expect(res.statusCode).toBe(404);
  });
});
