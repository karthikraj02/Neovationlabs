import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axios from "axios";
import ContactForm from "./ContactForm";

vi.mock("axios");

describe("ContactForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows validation errors when submitted empty", async () => {
    const user = userEvent.setup();
    render(<ContactForm />);

    await user.click(screen.getByRole("button", { name: /send project request/i }));

    expect(await screen.findByText(/enter your full name/i)).toBeInTheDocument();
    expect(screen.getByText(/enter a valid email address/i)).toBeInTheDocument();
    expect(screen.getByText(/select a project type/i)).toBeInTheDocument();
    expect(screen.getByText(/select a budget range/i)).toBeInTheDocument();
    expect(axios.post).not.toHaveBeenCalled();
  });

  it("rejects a message that is too short", async () => {
    const user = userEvent.setup();
    render(<ContactForm />);

    await user.type(screen.getByLabelText(/^message/i), "too short");
    await user.click(screen.getByRole("button", { name: /send project request/i }));

    expect(await screen.findByText(/at least 20 characters/i)).toBeInTheDocument();
  });

  it("submits successfully with valid input and shows the success state", async () => {
    axios.post.mockResolvedValueOnce({
      data: { success: true, message: "Your project request has been received." },
    });

    const user = userEvent.setup();
    render(<ContactForm />);

    await user.type(screen.getByLabelText(/^name/i), "Ada Lovelace");
    await user.type(screen.getByLabelText(/^email/i), "ada@example.com");
    await user.selectOptions(screen.getByLabelText(/project type/i), "Generative AI");
    await user.selectOptions(screen.getByLabelText(/budget range/i), "$25k – $75k");
    await user.type(
      screen.getByLabelText(/^message/i),
      "We'd like to explore an internal knowledge assistant for our support team."
    );

    await user.click(screen.getByRole("button", { name: /send project request/i }));

    expect(
      await screen.findByText(/your project request has been received/i)
    ).toBeInTheDocument();
    expect(axios.post).toHaveBeenCalledTimes(1);
  });

  it("shows a server error message when the request fails", async () => {
    axios.post.mockRejectedValueOnce({
      response: { data: { message: "We could not reach the server." } },
    });

    const user = userEvent.setup();
    render(<ContactForm />);

    await user.type(screen.getByLabelText(/^name/i), "Ada Lovelace");
    await user.type(screen.getByLabelText(/^email/i), "ada@example.com");
    await user.selectOptions(screen.getByLabelText(/project type/i), "Generative AI");
    await user.selectOptions(screen.getByLabelText(/budget range/i), "$25k – $75k");
    await user.type(
      screen.getByLabelText(/^message/i),
      "We'd like to explore an internal knowledge assistant for our support team."
    );

    await user.click(screen.getByRole("button", { name: /send project request/i }));

    await waitFor(() => {
      expect(screen.getByText(/we could not reach the server/i)).toBeInTheDocument();
    });
  });

  it("keeps the honeypot field out of sight and out of the tab order", () => {
    render(<ContactForm />);
    const honeypot = screen.getByLabelText("Website", { selector: "#website" });
    expect(honeypot).not.toBeVisible();
    expect(honeypot).toHaveAttribute("tabindex", "-1");
  });
});
