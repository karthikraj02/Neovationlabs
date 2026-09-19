// Copyright (c) 2026 Karthik Raj. All rights reserved. https://beautiful-alpaca-6b1495.netlify.app/
import { describe, it, expect, beforeEach } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import ThemeToggle from "../components/ui/ThemeToggle";
import { THEME_KEY, getTheme, initTheme, readPalette, setTheme } from "./theme";

function reset() {
  document.documentElement.removeAttribute("data-theme");
  window.localStorage.clear();
}

describe("theme", () => {
  beforeEach(reset);

  it("defaults to light when nothing is saved", () => {
    initTheme();
    expect(getTheme()).toBe("light");
    expect(document.documentElement).toHaveAttribute("data-theme", "light");
  });

  it("restores a saved dark preference", () => {
    window.localStorage.setItem(THEME_KEY, "dark");
    initTheme();
    expect(getTheme()).toBe("dark");
  });

  it("treats an unknown saved value as light", () => {
    window.localStorage.setItem(THEME_KEY, "purple");
    initTheme();
    expect(getTheme()).toBe("light");
  });

  it("setTheme applies and remembers the choice", () => {
    setTheme("dark");
    expect(document.documentElement).toHaveAttribute("data-theme", "dark");
    expect(window.localStorage.getItem(THEME_KEY)).toBe("dark");
    setTheme("light");
    expect(window.localStorage.getItem(THEME_KEY)).toBe("light");
  });

  it("exposes a usable palette for each theme", () => {
    setTheme("light");
    const light = readPalette();
    setTheme("dark");
    const dark = readPalette();
    for (const p of [light, dark]) {
      expect(p.signal).toHaveLength(3);
      expect(p.pulse).toHaveLength(3);
      expect(p.bead).toHaveLength(3);
    }
    expect(light.signal).not.toEqual(dark.signal);
  });
});

describe("ThemeToggle", () => {
  beforeEach(reset);

  it("starts in light mode as an unchecked switch", () => {
    render(<ThemeToggle />);
    const toggle = screen.getByRole("switch", { name: /switch to dark theme/i });
    expect(toggle).toHaveAttribute("aria-checked", "false");
  });

  it("switches to dark and back, saving each choice", () => {
    render(<ThemeToggle />);

    fireEvent.click(screen.getByRole("switch"));
    expect(document.documentElement).toHaveAttribute("data-theme", "dark");
    expect(window.localStorage.getItem(THEME_KEY)).toBe("dark");
    expect(screen.getByRole("switch", { name: /switch to light theme/i })).toHaveAttribute("aria-checked", "true");

    fireEvent.click(screen.getByRole("switch"));
    expect(document.documentElement).toHaveAttribute("data-theme", "light");
    expect(window.localStorage.getItem(THEME_KEY)).toBe("light");
    expect(screen.getByRole("switch")).toHaveAttribute("aria-checked", "false");
  });
});
