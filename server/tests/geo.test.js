// Copyright (c) 2026 Karthik Raj. All rights reserved. https://beautiful-alpaca-6b1495.netlify.app/
const { cleanCity, cleanRegion, cleanCountry, locationFrom } = require("../src/lib/geo");

const requestWith = (headers) => ({ get: (name) => headers[name.toLowerCase()] });

describe("cleanCity", () => {
  it("keeps a plain city name", () => {
    expect(cleanCity("Bengaluru")).toBe("Bengaluru");
  });

  it("decodes the URL-encoding Vercel uses, so accents survive", () => {
    expect(cleanCity("S%C3%A3o%20Paulo")).toBe("São Paulo");
    expect(cleanCity("Z%C3%BCrich")).toBe("Zürich");
  });

  it("removes control characters and angle brackets", () => {
    const dirty = `Del<script>hi${String.fromCharCode(0, 7, 127)}>`;

    expect(cleanCity(dirty)).toBe("Delscripthi");
  });

  it("keeps a value that is not valid URL-encoding as it came", () => {
    expect(cleanCity("100%zz")).toBe("100%zz");
  });

  it("limits the length so a hostile header cannot fill the database", () => {
    expect(cleanCity("x".repeat(500))).toHaveLength(100);
  });

  it("returns an empty string for nothing", () => {
    expect(cleanCity(undefined)).toBe("");
    expect(cleanCity("")).toBe("");
    expect(cleanCity("   ")).toBe("");
  });
});

describe("cleanRegion and cleanCountry", () => {
  it("normalises a region code", () => {
    expect(cleanRegion("ka")).toBe("KA");
    expect(cleanRegion("ka!<>")).toBe("KA");
    expect(cleanRegion("x".repeat(40))).toHaveLength(10);
  });

  it("accepts only a two-letter country code", () => {
    expect(cleanCountry("in")).toBe("IN");
    expect(cleanCountry("IND")).toBe("");
    expect(cleanCountry("1x")).toBe("");
    expect(cleanCountry(undefined)).toBe("");
  });
});

describe("locationFrom", () => {
  it("reads country, region and city from Vercel's headers", () => {
    const place = locationFrom(
      requestWith({
        "x-vercel-ip-country": "IN",
        "x-vercel-ip-country-region": "KA",
        "x-vercel-ip-city": "Bengaluru",
      })
    );

    expect(place).toEqual({ country: "IN", region: "KA", city: "Bengaluru" });
  });

  it("gives empty strings when the headers are absent, as when running locally", () => {
    expect(locationFrom(requestWith({}))).toEqual({ country: "", region: "", city: "" });
  });
});
