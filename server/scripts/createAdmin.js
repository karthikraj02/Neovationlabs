/* eslint-disable no-console */
// Creates an admin login, or resets the password if the email already exists.
//
//   npm run create-admin -w server -- --email you@company.com --name "Your Name"
//
// The password is prompted for (input hidden), or read from ADMIN_PASSWORD.
require("dotenv").config();
const readline = require("readline");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const { mongodbUri } = require("../src/config/env");
const Admin = require("../src/models/Admin");

const MIN_PASSWORD_LENGTH = 12;

function arg(name) {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 ? process.argv[i + 1] : undefined;
}

function promptHidden(question) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    let muted = false;
    rl._writeToOutput = (s) => rl.output.write(muted ? "*" : s);
    rl.question(question, (answer) => {
      rl.close();
      process.stdout.write("\n");
      resolve(answer);
    });
    muted = true;
  });
}

async function main() {
  const email = (arg("email") || "").trim().toLowerCase();
  const name = (arg("name") || "").trim();

  if (!email || !name) {
    console.error('Usage: npm run create-admin -w server -- --email you@company.com --name "Your Name"');
    process.exit(1);
  }
  if (!mongodbUri) {
    console.error("MONGODB_URI is not set. Add it to server/.env first.");
    process.exit(1);
  }

  const password = process.env.ADMIN_PASSWORD || (await promptHidden(`Password (min ${MIN_PASSWORD_LENGTH} characters): `));
  if (password.length < MIN_PASSWORD_LENGTH) {
    console.error(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
    process.exit(1);
  }

  await mongoose.connect(mongodbUri);
  const existing = await Admin.exists({ email });
  const passwordHash = await bcrypt.hash(password, 12);
  await Admin.findOneAndUpdate({ email }, { email, name, passwordHash }, { upsert: true });
  console.log(existing ? `Password reset for admin ${email}.` : `Created admin ${email}.`);
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error("Could not create admin:", err.message);
  process.exit(1);
});
