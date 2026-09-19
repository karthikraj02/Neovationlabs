// Copyright (c) 2026 Karthik Raj. All rights reserved. https://beautiful-alpaca-6b1495.netlify.app/
import { describe, it, expect, vi, afterEach } from "vitest";

// apiBase reads the environment when it is first imported, so each case sets the
// variable and then imports a fresh copy.
async function apiBaseFor(value) {
  vi.resetModules();
  vi.stubEnv("VITE_API_URL", value);
  const mod = await import("./apiBase");
  return mod.API_BASE;
}

describe("API_BASE", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("removes a trailing slash, so requests never go to a double-slash address", async () => {
    // The live site was built with this exact value, which sent the form to
    // "…vercel.app//api/contact" and got redirected, breaking the contact form.
    expect(await apiBaseFor("https://server-neovationlabs.vercel.app/")).toBe(
      "https://server-neovationlabs.vercel.app"
    );
  });

  it("removes several trailing slashes and surrounding spaces", async () => {
    expect(await apiBaseFor("  https://api.example.com///  ")).toBe("https://api.example.com");
  });

  it("leaves an address without a trailing slash alone, including a path", async () => {
    expect(await apiBaseFor("https://api.example.com")).toBe("https://api.example.com");
    expect(await apiBaseFor("https://example.com/backend/")).toBe("https://example.com/backend");
  });

  it("falls back to the local server when nothing is set", async () => {
    expect(await apiBaseFor("")).toBe("http://localhost:5000");
  });

  it("builds a single-slash request address from any of them", async () => {
    const base = await apiBaseFor("https://server-neovationlabs.vercel.app/");
    expect(`${base}/api/contact`).toBe("https://server-neovationlabs.vercel.app/api/contact");
    expect(`${base}/api/contact`).not.toContain("app//api");
  });
});
