// Copyright (c) 2026 Karthik Raj. All rights reserved. https://beautiful-alpaca-6b1495.netlify.app/
// The admin console isn't linked anywhere on the public site. Override the
// path with VITE_ADMIN_PATH if you want a different one.
const rawPath = import.meta.env.VITE_ADMIN_PATH || "/nl-admin";

export const ADMIN_BASE = `/${rawPath.replace(/^\/+|\/+$/g, "")}`;
export const TOKEN_KEY = "nl_admin_token";
