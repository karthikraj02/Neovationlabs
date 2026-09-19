// Copyright (c) 2026 Karthik Raj. All rights reserved. https://beautiful-alpaca-6b1495.netlify.app/
jest.mock("../src/models/Admin");
jest.mock("../src/models/Project");
jest.mock("../src/models/ContactSubmission");
jest.mock("../src/models/DemoBooking");
jest.mock("../src/models/PageView");

const request = require("supertest");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const app = require("../src/app");
const Admin = require("../src/models/Admin");
const ContactSubmission = require("../src/models/ContactSubmission");
const Project = require("../src/models/Project");

const ADMIN_ID = "64b7f0c2a1b2c3d4e5f60718";
const RECORD_ID = "64b7f0c2a1b2c3d4e5f60799";
const adminDoc = { _id: ADMIN_ID, name: "Test Admin", email: "admin@example.com" };

// Mimics Model.findById(...).select(...).lean()
const selectLean = (value) => ({
  select: jest.fn().mockReturnValue({ lean: jest.fn().mockResolvedValue(value) }),
});
const lean = (value) => ({ lean: jest.fn().mockResolvedValue(value) });

function authHeader(secret = process.env.JWT_SECRET) {
  const token = jwt.sign({ email: adminDoc.email, name: adminDoc.name }, secret, {
    subject: ADMIN_ID,
    audience: "neovation-admin",
    expiresIn: "1h",
  });
  return `Bearer ${token}`;
}

beforeEach(() => {
  jest.clearAllMocks();
  Admin.findById.mockReturnValue(selectLean(adminDoc));
});

describe("admin sign-in", () => {
  let passwordHash;

  beforeAll(async () => {
    passwordHash = await bcrypt.hash("correct horse battery", 4);
  });

  it("signs in with the right password, and the token opens protected routes", async () => {
    Admin.findOne.mockReturnValue({ select: jest.fn().mockResolvedValue({ ...adminDoc, passwordHash }) });
    Admin.updateOne.mockResolvedValue({});

    const res = await request(app)
      .post("/api/admin/auth/login")
      .send({ email: "Admin@Example.com", password: "correct horse battery" });

    expect(res.statusCode).toBe(200);
    expect(res.body.token).toEqual(expect.any(String));
    expect(res.body.admin).toEqual({ name: adminDoc.name, email: adminDoc.email });
    expect(Admin.findOne).toHaveBeenCalledWith({ email: "admin@example.com" });
    expect(res.body.admin.passwordHash).toBeUndefined();

    const me = await request(app).get("/api/admin/auth/me").set("Authorization", `Bearer ${res.body.token}`);
    expect(me.statusCode).toBe(200);
    expect(me.body.admin.email).toBe(adminDoc.email);
  });

  it("rejects a wrong password with a generic message", async () => {
    Admin.findOne.mockReturnValue({ select: jest.fn().mockResolvedValue({ ...adminDoc, passwordHash }) });

    const res = await request(app)
      .post("/api/admin/auth/login")
      .send({ email: adminDoc.email, password: "wrong password" });

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe("Invalid email or password.");
    expect(res.body.token).toBeUndefined();
    expect(Admin.updateOne).not.toHaveBeenCalled();
  });

  it("rejects an unknown email with the same message", async () => {
    Admin.findOne.mockReturnValue({ select: jest.fn().mockResolvedValue(null) });

    const res = await request(app)
      .post("/api/admin/auth/login")
      .send({ email: "nobody@example.com", password: "whatever" });

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe("Invalid email or password.");
  });

  it("validates the sign-in body", async () => {
    const res = await request(app).post("/api/admin/auth/login").send({ email: "not-an-email" });

    expect(res.statusCode).toBe(400);
    expect(Admin.findOne).not.toHaveBeenCalled();
  });
});

