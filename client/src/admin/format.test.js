// Copyright (c) 2026 Karthik Raj. All rights reserved. https://beautiful-alpaca-6b1495.netlify.app/
import { describe, it, expect } from "vitest";
import { formatLocation } from "./format";

describe("formatLocation", () => {
  it("writes city, region and the country's name", () => {
    expect(formatLocation({ city: "Bengaluru", region: "KA", country: "IN" })).toBe("Bengaluru (KA), India");
  });

  it("leaves out a region that is not known", () => {
    expect(formatLocation({ city: "London", region: "", country: "GB" })).toBe("London, United Kingdom");
  });

  it("shows just the country when the city is not known", () => {
    expect(formatLocation({ city: "", region: "", country: "US" })).toBe("United States");
  });

  it("returns an empty string when nothing is known, so the caller can say so", () => {
    expect(formatLocation({ city: "", region: "", country: "" })).toBe("");
    expect(formatLocation({})).toBe("");
    expect(formatLocation()).toBe("");
  });

  it("does not break on a country code the browser cannot translate", () => {
    expect(typeof formatLocation({ city: "Somewhere", country: "ZZ" })).toBe("string");
  });
});
