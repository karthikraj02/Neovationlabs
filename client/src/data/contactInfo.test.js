// Copyright (c) 2026 Karthik Raj. All rights reserved. https://beautiful-alpaca-6b1495.netlify.app/
import { describe, it, expect } from "vitest";
import { PHONE_TEL, projectRequestWhatsAppText, whatsappLink } from "./contactInfo";

describe("whatsappLink", () => {
  it("opens a chat with the company number", () => {
    expect(whatsappLink()).toBe("https://wa.me/919901723492");
  });

  it("URL-encodes the prefilled text", () => {
    const link = whatsappLink("Hi & hello\nNext line");
    expect(link).toBe("https://wa.me/919901723492?text=Hi%20%26%20hello%0ANext%20line");
  });

  it("uses the same number for the call link", () => {
    expect(PHONE_TEL).toBe("tel:+919901723492");
  });
});

describe("projectRequestWhatsAppText", () => {
  const data = {
    name: "Ada Lovelace",
    company: "Analytical Engines Inc.",
    email: "ada@example.com",
    phone: "+44 20 7946 0000",
    projectType: "Generative AI",
    message: "We'd like an internal knowledge assistant.",
  };

  it("lists who the visitor is and what they asked for", () => {
    const text = projectRequestWhatsAppText(data);
    expect(text).toContain("Name: Ada Lovelace");
    expect(text).toContain("Company: Analytical Engines Inc.");
    expect(text).toContain("Email: ada@example.com");
    expect(text).toContain("Phone: +44 20 7946 0000");
    expect(text).toContain("Project type: Generative AI");
    expect(text).toContain("We'd like an internal knowledge assistant.");
  });

  it("leaves out company and phone when they were not given, with no empty lines for them", () => {
    const text = projectRequestWhatsAppText({ ...data, company: "", phone: "" });
    expect(text).not.toContain("Company:");
    expect(text).not.toContain("Phone:");
    expect(text).toContain("Name: Ada Lovelace");
  });

  it("shortens a very long message so the link stays usable", () => {
    const text = projectRequestWhatsAppText({ ...data, message: "x".repeat(2000) });
    expect(text.length).toBeLessThan(900);
    expect(text.endsWith("…")).toBe(true);
  });
});
