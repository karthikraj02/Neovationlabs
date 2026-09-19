// Copyright (c) 2026 Karthik Raj. All rights reserved. https://beautiful-alpaca-6b1495.netlify.app/
import { describe, it, expect, vi, beforeEach } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { adminApi } from "./api";
import { ADMIN_BASE } from "./config";
import Overview from "./pages/Overview";
import Projects from "./pages/Projects";
import ProjectDetail from "./pages/ProjectDetail";
import Enquiries from "./pages/Enquiries";
import DemoBookings from "./pages/DemoBookings";

vi.mock("./api", () => ({
  adminApi: {
    stats: vi.fn(),
    enquiries: vi.fn(),
    updateEnquiry: vi.fn(),
    demoBookings: vi.fn(),
    updateDemoBooking: vi.fn(),
    projects: vi.fn(),
    project: vi.fn(),
    updateProject: vi.fn(),
    addProjectUpdate: vi.fn(),
    deleteProject: vi.fn(),
  },
  errorMessage: (err, fallback) => fallback,
}));

function renderAt(ui, { path = ADMIN_BASE, route = "*" } = {}) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path={route} element={ui} />
      </Routes>
    </MemoryRouter>
  );
}

const now = new Date().toISOString();

const stats = {
  range: { days: 30, timezone: "Asia/Kolkata" },
  traffic: {
    visitors: 120,
    sessions: 150,
    pageViews: 480,
    today: 7,
    daily: Array.from({ length: 30 }, (_, i) => ({
      date: `2026-09-${String(i + 1).padStart(2, "0")}`,
      visitors: i % 5,
      views: (i % 5) * 2,
    })),
    topPages: [{ path: "/demos", views: 300, visitors: 110 }],
    referrers: [{ source: "google.com", views: 40 }],
    devices: { desktop: 300, mobile: 180 },
  },
  enquiries: {
    total: 12,
    inRange: 5,
    byStatus: { new: 3, reviewed: 9 },
    recent: [{ _id: "e1", name: "Ada Lovelace", company: "Engines", projectType: "Generative AI", status: "new", createdAt: now }],
  },
  demoBookings: {
    total: 4,
    inRange: 2,
    byStatus: { requested: 1, scheduled: 3 },
    recent: [{ _id: "b1", name: "Grace Hopper", company: "", demos: ["offline-document-qa"], preferredDate: "2026-09-20", status: "requested", createdAt: now }],
  },
  projects: {
    total: 3,
    active: 2,
    byStatus: { "in-progress": 2, completed: 1 },
    activeList: [{ _id: "p1", name: "Support assistant", client: "Acme", status: "in-progress", progress: 40, dueDate: "2026-12-01T00:00:00.000Z" }],
  },
};

const project = {
  _id: "p1",
  name: "Support assistant",
  client: "Acme",
  clientEmail: "ops@acme.example",
  status: "in-progress",
  priority: "high",
  progress: 40,
  startDate: "2026-08-01T00:00:00.000Z",
  dueDate: "2020-01-01T00:00:00.000Z",
  budget: "$25k",
  description: "Internal knowledge assistant for the support team.",
  techStack: ["React", "FastAPI"],
  team: ["Karthik"],
  milestones: [
    { _id: "m1", title: "Pilot", dueDate: null, done: true },
    { _id: "m2", title: "Launch", dueDate: null, done: false },
  ],
  updates: [{ _id: "u1", text: "Retrieval accuracy at 91% on the eval set.", author: "Karthik", createdAt: now }],
  createdAt: now,
  updatedAt: now,
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("admin overview", () => {
  it("shows traffic, enquiries, demo requests and projects, and refetches on range change", async () => {
    adminApi.stats.mockResolvedValue(stats);
    renderAt(<Overview />);

    expect(await screen.findByText("120")).toBeInTheDocument();
    expect(screen.getByText("7 today · 480 page views")).toBeInTheDocument();
    expect(screen.getByText("3 new · 12 all time")).toBeInTheDocument();
    expect(screen.getByText("1 to schedule · 4 all time")).toBeInTheDocument();
    expect(screen.getByText("5.8%")).toBeInTheDocument();
    expect(screen.getByText("/demos")).toBeInTheDocument();
    expect(screen.getByText("google.com")).toBeInTheDocument();
    // 150 sessions, 40 from google.com → 110 direct.
    expect(screen.getByText("Direct or unknown").nextSibling).toHaveTextContent("110");
    expect(screen.getByText("Support assistant")).toBeInTheDocument();
    expect(adminApi.stats).toHaveBeenCalledWith(30);

    fireEvent.click(screen.getByRole("button", { name: "7 days" }));
    expect(adminApi.stats).toHaveBeenCalledWith(7);
  });

  it("offers the daily numbers as a table", async () => {
    adminApi.stats.mockResolvedValue(stats);
    renderAt(<Overview />);

    fireEvent.click(await screen.findByRole("button", { name: "Show table" }));
    // Top pages table (1 header + 1 row) + daily table (1 header + 30 days).
    expect(screen.getAllByRole("row")).toHaveLength(33);
  });
});

describe("admin projects", () => {
  it("lists projects with progress, milestones and overdue state", async () => {
    adminApi.projects.mockResolvedValue([project]);
    renderAt(<Projects />);

    expect(await screen.findByText("Support assistant")).toBeInTheDocument();
    expect(screen.getByText("1/2 milestones")).toBeInTheDocument();
    expect(screen.getByText(/overdue/)).toBeInTheDocument();
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "40");
  });

  it("shows a project and toggles a milestone", async () => {
    adminApi.project.mockResolvedValue(project);
    adminApi.updateProject.mockResolvedValue({
      ...project,
      milestones: project.milestones.map((m) => ({ ...m, done: true })),
    });
    renderAt(<ProjectDetail />, { path: `${ADMIN_BASE}/projects/p1`, route: `${ADMIN_BASE}/projects/:id` });

    expect(await screen.findByRole("heading", { name: "Support assistant" })).toBeInTheDocument();
    expect(screen.getByText("Retrieval accuracy at 91% on the eval set.")).toBeInTheDocument();
    expect(screen.getByText("1 of 2 milestones done")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Launch/ }));
    expect(adminApi.updateProject).toHaveBeenCalledWith("p1", {
      milestones: [
        { title: "Pilot", dueDate: "", done: true },
        { title: "Launch", dueDate: "", done: true },
      ],
    });
    expect(await screen.findByText("2 of 2 milestones done")).toBeInTheDocument();
  });
});

