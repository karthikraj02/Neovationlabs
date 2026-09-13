import { describe, it, expect, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import App from "../App";
import { ADMIN_BASE } from "./config";

describe("admin console", () => {
  afterEach(() => {
    window.history.pushState({}, "", "/");
    localStorage.clear();
  });

  it("sends signed-out visitors to the sign-in page and keeps it out of search", async () => {
    window.history.pushState({}, "", `${ADMIN_BASE}/projects`);
    render(<App />);

    expect(await screen.findByRole("heading", { name: /sign in/i })).toBeInTheDocument();
    expect(window.location.pathname).toBe(`${ADMIN_BASE}/login`);
    expect(document.querySelector('meta[name="robots"]')?.getAttribute("content")).toBe("noindex, nofollow");
  });

  it("isn't linked from the public site", async () => {
    window.history.pushState({}, "", "/");
    render(<App />);

    await screen.findByRole("heading", { level: 1, name: /build what's next with ai/i });
    expect(document.querySelector(`a[href^="${ADMIN_BASE}"]`)).toBeNull();
  });
});
