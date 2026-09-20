// Copyright (c) 2026 Karthik Raj. All rights reserved. https://beautiful-alpaca-6b1495.netlify.app/
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { fetchInsights, fetchServices } from "../lib/api";
import Services from "./Services";
import Insights from "./Insights";

vi.mock("../lib/api", () => ({
  fetchServices: vi.fn(),
  fetchInsights: vi.fn(),
}));

const renderPage = (page) => render(<MemoryRouter>{page}</MemoryRouter>);

// This is the situation that made the live Services page read "No services published
// yet": the database was reachable but had not been filled, so the API answered with
// an empty list instead of failing.
describe("Services and Insights pages when the API is reachable but has no content yet", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows the built-in services, not an empty page", async () => {
    fetchServices.mockResolvedValue([]);
    renderPage(<Services />);

    expect(await screen.findByText("Generative AI & LLM Applications")).toBeInTheDocument();
    expect(screen.queryByText(/no services published yet/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/couldn.t reach/i)).not.toBeInTheDocument();
  });

  it("shows the built-in insights, not an empty page", async () => {
    fetchInsights.mockResolvedValue([]);
    renderPage(<Insights />);

    expect(await screen.findAllByRole("link", { name: /read/i })).not.toHaveLength(0);
    expect(screen.queryByText(/no (insights|articles|posts)/i)).not.toBeInTheDocument();
  });

  it("still shows content from the API when the database has some", async () => {
    fetchServices.mockResolvedValue([
      {
        _id: "s1",
        slug: "from-the-database",
        name: "A Service From The Database",
        shortDescription: "Loaded from MongoDB.",
        capabilities: [],
        order: 1,
      },
    ]);
    renderPage(<Services />);

    expect(await screen.findByText("A Service From The Database")).toBeInTheDocument();
  });

  it("still falls back, with the notice, when the API is down", async () => {
    fetchServices.mockRejectedValue(new Error("Network Error"));
    renderPage(<Services />);

    expect(await screen.findByText("Generative AI & LLM Applications")).toBeInTheDocument();
    expect(screen.getByText(/couldn.t reach/i)).toBeInTheDocument();
  });
});
