// Copyright (c) 2026 Karthik Raj. All rights reserved. https://beautiful-alpaca-6b1495.netlify.app/
const mongoose = require("mongoose");
const { mongodbUri } = require("./env");

const SERVER_SELECTION_TIMEOUT_MS = 8000;

let isConnected = false;
let inFlight = null; // the connection attempt currently running, shared by concurrent callers
let lastFailure = null; // what went wrong last time, in plain words (never a raw error)

// Fixed, plain-language explanations. They deliberately contain no hostnames, no
// usernames and no part of the connection string, so they are safe to show on the
// public health page.
const HINTS = {
  "not-configured":
    "MONGODB_URI is not set for this deployment. Add it in the hosting environment variables for Production, then redeploy.",
  "invalid-connection-string":
    "MONGODB_URI is set but is not a valid MongoDB connection string. Check there are no quotes or spaces around the value.",
  "authentication-failed": "MongoDB rejected the username or password in MONGODB_URI.",
  "dns-lookup-failed":
    "The cluster hostname in MONGODB_URI could not be looked up. Check the hostname in the connection string.",
  "cluster-unreachable-or-blocked":
    "This server could not reach the MongoDB cluster. In MongoDB Atlas, open Network Access and allow 0.0.0.0/0 (Vercel's addresses change), and check the cluster is running.",
  unknown: "The connection failed for a reason this server does not recognise. See the server logs for the [db] line.",
};

/** Classify a connection error into one of the fixed reasons above. */
function classifyFailure(err) {
  const name = (err && err.name) || "Error";
  const message = String((err && err.message) || "");

  let type = "unknown";
  if (name === "MongoParseError" || /invalid (scheme|connection string)|must (start|begin) with|mongodb:\/\/ or mongodb\+srv/i.test(message)) {
    type = "invalid-connection-string";
  } else if ((err && (err.code === 18 || err.codeName === "AuthenticationFailed")) || /bad auth|authentication failed/i.test(message)) {
    type = "authentication-failed";
  } else if (/querySrv|ENOTFOUND|EAI_AGAIN/i.test(message)) {
    type = "dns-lookup-failed";
  } else if (
    name === "MongoServerSelectionError" ||
    /could not connect to any servers|ReplicaSetNoPrimary|ECONNREFUSED|ETIMEDOUT|timed out/i.test(message)
  ) {
    type = "cluster-unreachable-or-blocked";
  }
  return { type, hint: HINTS[type], errorType: name };
}

async function connectDB() {
  if (isConnected) return mongoose.connection;
  if (!mongodbUri) {
    // eslint-disable-next-line no-console
    console.warn("[db] MONGODB_URI is not set — skipping database connection.");
    return null;
  }
  // Several requests arriving together share one attempt instead of each starting their own.
  if (inFlight) return inFlight;

  inFlight = (async () => {
    try {
      await mongoose.connect(mongodbUri, { serverSelectionTimeoutMS: SERVER_SELECTION_TIMEOUT_MS });
      isConnected = true;
      lastFailure = null;
      // eslint-disable-next-line no-console
      console.log("[db] MongoDB connected");
      return mongoose.connection;
    } catch (err) {
      isConnected = false;
      lastFailure = { ...classifyFailure(err), at: new Date().toISOString() };
      // eslint-disable-next-line no-console
      console.error("[db] MongoDB connection failed:", err.message);
      throw err;
    } finally {
      inFlight = null;
    }
  })();

  return inFlight;
}

/** Where the database connection stands, for the health page. Safe to show publicly. */
function getDbStatus() {
  if (!mongodbUri) return { status: "not-configured", reason: "not-configured", hint: HINTS["not-configured"] };
  if (isConnected) return { status: "connected" };
  if (inFlight) return { status: "connecting" };
  if (lastFailure) {
    return {
      status: "failed",
      reason: lastFailure.type,
      hint: lastFailure.hint,
      errorType: lastFailure.errorType,
      lastAttempt: lastFailure.at,
    };
  }
  return { status: "not-attempted" };
}

module.exports = { connectDB, getDbStatus, classifyFailure };
