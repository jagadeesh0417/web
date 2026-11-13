import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const source = (file) => readFile(new URL(`../${file}`, import.meta.url), "utf8");

test("public resources and sitemap bypass protected-page middleware", async () => {
  const middleware = await source("src/middleware.ts");
  for (const route of ["/resources", "/courses", "/sitemap.xml", "/robots.txt"]) assert.ok(middleware.includes(`"${route}"`));
});

test("production rejects demo session fallback and admin roles use trusted metadata", async () => {
  for (const file of ["src/middleware.ts", "src/lib/auth/api-guard.ts", "src/lib/auth/student-api-guard.ts"]) {
    const content = await source(file);
    assert.match(content, /NODE_ENV === "production"/);
    assert.match(content, /app_metadata\?\.role/);
    assert.doesNotMatch(content, /user_metadata\?\.role/);
  }
});

test("lead listing no longer grants unauthenticated access", async () => {
  const content = await source("src/app/api/leads/route.ts");
  const listing = content.slice(content.indexOf("export async function GET"));
  assert.match(listing, /requireAdminApi\(request\)/);
  assert.doesNotMatch(listing, /ak_demo_session|!supabaseConfigured/);
});

test("untrusted browser assessment cannot issue certificates", async () => {
  const content = await source("src/app/api/internships/certificate/route.ts");
  assert.match(content, /status: 503/);
  assert.doesNotMatch(content, /issueCertificateForUser/);
});

test("certificate revocation requires an admin", async () => {
  const content = await source("src/app/api/certificates/[id]/revoke/route.ts");
  assert.match(content, /await requireAdminApi\(request\)/);
});
