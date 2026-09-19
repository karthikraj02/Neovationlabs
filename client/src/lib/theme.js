// Copyright (c) 2026 Karthik Raj. All rights reserved. https://beautiful-alpaca-6b1495.netlify.app/
import { useCallback, useSyncExternalStore } from "react";

export const THEME_KEY = "nl-theme";
export const DEFAULT_THEME = "light";

const DARK_COLOR = "#06070a";
const LIGHT_COLOR = "#ffffff";

const listeners = new Set();

const normalize = (value) => (value === "dark" ? "dark" : "light");

/** The theme currently applied to <html>. Light unless the user chose dark. */
export function getTheme() {
  if (typeof document === "undefined") return DEFAULT_THEME;
  return normalize(document.documentElement.getAttribute("data-theme"));
}

function apply(theme) {
  const next = normalize(theme);
  document.documentElement.setAttribute("data-theme", next);
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", next === "dark" ? DARK_COLOR : LIGHT_COLOR);
  listeners.forEach((notify) => notify());
}

/** Apply and remember a theme. */
export function setTheme(theme) {
  const next = normalize(theme);
  apply(next);
  try {
    window.localStorage.setItem(THEME_KEY, next);
  } catch {
    // Storage can be blocked (private mode); the theme still applies for this visit.
  }
}

/** Apply the saved theme on start-up (light when nothing is saved). */
export function initTheme() {
  let saved = DEFAULT_THEME;
  try {
    saved = window.localStorage.getItem(THEME_KEY) || DEFAULT_THEME;
  } catch {
    // ignore
  }
  apply(saved);
}

function subscribe(notify) {
  listeners.add(notify);
  // Keep several open tabs in sync.
  const onStorage = (event) => {
    if (event.key === THEME_KEY) apply(event.newValue);
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(notify);
    window.removeEventListener("storage", onStorage);
  };
}

/** React hook: [theme, toggleTheme, setTheme]. */
export function useTheme() {
  const theme = useSyncExternalStore(subscribe, getTheme, () => DEFAULT_THEME);
  const toggle = useCallback(() => setTheme(getTheme() === "dark" ? "light" : "dark"), []);
  return [theme, toggle, setTheme];
}

const FALLBACK = {
  dark: { signal: [94, 234, 212], pulse: [139, 124, 246], ink: [242, 243, 245], bead: [255, 255, 255] },
  light: { signal: [11, 133, 119], pulse: [109, 92, 231], ink: [11, 13, 18], bead: [11, 133, 119] },
};

/**
 * The theme's accent colours as [r, g, b] arrays, read from the same CSS
 * variables the stylesheet uses. Canvas drawing can't use var(), so the
 * canvas animations call this whenever the theme changes.
 */
export function readPalette() {
  const theme = getTheme();
  const fallback = FALLBACK[theme];
  if (typeof window === "undefined") return fallback;
  const styles = window.getComputedStyle(document.documentElement);
  const read = (name, backup) => {
    const parts = styles.getPropertyValue(name).trim().split(/\s+/).map(Number);
    return parts.length === 3 && parts.every((n) => Number.isFinite(n)) ? parts : backup;
  };
  return {
    theme,
    signal: read("--signal-rgb", fallback.signal),
    pulse: read("--pulse-rgb", fallback.pulse),
    ink: read("--ink-rgb", fallback.ink),
    bead: read("--bead-rgb", fallback.bead),
  };
}
