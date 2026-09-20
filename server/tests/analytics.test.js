// Copyright (c) 2026 Karthik Raj. All rights reserved. https://beautiful-alpaca-6b1495.netlify.app/
jest.mock("../src/models/PageView");
jest.mock("../src/models/VisitLog");

const request = require("supertest");
const app = require("../src/app");
const PageView = require("../src/models/PageView");
const VisitLog = require("../src/models/VisitLog");

const MOBILE_UA =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148";

const payload = {
  path: "/services?utm_source=newsletter",
  visitorId: "3f1c9a52-7b1e-4c2a-9d0e-1a2b3c4d5e6f",
  sessionId: "9a8b7c6d-5e4f-4a3b-8c2d-1e0f9a8b7c6d",
  referrer: "https://www.google.com/search?q=ai+engineering+agency",
};

describe("POST /api/analytics/pageview", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    PageView.create.mockResolvedValue({});
    VisitLog.create.mockResolvedValue({});
  });

  it("records an anonymous page view with only the referring domain", async () => {
    const res = await request(app).post("/api/analytics/pageview").set("User-Agent", MOBILE_UA).send(payload);

    expect(res.statusCode).toBe(204);
    expect(PageView.create).toHaveBeenCalledWith({
      path: "/services",
      visitorId: payload.visitorId,
      sessionId: payload.sessionId,
      referrer: "google.com",
      device: "mobile",
      country: "",
    });
  });

  it("doesn't count the site itself as a traffic source", async () => {
    await request(app)
      .post("/api/analytics/pageview")
      .set("User-Agent", MOBILE_UA)
      .send({ ...payload, referrer: "http://localhost:5173/about" });

    expect(PageView.create.mock.calls[0][0].referrer).toBe("");
  });

  it("ignores crawlers", async () => {
    const res = await request(app)
      .post("/api/analytics/pageview")
      .set("User-Agent", "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)")
      .send(payload);

    expect(res.statusCode).toBe(204);
    expect(PageView.create).not.toHaveBeenCalled();
  });

  it("rejects malformed visitor ids", async () => {
    const res = await request(app)
      .post("/api/analytics/pageview")
      .set("User-Agent", MOBILE_UA)
      .send({ ...payload, visitorId: "<script>" });

    expect(res.statusCode).toBe(400);
    expect(PageView.create).not.toHaveBeenCalled();
  });

  it("rejects paths that aren't on this site", async () => {
    const res = await request(app)
      .post("/api/analytics/pageview")
      .set("User-Agent", MOBILE_UA)
      .send({ ...payload, path: "https://elsewhere.example/page" });

    expect(res.statusCode).toBe(400);
    expect(PageView.create).not.toHaveBeenCalled();
  });
});

describe("POST /api/analytics/pageview: the IP-tagged visit log", () => {
  const post = (extra = {}) =>
    request(app)
      .post("/api/analytics/pageview")
      .set("User-Agent", MOBILE_UA)
      .set(extra)
      .send(payload);

  beforeEach(() => {
    jest.clearAllMocks();
    PageView.create.mockResolvedValue({});
    VisitLog.create.mockResolvedValue({});
  });

  it("records the visitor's IP with the visit, for the admin's Visitors page", async () => {
    const res = await post({ "X-Forwarded-For": "203.0.113.7" });

    expect(res.statusCode).toBe(204);
    expect(VisitLog.create).toHaveBeenCalledWith({
      ip: "203.0.113.7",
      path: "/services",
      visitorId: payload.visitorId,
      sessionId: payload.sessionId,
      referrer: "google.com",
      device: "mobile",
      country: "",
      region: "",
      city: "",
    });
  });

  it("records the visitor's approximate place, from Vercel's headers, with the visit", async () => {
    await post({
      "X-Forwarded-For": "203.0.113.7",
      "X-Vercel-IP-Country": "in",
      "X-Vercel-IP-Country-Region": "ka",
      "X-Vercel-IP-City": "Bengaluru",
    });

    expect(VisitLog.create.mock.calls[0][0]).toMatchObject({ country: "IN", region: "KA", city: "Bengaluru" });
  });

  it("decodes an accented city name, which Vercel sends URL-encoded", async () => {
    await post({ "X-Forwarded-For": "203.0.113.7", "X-Vercel-IP-City": "S%C3%A3o%20Paulo" });

    expect(VisitLog.create.mock.calls[0][0].city).toBe("São Paulo");
  });

  it("stores a clean, length-limited place even if a header is hostile", async () => {
    await post({ "X-Forwarded-For": "203.0.113.7", "X-Vercel-IP-City": `<img src=x>${"a".repeat(400)}` });

    const { city } = VisitLog.create.mock.calls[0][0];
    expect(city).not.toContain("<");
    expect(city.length).toBeLessThanOrEqual(100);
  });

  it("keeps the anonymous page view to the country only, never the city or region", async () => {
    await post({
      "X-Forwarded-For": "203.0.113.7",
      "X-Vercel-IP-Country": "IN",
      "X-Vercel-IP-Country-Region": "KA",
      "X-Vercel-IP-City": "Bengaluru",
    });

    const anonymous = PageView.create.mock.calls[0][0];
    expect(anonymous.country).toBe("IN");
    expect(anonymous).not.toHaveProperty("city");
    expect(anonymous).not.toHaveProperty("region");
    expect(JSON.stringify(anonymous)).not.toContain("Bengaluru");
  });

  it("keeps the anonymous page view free of any IP address", async () => {
    await post({ "X-Forwarded-For": "203.0.113.7" });

    expect(JSON.stringify(PageView.create.mock.calls[0][0])).not.toContain("203.0.113.7");
    expect(PageView.create.mock.calls[0][0]).not.toHaveProperty("ip");
  });

  it("stores the same address one way, so one person never looks like two", async () => {
    await post({ "X-Forwarded-For": "::ffff:203.0.113.7" });

    expect(VisitLog.create.mock.calls[0][0].ip).toBe("203.0.113.7");
  });

  it("stores an IPv6 address in lower case", async () => {
    await post({ "X-Forwarded-For": "2001:DB8::8A2E:370:7334" });

    expect(VisitLog.create.mock.calls[0][0].ip).toBe("2001:db8::8a2e:370:7334");
  });

  it("still records the anonymous view, and answers normally, if the IP log fails", async () => {
    VisitLog.create.mockRejectedValue(new Error("database hiccup"));
    const error = jest.spyOn(console, "error").mockImplementation(() => {});

    const res = await post({ "X-Forwarded-For": "203.0.113.7" });

    expect(res.statusCode).toBe(204);
    expect(PageView.create).toHaveBeenCalledTimes(1);
    error.mockRestore();
  });

  it("records nothing, in either collection, for a bot", async () => {
    const res = await request(app)
      .post("/api/analytics/pageview")
      .set("User-Agent", "Googlebot/2.1 (+http://www.google.com/bot.html)")
      .set("X-Forwarded-For", "203.0.113.7")
      .send(payload);

    expect(res.statusCode).toBe(204);
    expect(PageView.create).not.toHaveBeenCalled();
    expect(VisitLog.create).not.toHaveBeenCalled();
  });
});