describe("admin enquiries and demo requests", () => {
  it("expands an enquiry and changes its status", async () => {
    const enquiry = {
      _id: "e1",
      name: "Ada Lovelace",
      company: "Engines",
      email: "ada@example.com",
      phone: "",
      projectType: "Generative AI",
      budget: "$25k – $75k",
      message: "We'd like an internal knowledge assistant.",
      status: "new",
      createdAt: now,
    };
    adminApi.enquiries.mockResolvedValue({ data: [enquiry], page: 1, pages: 1, total: 1 });
    adminApi.updateEnquiry.mockResolvedValue({ ...enquiry, status: "reviewed" });
    renderAt(<Enquiries />);

    fireEvent.click(await screen.findByRole("button", { name: /Ada Lovelace/ }));
    expect(screen.getByText("We'd like an internal knowledge assistant.")).toBeInTheDocument();

    fireEvent.click(within(screen.getByRole("group", { name: "Enquiry status" })).getByRole("button", { name: "Reviewed" }));
    expect(adminApi.updateEnquiry).toHaveBeenCalledWith("e1", { status: "reviewed" });
  });

  it("lists an enquiry without a budget cleanly, and still shows the budget on older ones", async () => {
    const base = {
      phone: "",
      projectType: "Generative AI",
      message: "We'd like an internal knowledge assistant.",
      status: "new",
      createdAt: now,
    };
    adminApi.enquiries.mockResolvedValue({
      data: [
        { ...base, _id: "e-new", name: "New Visitor", company: "", email: "new@example.com" },
        { ...base, _id: "e-old", name: "Older Visitor", company: "", email: "old@example.com", budget: "$25k – $75k" },
      ],
      page: 1,
      pages: 1,
      total: 2,
    });
    renderAt(<Enquiries />);

    const fresh = await screen.findByRole("button", { name: /New Visitor/ });
    expect(fresh).toHaveTextContent("Generative AI");
    expect(fresh).not.toHaveTextContent("·");

    const older = screen.getByRole("button", { name: /Older Visitor/ });
    expect(older).toHaveTextContent("$25k – $75k");
  });

  it("shows a demo request with the demo names, not slugs", async () => {
    adminApi.demoBookings.mockResolvedValue({
      data: [
        {
          _id: "b1",
          name: "Grace Hopper",
          company: "Naval Systems",
          email: "grace@example.com",
          phone: "",
          demos: ["offline-document-qa"],
          preferredDate: "2026-09-20",
          preferredTime: "13:00 – 15:00",
          timezone: "Asia/Kolkata",
          attendees: 3,
          notes: "",
          status: "requested",
          meetingLink: "",
          scheduledFor: null,
          createdAt: now,
        },
      ],
      page: 1,
      pages: 1,
      total: 1,
    });
    renderAt(<DemoBookings />);

    fireEvent.click(await screen.findByRole("button", { name: /Grace Hopper/ }));
    expect(screen.getAllByText("DocQuery — Offline Document Q&A").length).toBeGreaterThan(0);
    expect(screen.getByRole("button", { name: "Save booking" })).toBeInTheDocument();
  });
});
