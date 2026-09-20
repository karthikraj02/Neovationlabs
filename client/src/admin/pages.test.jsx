// Copyright (c) 2026 Karthik Raj. All rights reserved. https://beautiful-alpaca-6b1495.netlify.app/
import { describe, it, expect, vi, beforeEach } from "vitest";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { adminApi } from "./api";
import { ADMIN_BASE } from "./config";
import Overview from "./pages/Overview";
import Projects from "./pages/Projects";
import ProjectDetail from "./pages/ProjectDetail";
import Enquiries from "./pages/Enquiries";
import DemoBookings from "./pages/DemoBookings";
import Visitors from "./pages/Visitors";

vi.mock("./api", () => ({
  adminApi: {
      visitors: vi.fn(),
      visitor: vi.fn(),
      deleteVisitor: vi.fn(),
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

  it("shows what happened to each enquiry's team alerts, and nothing for older enquiries without a record", async () => {
    const base = {
      phone: "",
      company: "",
      projectType: "Generative AI",
      message: "We'd like an internal knowledge assistant.",
      status: "new",
      createdAt: now,
    };
    adminApi.enquiries.mockResolvedValue({
      data: [
        {
          ...base,
          _id: "e-alerts",
          name: "Alerted Visitor",
          email: "alerted@example.com",
          alerts: {
            email: { status: "failed", detail: "Resend responded 403 for someone@example.com" },
            whatsapp: { status: "skipped", detail: "whatsapp-not-configured" },
            at: now,
          },
        },
        { ...base, _id: "e-old", name: "Older Visitor", email: "old@example.com" },
      ],
      page: 1,
      pages: 1,
      total: 2,
    });
    renderAt(<Enquiries />);

    fireEvent.click(await screen.findByRole("button", { name: /Alerted Visitor/ }));
    expect(screen.getByText("Team alerts")).toBeInTheDocument();
    expect(screen.getByText("Failed")).toBeInTheDocument();
    expect(screen.getByText(/Resend responded 403 for someone@example.com/)).toBeInTheDocument();
    expect(screen.getByText("Not sent")).toBeInTheDocument();

    // Only one enquiry is open at a time, so opening the older one closes the first.
    fireEvent.click(screen.getByRole("button", { name: /Older Visitor/ }));
    expect(screen.getByText("We'd like an internal knowledge assistant.")).toBeInTheDocument();
    expect(screen.queryByText("Team alerts")).not.toBeInTheDocument(); // no record, so no empty section
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

describe("admin visitors", () => {
  const row = {
    ip: "203.0.113.7",
    visits: 3,
    pageViews: 9,
    devices: 1,
    firstSeen: "2026-09-01T05:00:00.000Z",
    lastSeen: "2026-09-19T10:00:00.000Z",
    country: "IN",
    device: "mobile",
    lastPath: "/contact",
  };
  const detail = {
    ip: "203.0.113.7",
    totals: { pageViews: 3, visits: 2, devices: 1 },
    truncated: false,
    visits: [
      {
        sessionId: "s2",
        startedAt: "2026-09-19T10:00:00.000Z",
        endedAt: "2026-09-19T10:02:00.000Z",
        device: "mobile",
        country: "IN",
        referrer: "google.com",
        pages: [
          { path: "/services", at: "2026-09-19T10:00:00.000Z" },
          { path: "/contact", at: "2026-09-19T10:02:00.000Z" },
        ],
      },
      {
        sessionId: "s1",
        startedAt: "2026-09-01T05:00:00.000Z",
        endedAt: "2026-09-01T05:00:00.000Z",
        device: "mobile",
        country: "IN",
        referrer: "",
        pages: [{ path: "/", at: "2026-09-01T05:00:00.000Z" }],
      },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    adminApi.visitors.mockResolvedValue({ data: [row], page: 1, pages: 1, total: 1, range: { days: 30 } });
    adminApi.visitor.mockResolvedValue(detail);
  });

  it("lists each visitor by IP with how many times they visited, and marks returning visitors", async () => {
    renderAt(<Visitors />);

    expect(await screen.findByText("203.0.113.7")).toBeInTheDocument();
    const rowButton = screen.getByRole("button", { name: /203\.0\.113\.7, 3 visits/ });
    expect(rowButton).toHaveTextContent("9"); // page views
    expect(rowButton).toHaveTextContent("Returning");
    expect(adminApi.visitors).toHaveBeenCalledWith({ days: 30, q: undefined, page: 1 });
  });

  it("does not call a single visit 'returning'", async () => {
    adminApi.visitors.mockResolvedValue({ data: [{ ...row, visits: 1 }], page: 1, pages: 1, total: 1, range: { days: 30 } });
    renderAt(<Visitors />);

    const rowButton = await screen.findByRole("button", { name: /203\.0\.113\.7, 1 visit/ });
    expect(rowButton).not.toHaveTextContent("Returning");
  });

  it("opens a visitor to show every visit with its date, time and pages", async () => {
    renderAt(<Visitors />);

    fireEvent.click(await screen.findByRole("button", { name: /203\.0\.113\.7/ }));

    expect(adminApi.visitor).toHaveBeenCalledWith("203.0.113.7");
    expect(await screen.findByText(/2 visits · 3 page views · 1 device/)).toBeInTheDocument();
    expect(screen.getByText("/services")).toBeInTheDocument();
    expect(screen.getByText("/contact")).toBeInTheDocument();
    expect(screen.getByText(/from google\.com/)).toBeInTheDocument();
    expect(screen.queryByText(/share this address/i)).not.toBeInTheDocument();
  });

  it("warns that several devices on one address may be several people", async () => {
    adminApi.visitor.mockResolvedValue({ ...detail, totals: { pageViews: 3, visits: 2, devices: 2 } });
    renderAt(<Visitors />);

    fireEvent.click(await screen.findByRole("button", { name: /203\.0\.113\.7/ }));

    expect(await screen.findByText(/share this address/i)).toBeInTheDocument();
  });

  it("changes the time range and searches by IP", async () => {
    renderAt(<Visitors />);
    await screen.findByText("203.0.113.7");

    fireEvent.click(screen.getByRole("button", { name: "90 days" }));
    await waitFor(() => expect(adminApi.visitors).toHaveBeenLastCalledWith({ days: 90, q: undefined, page: 1 }));

    fireEvent.change(screen.getByLabelText("Search visitors by IP address"), { target: { value: "203.0" } });
    await waitFor(() => expect(adminApi.visitors).toHaveBeenLastCalledWith({ days: 90, q: "203.0", page: 1 }));
  });

  it("says so plainly when nobody has visited in the period", async () => {
    adminApi.visitors.mockResolvedValue({ data: [], page: 1, pages: 1, total: 0, range: { days: 30 } });
    renderAt(<Visitors />);

    expect(await screen.findByText(/no visitors recorded in this period/i)).toBeInTheDocument();
  });

  it("deletes a visitor's records, but only after confirmation", async () => {
    adminApi.deleteVisitor.mockResolvedValue({ success: true, deleted: 9 });
    const confirm = vi.spyOn(window, "confirm");
    renderAt(<Visitors />);
    fireEvent.click(await screen.findByRole("button", { name: /203\.0\.113\.7/ }));
    const erase = await screen.findByRole("button", { name: /delete this visitor's records/i });

    confirm.mockReturnValueOnce(false);
    fireEvent.click(erase);
    expect(adminApi.deleteVisitor).not.toHaveBeenCalled();

    confirm.mockReturnValueOnce(true);
    fireEvent.click(erase);
    await waitFor(() => expect(adminApi.deleteVisitor).toHaveBeenCalledWith("203.0.113.7"));
    await waitFor(() => expect(adminApi.visitors).toHaveBeenCalledTimes(2)); // list reloaded
    confirm.mockRestore();
  });
});
