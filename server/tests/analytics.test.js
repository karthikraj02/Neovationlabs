// Copyright (c) 2026 Karthik Raj. All rights reserved. https://beautiful-alpaca-6b1495.netlify.app/
jest.mock("../src/models/PageView");

const request = require("supertest");
const app = require("../src/app");
const PageView = require("../src/models/PageView");

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
