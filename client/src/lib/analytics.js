import { TOKEN_KEY } from "../admin/config";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";
const VISITOR_KEY = "nl_vid";
const SESSION_KEY = "nl_sid";

// Local dev servers often point at the production database, so only real
// visits to the deployed site are counted unless explicitly switched on.
const enabled = import.meta.env.PROD || import.meta.env.VITE_ANALYTICS_DEV === "true";

function randomId() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 14)}`;
}

// Returns { id, isNew }, or null when storage is blocked.
function getOrCreateId(getStorage, key) {
  try {
    const storage = getStorage();
    const existing = storage.getItem(key);
    if (existing) return { id: existing, isNew: false };
    const id = randomId();
    storage.setItem(key, id);
    return { id, isNew: true };
  } catch {
    return null;
  }
}

let lastPath = null;

export function trackPageView(path) {
  if (!enabled || path === lastPath) return;
  lastPath = path;

  // Don't count the team's own browsing while signed in to the admin console.
  try {
    if (localStorage.getItem(TOKEN_KEY)) return;
  } catch {
    // Storage blocked — fall through; ids below will fail and skip tracking.
  }

  const visitor = getOrCreateId(() => localStorage, VISITOR_KEY);
  const session = getOrCreateId(() => sessionStorage, SESSION_KEY);
  if (!visitor || !session) return;

  fetch(`${API_BASE}/api/analytics/pageview`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    keepalive: true,
    body: JSON.stringify({
      path,
      visitorId: visitor.id,
      sessionId: session.id,
      // Only the first view of a session says where the visitor came from.
      referrer: session.isNew ? document.referrer : "",
    }),
  }).catch(() => {});
}