describe("admin route protection", () => {
  it("blocks protected routes without a token", async () => {
    const res = await request(app).get("/api/admin/stats");

    expect(res.statusCode).toBe(401);
    expect(ContactSubmission.aggregate).not.toHaveBeenCalled();
  });

  it("rejects a token signed with a different secret", async () => {
    const res = await request(app)
      .get("/api/admin/stats")
      .set("Authorization", authHeader("some-other-secret-value-that-is-long-enough"));

    expect(res.statusCode).toBe(401);
  });

  it("rejects a valid token for an admin that has been removed", async () => {
    Admin.findById.mockReturnValue(selectLean(null));

    const res = await request(app).get("/api/admin/auth/me").set("Authorization", authHeader());

    expect(res.statusCode).toBe(401);
  });

  it("marks admin responses as not cacheable", async () => {
    const res = await request(app).get("/api/admin/auth/me").set("Authorization", authHeader());

    expect(res.headers["cache-control"]).toBe("no-store");
  });
});

describe("admin records", () => {
  it("rejects a malformed record id before touching the database", async () => {
    const res = await request(app)
      .patch("/api/admin/enquiries/not-an-id")
      .set("Authorization", authHeader())
      .send({ status: "reviewed" });

    expect(res.statusCode).toBe(400);
    expect(ContactSubmission.findByIdAndUpdate).not.toHaveBeenCalled();
  });

  it("rejects an unknown enquiry status", async () => {
    const res = await request(app)
      .patch(`/api/admin/enquiries/${RECORD_ID}`)
      .set("Authorization", authHeader())
      .send({ status: "deleted" });

    expect(res.statusCode).toBe(400);
    expect(ContactSubmission.findByIdAndUpdate).not.toHaveBeenCalled();
  });

  it("updates an enquiry's status", async () => {
    ContactSubmission.findByIdAndUpdate.mockReturnValue(lean({ _id: RECORD_ID, status: "reviewed" }));

    const res = await request(app)
      .patch(`/api/admin/enquiries/${RECORD_ID}`)
      .set("Authorization", authHeader())
      .send({ status: "reviewed", ip: "1.2.3.4" });

    expect(res.statusCode).toBe(200);
    expect(ContactSubmission.findByIdAndUpdate).toHaveBeenCalledWith(
      RECORD_ID,
      { $set: { status: "reviewed" } },
      expect.any(Object)
    );
  });

  it("validates new projects", async () => {
    const res = await request(app)
      .post("/api/admin/projects")
      .set("Authorization", authHeader())
      .send({ name: "X", client: "", progress: 150 });

    expect(res.statusCode).toBe(400);
    expect(res.body.details.map((d) => d.field)).toEqual(
      expect.arrayContaining(["name", "client", "progress"])
    );
    expect(Project.create).not.toHaveBeenCalled();
  });

  it("creates a project, converting dates and omitting fields that weren't sent", async () => {
    Project.create.mockResolvedValue({ _id: RECORD_ID });

    const res = await request(app)
      .post("/api/admin/projects")
      .set("Authorization", authHeader())
      .send({ name: "Support assistant", client: "Acme", dueDate: "2026-12-01", milestones: [{ title: "Pilot" }] });

    expect(res.statusCode).toBe(201);
    const saved = Project.create.mock.calls[0][0];
    expect(saved).toMatchObject({ name: "Support assistant", client: "Acme", milestones: [{ title: "Pilot" }] });
    expect(saved.dueDate).toBeInstanceOf(Date);
    expect(Object.keys(saved)).not.toContain("startDate");
  });

  it("rejects an empty project update", async () => {
    const res = await request(app)
      .patch(`/api/admin/projects/${RECORD_ID}`)
      .set("Authorization", authHeader())
      .send({});

    expect(res.statusCode).toBe(400);
    expect(Project.findByIdAndUpdate).not.toHaveBeenCalled();
  });

  it("posts progress notes authored by the signed-in admin", async () => {
    Project.findByIdAndUpdate.mockReturnValue(lean({ _id: RECORD_ID, updates: [] }));

    const res = await request(app)
      .post(`/api/admin/projects/${RECORD_ID}/updates`)
      .set("Authorization", authHeader())
      .send({ text: "Pilot shipped to the support team.", author: "Someone else" });

    expect(res.statusCode).toBe(201);
    const [, update] = Project.findByIdAndUpdate.mock.calls[0];
    expect(update.$push.updates.$each).toEqual([
      { text: "Pilot shipped to the support team.", author: "Test Admin" },
    ]);
  });
});
