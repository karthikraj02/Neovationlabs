// Copyright (c) 2026 Karthik Raj. All rights reserved. https://beautiful-alpaca-6b1495.netlify.app/
/* eslint-disable no-console */
const dns = require("dns");
const mongoose = require("mongoose");

const PUBLIC_DNS = ["8.8.8.8", "1.1.1.1"];

// Only the failure below is retried. Anything else (wrong password, blocked IP,
// bad connection string) is a real problem the person running the script needs to see.
const isSrvLookupRefused = (err) => /querySrv/i.test(String((err && err.message) || ""));

/**
 * Connect for a one-off script (create-admin, seed).
 *
 * A "mongodb+srv://" address needs a DNS "SRV" lookup, and some networks (home
 * routers, VPNs, some ISPs) refuse it with `querySrv ECONNREFUSED`. When that exact
 * failure happens the script retries once using public DNS, for that run only. Your
 * computer's DNS settings are not changed, and the running website is not affected.
 */
async function connectForScript(uri) {
  try {
    await mongoose.connect(uri);
  } catch (err) {
    if (!uri.startsWith("mongodb+srv://") || !isSrvLookupRefused(err)) throw err;

    console.warn("Your network's DNS refused the MongoDB address lookup. Retrying with public DNS (8.8.8.8, 1.1.1.1) for this run only...");
    dns.setServers(PUBLIC_DNS);
    await mongoose.disconnect().catch(() => {});
    await mongoose.connect(uri);
  }
}

module.exports = { connectForScript, PUBLIC_DNS };
