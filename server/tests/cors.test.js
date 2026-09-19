// Copyright (c) 2026 Karthik Raj. All rights reserved. https://beautiful-alpaca-6b1495.netlify.app/
const request = require("supertest");

// The config reads process.env when first required, so each test sets CLIENT_URL
// and then loads the app fresh.
function appWithClientUrl(value) {
  jest.resetModules();
  process.env.CLIENT_URL = value;
  // eslint-disable-next-line global-require
  return require("../src/app");
}

const preflight = (app, origin) =>
  request(app)
    .options("/api/contact")
    .set("Origin", origin)
    .set("Access-Control-Request-Method", "POST")
    .set("Access-Control-Request-Headers", "content-type");

describe("CORS origin", () => {
  afterEach(() => {
    process.env.CLIENT_URL = "http://localhost:5173";
  });

  it("allows the site when CLIENT_URL is set with a trailing slash", async () => {
    // This exact mistake broke the live contact form: browsers send the origin with
    // no slash, so a header of "https://site.example/" never matched and was blocked.
    const app = appWithClientUrl("https://neovationlabs-client.vercel.app/");

    const res = await preflight(app, "https://neovationlabs-client.vercel.app");

    expect(res.statusCode).toBe(204);
    expect(res.headers["access-control-allow-origin"]).toBe("https://neovationlabs-client.vercel.app");
  });

  it("allows the site when CLIENT_URL has no trailing slash, spaces, or several slashes", async () => {
    const app = appWithClientUrl("  https://neovationlabs-client.vercel.app//  ");

    const res = await preflight(app, "https://neovationlabs-client.vercel.app");

    expect(res.headers["access-control-allow-origin"]).toBe("https://neovationlabs-client.vercel.app");
  });

  it("allows each of several comma-separated origins, and nothing else", async () => {
    const app = appWithClientUrl("https://site.example/, https://preview.site.example");

    const first = await preflight(app, "https://site.example");
    const second = await preflight(app, "https://preview.site.example");
    const stranger = await preflight(app, "https://evil.example");

    expect(first.headers["access-control-allow-origin"]).toBe("https://site.example");
    expect(second.headers["access-control-allow-origin"]).toBe("https://preview.site.example");
    expect(stranger.headers["access-control-allow-origin"]).toBeUndefined();
  });

  it("still defaults to the local dev site when CLIENT_URL is not set", async () => {
    const app = appWithClientUrl("");

    const res = await preflight(app, "http://localhost:5173");

    expect(res.headers["access-control-allow-origin"]).toBe("http://localhost:5173");
  });
});
