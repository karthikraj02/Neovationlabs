import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

const client = axios.create({
  baseURL: API_BASE,
  timeout: 8000,
});

export async function fetchServices() {
  const res = await client.get("/api/services");
  return res.data?.data ?? [];
}

export async function fetchService(slug) {
  const res = await client.get(`/api/services/${slug}`);
  return res.data?.data ?? null;
}

export async function fetchInsights() {
  const res = await client.get("/api/insights");
  return res.data?.data ?? [];
}

export async function fetchInsight(slug) {
  const res = await client.get(`/api/insights/${slug}`);
  return res.data?.data ?? null;
}

export default client;
