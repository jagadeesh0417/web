import { test } from "node:test";
import { strict as assert } from "node:assert";
import { readFile } from "node:fs/promises";

test("verification does not trust local certificates during an API outage", async () => {
  const source = await readFile("src/app/verify/page.tsx", "utf8");
  assert.doesNotMatch(source, /getCertificateById/);
  assert.match(source, /Verification is temporarily unavailable/);
  assert.match(source, /res\.status === 404/);
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
