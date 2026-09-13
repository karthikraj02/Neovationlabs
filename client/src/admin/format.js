import { useEffect, useState } from "react";

const LOCALE = "en-IN";

function toDate(value) {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

// Date-only fields (due dates, preferred demo dates) are stored as UTC
// midnight, so they're formatted in UTC to avoid showing the previous day.
export function formatDate(value, { dateOnly = false } = {}) {
  const d = toDate(value);
  if (!d) return "—";
  return new Intl.DateTimeFormat(LOCALE, {
    day: "numeric",
    month: "short",
    year: "numeric",
    ...(dateOnly ? { timeZone: "UTC" } : {}),
  }).format(d);
}

export function formatDateTime(value) {
  const d = toDate(value);
  if (!d) return "—";
  return new Intl.DateTimeFormat(LOCALE, {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  }).format(d);
}

export function timeAgo(value) {
  const d = toDate(value);
  if (!d) return "—";
  const seconds = Math.round((Date.now() - d.getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days}d ago`;
  return formatDate(d);
}

export function formatNumber(n) {
  return new Intl.NumberFormat(LOCALE).format(n ?? 0);
}

// Value for <input type="date">.
export function toDateInput(value) {
  const d = toDate(value);
  return d ? d.toISOString().slice(0, 10) : "";
}

// Value for <input type="datetime-local">, in the viewer's own timezone.
export function toDateTimeLocal(value) {
  const d = toDate(value);
  if (!d) return "";
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}

export function isOverdue(project) {
  const due = toDate(project.dueDate);
  if (!due || project.status === "completed") return false;
  return due.getTime() < Date.now() - 24 * 60 * 60 * 1000;
}

export function useDebounced(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}
