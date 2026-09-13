import axios from "axios";
import { TOKEN_KEY } from "./config";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

export function getToken() {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    // Storage unavailable (private mode, blocked site data) — session won't persist.
  }
}

const client = axios.create({ baseURL: `${API_BASE}/api/admin`, timeout: 15000 });

client.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

client.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401 && !err.config?.url?.includes("/auth/login")) {
      setToken(null);
      window.dispatchEvent(new Event("admin:unauthorized"));
    }
    return Promise.reject(err);
  }
);

export function errorMessage(err, fallback = "Something went wrong.") {
  const body = err?.response?.data;
  return body?.details?.[0]?.message || body?.message || fallback;
}

export const adminApi = {
  login: (email, password) => client.post("/auth/login", { email, password }).then((r) => r.data),
  me: () => client.get("/auth/me").then((r) => r.data.admin),
  stats: (days) => client.get("/stats", { params: { days } }).then((r) => r.data.data),

  enquiries: (params) => client.get("/enquiries", { params }).then((r) => r.data),
  updateEnquiry: (id, body) => client.patch(`/enquiries/${id}`, body).then((r) => r.data.data),

  demoBookings: (params) => client.get("/demo-bookings", { params }).then((r) => r.data),
  updateDemoBooking: (id, body) => client.patch(`/demo-bookings/${id}`, body).then((r) => r.data.data),

  projects: (params) => client.get("/projects", { params }).then((r) => r.data.data),
  project: (id) => client.get(`/projects/${id}`).then((r) => r.data.data),
  createProject: (body) => client.post("/projects", body).then((r) => r.data.data),
  updateProject: (id, body) => client.patch(`/projects/${id}`, body).then((r) => r.data.data),
  deleteProject: (id) => client.delete(`/projects/${id}`).then((r) => r.data),
  addProjectUpdate: (id, text) => client.post(`/projects/${id}/updates`, { text }).then((r) => r.data.data),
};
