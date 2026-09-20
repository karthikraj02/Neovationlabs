// Copyright (c) 2026 Karthik Raj. All rights reserved. https://beautiful-alpaca-6b1495.netlify.app/
jest.mock("../src/models/Admin");
jest.mock("../src/models/VisitLog");

const request = require("supertest");
const jwt = require("jsonwebtoken");
const app = require("../src/app");
const Admin = require("../src/models/Admin");
const VisitLog = require("../src/models/VisitLog");

const ADMIN_ID = "64b7f0c2a1b2c3d4e5f60718";
const adminDoc = { _id: ADMIN_ID, name: "Test Admin", email: "admin@example.com" };
const selectLean = (value) => ({ select: jest.fn().mockReturnValue({ lean: jest.fn().mockResolvedValue(value) }) });

function authHeader() {
  const token = jwt.sign({ email: adminDoc.email, name: adminDoc.name }, process.env.JWT_SECRET, {
    subject: ADMIN_ID,
    audience: "neovation-admin",
    expiresIn: "1h",
  });
  return `Bearer ${token}`;
}

// Mimics VisitLog.find(...).sort(...).limit(...).select(...).lean()
const findChain = (rows) => {
  const chain = { sort: jest.fn(), limit: jest.fn(), select: jest.fn(), lean: jest.fn().mockResolvedValue(rows) };
  chain.sort.mockReturnValue(chain);
  chain.limit.mockReturnValue(chain);
  chain.select.mockReturnValue(chain);
  return chain;
};

const at = (iso) => new Date(iso);

beforeEach(() => {
  jest.clearAllMocks();
  Admin.findById.mockReturnValue(selectLean(adminDoc));
});

describe("visitor endpoints require an admin sign-in", () => {
  it.each([
    ["get", "/api/admin/visitors"],
    ["get", "/api/admin/visitors/detail?ip=203.0.113.7"],
    ["delete", "/api/admin/visitors?ip=203.0.113.7"],
  ])("%s %s is refused without a token", async (method, url) => {
    const res = await request(app)[method](url);

    expect(res.statusCode).toBe(401);
    expect(VisitLog.aggregate).not.toHaveBeenCalled();
    expect(VisitLog.find).not.toHaveBeenCalled();
    expect(VisitLog.deleteMany).not.toHaveBeenCalled();
  });
});

describe("GET /api/admin/visitors", () => {
  const rows = [
    { ip: "203.0.113.7", pageViews: 9, visits: 3, devices: 1, firstSeen: at("2026-09-01T05:00:00Z"), lastSeen: at("2026-09-19T10:00:00Z"), country: "IN", device: "mobile", lastPath: "/contact" },
    { ip: "198.51.100.4", pageViews: 2, visits: 1, devices: 1, firstSeen: at("2026-09-18T05:00:00Z"), lastSeen: at("2026-09-18T05:02:00Z"), country: "US", device: "desktop", lastPath: "/" },
  ];

  it("returns one row per IP with visit count, page views, and first/last visit times", async () => {
    VisitLog.aggregate.mockResolvedValue([{ rows, total: [{ n: 2 }] }]);

    const res = await request(app).get("/api/admin/visitors").set("Authorization", authHeader());

    expect(res.statusCode).toBe(200);
    expect(res.body).toMatchObject({ success: true, page: 1, pages: 1, total: 2, range: { days: 30 } });
    expect(res.body.data[0]).toMatchObject({
      ip: "203.0.113.7",
      visits: 3,
      pageViews: 9,
      firstSeen: "2026-09-01T05:00:00.000Z",
      lastSeen: "2026-09-19T10:00:00.000Z",
    });
  });

  it("counts a visit as a session, not a page view, and lists the most recent visitor first", async () => {
    VisitLog.aggregate.mockResolvedValue([{ rows, total: [{ n: 2 }] }]);

    await request(app).get("/api/admin/visitors").set("Authorization", authHeader());

    const pipeline = VisitLog.aggregate.mock.calls[0][0];
    const group = pipeline.find((stage) => stage.$group).$group;
    expect(group._id).toBe("$ip");
    expect(group.sessions).toEqual({ $addToSet: "$sessionId" }); // distinct sessions = visits
    expect(group.devices).toEqual({ $addToSet: "$visitorId" });
    expect(pipeline.find((stage) => stage.$sort && stage.$sort.lastSeen).$sort).toEqual({ lastSeen: -1 });
  });

  it("looks back 30 days by default, and only 7, 30 or 90 when asked", async () => {
    VisitLog.aggregate.mockResolvedValue([{ rows: [], total: [] }]);
    const days = async (query) => {
      VisitLog.aggregate.mockClear();
      await request(app).get(`/api/admin/visitors${query}`).set("Authorization", authHeader());
      const since = VisitLog.aggregate.mock.calls[0][0][0].$match.createdAt.$gte;
      return Math.round((Date.now() - since.getTime()) / 86400000);
    };

    expect(await days("")).toBe(30);
    expect(await days("?days=7")).toBe(7);
    expect(await days("?days=90")).toBe(90);
    expect(await days("?days=9999")).toBe(30);
  });

  it("searches by the start of an IP, and cannot be used to inject a query", async () => {
    VisitLog.aggregate.mockResolvedValue([{ rows: [], total: [] }]);

    await request(app).get("/api/admin/visitors?q=203.0").set("Authorization", authHeader());
    const search = VisitLog.aggregate.mock.calls[0][0][0].$match.ip;
    expect(search.test("203.0.113.7")).toBe(true);
    expect(search.test("10.203.0.1")).toBe(false); // anchored to the start

    VisitLog.aggregate.mockClear();
    await request(app).get("/api/admin/visitors?q=.*").set("Authorization", authHeader());
    const literal = VisitLog.aggregate.mock.calls[0][0][0].$match.ip;
    expect(literal.test("203.0.113.7")).toBe(false); // ".*" is matched literally, not as a wildcard
  });

  it("returns an empty list, not an error, when there are no visits yet", async () => {
    VisitLog.aggregate.mockResolvedValue([{ rows: [], total: [] }]);

    const res = await request(app).get("/api/admin/visitors").set("Authorization", authHeader());

    expect(res.statusCode).toBe(200);
    expect(res.body).toMatchObject({ data: [], total: 0, pages: 1 });
  });
});

