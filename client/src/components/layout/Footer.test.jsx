// Copyright (c) 2026 Karthik Raj. All rights reserved. https://beautiful-alpaca-6b1495.netlify.app/
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Footer from "./Footer";

function renderFooter() {
  return render(
    <MemoryRouter>
      <Footer />
    </MemoryRouter>
  );
}

describe("Footer contact", () => {
  it("shows the phone number as a tap-to-call link", () => {
    renderFooter();
    const call = screen.getByRole("link", { name: /call \+91 99017 23492/i });
    expect(call).toHaveAttribute("href", "tel:+919901723492");
    expect(call).toHaveTextContent("+91 99017 23492");
  });

  it("links to WhatsApp chat for the same number, opening in a new tab", () => {
    renderFooter();
    const whatsapp = screen.getByRole("link", { name: /whatsapp/i });
    expect(whatsapp).toHaveAttribute("href", "https://wa.me/919901723492");
    expect(whatsapp).toHaveAttribute("target", "_blank");
    expect(whatsapp.getAttribute("rel")).toContain("noopener");
  });
});
