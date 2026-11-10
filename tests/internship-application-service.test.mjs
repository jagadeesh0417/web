import { test } from "node:test";
import { strict as assert } from "node:assert";
import { readFile } from "node:fs/promises";
import ts from "typescript";

const source = await readFile("src/lib/internships/application-service.ts", "utf8");
const js = ts.transpile(source, { module: ts.ModuleKind.ESNext });
const { submitApplication } = await import(`data:text/javascript;base64,${Buffer.from(js).toString("base64")}`);

test("successful save returns the persisted application", async () => {
  const result = await submitApplication({ rateLimit: async () => true, save: async () => ({ application: { id: "one" }, created: true }) });
  assert.deepEqual(result, { status: 200, application: { id: "one" }, created: true });
});

test("storage failure fails closed", async () => {
  const result = await submitApplication({ rateLimit: async () => true, save: async () => { throw new Error("offline"); } });
  assert.deepEqual(result, { status: 503 });
});

test("duplicate returns the existing application and conflicting reuse is rejected", async () => {
  const existing = { id: "one" };
  const duplicate = await submitApplication({ rateLimit: async () => true, save: async () => ({ application: existing, created: false }) });
  assert.deepEqual(duplicate, { status: 200, application: existing, created: false });
  assert.equal((await submitApplication({ rateLimit: async () => true, save: async () => null })).status, 409);
});

test("rate limited requests do not write", async () => {
  let called = false;
  const result = await submitApplication({ rateLimit: async () => false, save: async () => { called = true; return null; } });
  assert.equal(result.status, 429);
  assert.equal(called, false);
});