describe("GET /api/admin/visitors/detail", () => {
  it("groups one IP's page views into visits, with the date and time of each", async () => {
    // newest first, as the database returns them
    VisitLog.find.mockReturnValue(
      findChain([
        { sessionId: "s2", visitorId: "v1", path: "/contact", referrer: "", device: "mobile", country: "IN", createdAt: at("2026-09-19T10:02:00Z") },
        { sessionId: "s2", visitorId: "v1", path: "/services", referrer: "google.com", device: "mobile", country: "IN", createdAt: at("2026-09-19T10:00:00Z") },
        { sessionId: "s1", visitorId: "v1", path: "/", referrer: "", device: "mobile", country: "IN", createdAt: at("2026-09-01T05:00:00Z") },
      ])
    );

    const res = await request(app).get("/api/admin/visitors/detail?ip=203.0.113.7").set("Authorization", authHeader());

    expect(res.statusCode).toBe(200);
    expect(VisitLog.find).toHaveBeenCalledWith({ ip: "203.0.113.7" });
    const { data } = res.body;
    expect(data.ip).toBe("203.0.113.7");
    expect(data.totals).toEqual({ pageViews: 3, visits: 2, devices: 1 });
    // most recent visit first
    expect(data.visits.map((v) => v.sessionId)).toEqual(["s2", "s1"]);
    expect(data.visits[0]).toMatchObject({
      startedAt: "2026-09-19T10:00:00.000Z",
      endedAt: "2026-09-19T10:02:00.000Z",
      referrer: "google.com",
    });
    // pages inside a visit are in the order they were opened, each with its time
    expect(data.visits[0].pages).toEqual([
      { path: "/services", at: "2026-09-19T10:00:00.000Z" },
      { path: "/contact", at: "2026-09-19T10:02:00.000Z" },
    ]);
    expect(data.truncated).toBe(false);
  });

  it("counts several devices on one shared address", async () => {
    VisitLog.find.mockReturnValue(
      findChain([
        { sessionId: "s2", visitorId: "phone", path: "/", referrer: "", device: "mobile", country: "IN", createdAt: at("2026-09-19T10:00:00Z") },
        { sessionId: "s1", visitorId: "laptop", path: "/", referrer: "", device: "desktop", country: "IN", createdAt: at("2026-09-18T10:00:00Z") },
      ])
    );

    const res = await request(app).get("/api/admin/visitors/detail?ip=203.0.113.7").set("Authorization", authHeader());

    expect(res.body.data.totals.devices).toBe(2);
  });

  it("flags a very long history as truncated", async () => {
    const many = Array.from({ length: 501 }, (_, i) => ({
      sessionId: `s${i}`,
      visitorId: "v",
      path: "/",
      referrer: "",
      device: "desktop",
      country: "",
      createdAt: at("2026-09-19T10:00:00Z"),
    }));
    VisitLog.find.mockReturnValue(findChain(many));

    const res = await request(app).get("/api/admin/visitors/detail?ip=203.0.113.7").set("Authorization", authHeader());

    expect(res.body.data.truncated).toBe(true);
    expect(res.body.data.totals.pageViews).toBe(500);
  });

  it.each(["", "not-an-ip", "203.0.113.7; drop", "<script>", "a".repeat(80)])("rejects %p without querying", async (ip) => {
    const res = await request(app)
      .get(`/api/admin/visitors/detail?ip=${encodeURIComponent(ip)}`)
      .set("Authorization", authHeader());

    expect(res.statusCode).toBe(400);
    expect(VisitLog.find).not.toHaveBeenCalled();
  });

  it("accepts an IPv6 address", async () => {
    VisitLog.find.mockReturnValue(findChain([]));

    const res = await request(app)
      .get("/api/admin/visitors/detail?ip=2001:db8::8a2e:370:7334")
      .set("Authorization", authHeader());

    expect(res.statusCode).toBe(200);
    expect(VisitLog.find).toHaveBeenCalledWith({ ip: "2001:db8::8a2e:370:7334" });
  });
});

describe("DELETE /api/admin/visitors", () => {
  it("erases every record for one IP and says how many", async () => {
    VisitLog.deleteMany.mockResolvedValue({ deletedCount: 12 });

    const res = await request(app).delete("/api/admin/visitors?ip=203.0.113.7").set("Authorization", authHeader());

    expect(res.statusCode).toBe(200);
    expect(VisitLog.deleteMany).toHaveBeenCalledWith({ ip: "203.0.113.7" });
    expect(res.body).toEqual({ success: true, deleted: 12 });
  });

  it("refuses a missing or malformed IP, so it can never delete everything", async () => {
    for (const url of ["/api/admin/visitors", "/api/admin/visitors?ip=", "/api/admin/visitors?ip=*", "/api/admin/visitors?ip[$ne]=1"]) {
      // eslint-disable-next-line no-await-in-loop
      const res = await request(app).delete(url).set("Authorization", authHeader());
      expect(res.statusCode).toBe(400);
    }
    expect(VisitLog.deleteMany).not.toHaveBeenCalled();
  });
});
