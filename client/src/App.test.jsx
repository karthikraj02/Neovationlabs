import { describe, it, expect, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import App from "./App";

function renderAtPath(path) {
  window.history.pushState({}, "", path);
  return render(<App />);
}

describe("App routing", () => {
  afterEach(() => {
    window.history.pushState({}, "", "/");
  });

  it("renders the homepage hero at '/'", async () => {
    renderAtPath("/");
    expect(
      await screen.findByRole("heading", { level: 1, name: /build what's next with ai/i })
    ).toBeInTheDocument();
  });

  it("renders the custom 404 page for an unknown route", async () => {
    renderAtPath("/this-route-does-not-exist");
    expect(await screen.findByText("404")).toBeInTheDocument();
    expect(screen.getByText(/looks like this page went offline/i)).toBeInTheDocument();
  });
});
