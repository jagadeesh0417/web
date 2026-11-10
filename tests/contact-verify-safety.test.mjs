import { test } from "node:test";
import { strict as assert } from "node:assert";
import { readFile } from "node:fs/promises";
import ts from "typescript";

test("verification does not trust local certificates during an API outage", async () => {
  const source = await readFile("src/app/verify/page.tsx", "utf8");
  assert.doesNotMatch(source, /getCertificateById/);
  assert.match(source, /Online certificate verification is not yet available/);
  assert.match(source, /mailto:/);
});

test("contact does not load an embedded map automatically", async () => {
  const source = await readFile("src/app/(marketing)/contact/page.tsx", "utf8");
  assert.doesNotMatch(source, /<iframe/);
  assert.match(source, /google\.com\/maps\/search/);
});

test("Mongo login returns the same error for missing and incorrect credentials", async () => {
  const source = await readFile("src/app/api/auth/login/route.ts", "utf8");
  assert.equal((source.match(/Invalid email or password/g) ?? []).length, 2);
});

test("lead persistence does not fall back to ephemeral disk or memory", async () => {
  const source = await readFile("src/lib/leads/store.ts", "utf8");
  assert.match(source, /collection<StoredLead>\("websiteLeads"\)/);
  assert.match(source, /await records\.insertOne/);
  assert.doesNotMatch(source, /writeFile|\/tmp|leads\.json/);
  assert.match(source, /throw error/);
});

test("authentication redirects accept only known internal account paths", async () => {
  const source = await readFile("src/lib/auth/redirect.ts", "utf8");
  const js = ts.transpile(source, { module: ts.ModuleKind.ESNext });
  const { safeAuthRedirect } = await import(`data:text/javascript;base64,${Buffer.from(js).toString("base64")}`);
  assert.equal(safeAuthRedirect("/student/assignments"), "/student/assignments");
  for (const value of ["//evil.example", "https://evil.example", "/\\evil.example", "/admin?next=https://evil.example", "/unknown"]) {
    assert.equal(safeAuthRedirect(value), "/dashboard");
  }
  assert.equal(safeAuthRedirect(null, "/login"), "/login");
});
