// Copyright (c) 2026 Karthik Raj. All rights reserved. https://beautiful-alpaca-6b1495.netlify.app/
const SECRET_URI = "mongodb+srv://some-user:some-secret-password@private-cluster.example.mongodb.net/appdb";

// The db module reads MONGODB_URI when first required, so each test sets it and then
// loads a fresh copy. `mongoose.connect` is replaced, so nothing real is contacted.
function loadDb({ uri = SECRET_URI, connect } = {}) {
  jest.resetModules();
  process.env.MONGODB_URI = uri;
  // eslint-disable-next-line global-require
  const mongoose = require("mongoose");
  const connectSpy = jest.spyOn(mongoose, "connect").mockImplementation(connect || (async () => mongoose));
  // eslint-disable-next-line global-require
  const db = require("../src/config/db");
  return { ...db, connectSpy };
}

const named = (name, message, extra = {}) => Object.assign(new Error(message), { name, ...extra });

describe("database connection status", () => {
  beforeEach(() => {
    jest.spyOn(console, "error").mockImplementation(() => {});
    jest.spyOn(console, "warn").mockImplementation(() => {});
    jest.spyOn(console, "log").mockImplementation(() => {});
  });
  afterEach(() => {
    jest.restoreAllMocks();
    process.env.MONGODB_URI = "";
  });

  it("reports 'not-configured', and never tries to connect, with no MONGODB_URI", async () => {
    const { connectDB, getDbStatus, connectSpy } = loadDb({ uri: "" });

    expect(await connectDB()).toBeNull();

    expect(connectSpy).not.toHaveBeenCalled();
    expect(getDbStatus()).toMatchObject({ status: "not-configured", reason: "not-configured" });
    expect(getDbStatus().hint).toMatch(/redeploy/i);
  });

  it("reports 'connected' after a successful connection", async () => {
    const { connectDB, getDbStatus } = loadDb();

    await connectDB();

    expect(getDbStatus()).toEqual({ status: "connected" });
  });

  it.each([
    ["a malformed connection string", named("MongoParseError", 'Invalid scheme, expected connection string to start with "mongodb://" or "mongodb+srv://"'), "invalid-connection-string"],
    ["a wrong password", named("MongoServerError", "bad auth : authentication failed", { code: 18 }), "authentication-failed"],
    ["a cluster hostname that does not resolve", new Error("querySrv ENOTFOUND _mongodb._tcp.private-cluster.example.mongodb.net"), "dns-lookup-failed"],
    ["Atlas refusing the connection", named("MongoServerSelectionError", "Could not connect to any servers in your MongoDB Atlas cluster. One common reason is that you're trying to access the database from an IP that isn't whitelisted."), "cluster-unreachable-or-blocked"],
    ["something unrecognised", new Error("the flux capacitor overheated"), "unknown"],
  ])("explains %s", async (_label, error, reason) => {
    const { connectDB, getDbStatus } = loadDb({ connect: async () => { throw error; } });

    await expect(connectDB()).rejects.toThrow();

    const status = getDbStatus();
    expect(status.status).toBe("failed");
    expect(status.reason).toBe(reason);
    expect(status.hint.length).toBeGreaterThan(20);
    expect(status.lastAttempt).toEqual(expect.any(String));
  });

  it("never puts the connection string, its password, or the hostname in the public status", async () => {
    const { connectDB, getDbStatus } = loadDb({
      connect: async () => {
        throw named("MongoServerSelectionError", `Could not connect to ${SECRET_URI}: private-cluster.example.mongodb.net:27017 timed out`);
      },
    });

    await expect(connectDB()).rejects.toThrow();

    const published = JSON.stringify(getDbStatus());
    expect(published).not.toContain("some-secret-password");
    expect(published).not.toContain("some-user");
    expect(published).not.toContain("private-cluster");
    expect(published).not.toContain("mongodb+srv");
  });

  it("retries on the next call after a failure, and recovers", async () => {
    // This is the serverless problem: one failed attempt at start-up used to leave the
    // instance broken for good, even after the cause (say, Atlas network access) was fixed.
    let attempts = 0;
    const { connectDB, getDbStatus } = loadDb({
      connect: async () => {
        attempts += 1;
        if (attempts === 1) throw named("MongoServerSelectionError", "Could not connect to any servers");
      },
    });

    await expect(connectDB()).rejects.toThrow();
    expect(getDbStatus().status).toBe("failed");

    await connectDB();

    expect(attempts).toBe(2);
    expect(getDbStatus()).toEqual({ status: "connected" });
  });

  it("does not reconnect on every call once it is connected", async () => {
    const { connectDB, connectSpy } = loadDb();

    await connectDB();
    await connectDB();
    await connectDB();

    expect(connectSpy).toHaveBeenCalledTimes(1);
  });

  it("shares one attempt between requests that arrive together", async () => {
    let release;
    const gate = new Promise((resolve) => {
      release = resolve;
    });
    const { connectDB, getDbStatus, connectSpy } = loadDb({ connect: () => gate });

    const first = connectDB();
    const second = connectDB();
    const third = connectDB();
    expect(getDbStatus().status).toBe("connecting");
    release();
    await Promise.all([first, second, third]);

    expect(connectSpy).toHaveBeenCalledTimes(1);
  });
});
