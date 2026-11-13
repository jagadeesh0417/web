import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { spawn, spawnSync } from "node:child_process";
import { createServer } from "node:net";
import { setTimeout as delay } from "node:timers/promises";
import { MongoClient } from "mongodb";
import { MongoMemoryServer } from "mongodb-memory-server";

// Never inspect or inherit MONGODB_URI from the parent environment.
const testUri = process.env.MONGODB_TEST_URI;
const dbName = `test_internship_${randomUUID().replaceAll("-", "")}`;
if (!dbName.startsWith("test_")) throw new Error("Refusing a non-test database");
const envBase = Object.fromEntries(["PATH", "Path", "SystemRoot", "WINDIR", "TEMP", "TMP", "HOME", "USERPROFILE"].filter((key) => process.env[key]).map((key) => [key, process.env[key]]));
let memory;
let client;
let uri;
const servers = [];

async function port() {
  const server = createServer();
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const value = server.address().port;
  await new Promise((resolve) => server.close(resolve));
  return value;
}

async function startServer(connection) {
  const p = await port();
  const child = spawn(process.execPath, ["node_modules/next/dist/bin/next", "start", "-p", String(p)], {
    env: { ...envBase, NODE_ENV: "production", VERCEL: "1", MONGODB_URI: connection, MONGODB_DATABASE: dbName },
    stdio: "ignore",
  });
  servers.push(child);
  const url = `http://127.0.0.1:${p}`;
  for (let i = 0; i < 100; i++) {
    if (child.exitCode !== null) throw new Error(`Next server exited: ${child.exitCode}`);
    try { await fetch(`${url}/api/verify`); return url; } catch { await delay(150); }
  }
  throw new Error("Next server did not start");
}

let a, b, offline;
const payload = { category: "web-development", program: "professional", duration: 6, fullName: "Test Applicant", email: "test@example.com", confirmEmail: "test@example.com", mobile: "9876543210", dob: "2000-01-01", gender: "", college: "Test College", course: "Computer Science", branch: "Computing", graduationYear: "2027", city: "Hyderabad", state: "Telangana", linkedin: "", github: "", agree: true, website: "" };
async function apply(base, key, body, ip) {
  const response = await fetch(`${base}/api/internships/apply`, { method: "POST", headers: { "content-type": "application/json", "idempotency-key": key, "x-forwarded-for": ip ?? "" }, body: JSON.stringify(body) });
  return { status: response.status, body: await response.json() };
}

before(async () => {
  if (!testUri) memory = await MongoMemoryServer.create();
  uri = testUri || memory.getUri();
  client = new MongoClient(uri);
  await client.connect();
  const migration = spawnSync(process.execPath, ["scripts/migrate-internship-applications.mjs"], { env: { ...envBase, MONGODB_URI: uri, MONGODB_DATABASE: dbName, MONGODB_TEST_MODE: "1" }, encoding: "utf8" });
  assert.equal(migration.status, 0, migration.stderr);
  a = await startServer(uri);
  b = await startServer(uri);
  offline = await startServer("mongodb://127.0.0.1:1/?serverSelectionTimeoutMS=1000");
});

after(async () => {
  for (const child of servers) child.kill();
  if (client) { if (!dbName.startsWith("test_")) throw new Error("Refusing to drop non-test database"); await client.db(dbName).dropDatabase(); await client.close(); }
  if (memory) await memory.stop();
});

test("real migration enforces validator and idempotency under concurrency", async () => {
  const records = client.db(dbName).collection("internshipApplications");
  await assert.rejects(records.insertOne({ _id: "invalid" }), (error) => error.code === 121);
  const key = randomUUID();
  const responses = await Promise.all(Array.from({ length: 20 }, (_, i) => apply(i % 2 ? a : b, key, payload, `192.0.2.${i + 1}`)));
  assert.deepEqual(responses.map((r) => r.status), Array(20).fill(200));
  assert.equal(new Set(responses.map((r) => r.body.applicationId)).size, 1);
  assert.equal(await records.countDocuments(), 1);
  const record = await records.findOne();
  await assert.rejects(records.insertOne(record), (error) => error.code === 11000);
  assert.equal((await apply(a, key, { ...payload, fullName: "Different Applicant" }, "198.51.100.1")).status, 409);
});

test("limiter shares state between separate Next instances and stores BSON Date with TTL index", async () => {
  const ip = "198.51.100.10";
  for (let i = 0; i < 8; i++) assert.equal((await apply(i % 2 ? a : b, randomUUID(), payload, ip)).status, 200);
  assert.equal((await apply(b, randomUUID(), payload, ip)).status, 429);
  const buckets = client.db(dbName).collection("internshipApplicationRateLimits");
  assert.ok((await buckets.findOne()).expiresAt instanceof Date);
  const index = (await buckets.indexes()).find((item) => item.key.expiresAt === 1);
  assert.equal(index?.expireAfterSeconds, 0);
});

test("missing client IP and unreachable MongoDB fail closed", async () => {
  assert.equal((await apply(a, randomUUID(), payload, null)).status, 503);
  assert.equal((await apply(offline, randomUUID(), payload, "203.0.113.4")).status, 503);
});

test("verification is generic for malformed, unknown and rate-limited lookups", async () => {
  const headers = { "x-forwarded-for": "203.0.113.55" };
  const lookup = async (query) => { const r = await fetch(`${a}/api/verify?cert=${encodeURIComponent(query)}`, { headers }); return { status: r.status, body: await r.json() }; };
  const unknown = await lookup("UNKNOWN-ID");
  const malformed = await lookup("???");
  for (let i = 0; i < 30; i++) await lookup("UNKNOWN-ID");
  assert.deepEqual(malformed, unknown);
  assert.deepEqual(await lookup("UNKNOWN-ID"), unknown);
});

test("application export rejects unauthenticated users", async () => {
  const response = await fetch(`${a}/api/admin/internship-applications/export`);
  assert.ok([401, 403].includes(response.status));
});
