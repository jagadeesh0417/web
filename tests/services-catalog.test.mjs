import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("existing service detail routes remain present", async () => {
  const source = await readFile("src/config/services-detail.ts", "utf8");
  for (const slug of ["web-development", "meta-ads", "automation", "crm", "ai-automation", "seo", "branding"]) {
    assert.match(source, new RegExp(`slug: "${slug}"`));
  }
});

test("proposed services are not included in the public catalog", async () => {
  const hub = await readFile("src/app/(marketing)/services/page.tsx", "utf8");
  const catalog = await readFile("src/components/services/service-catalog.tsx", "utf8");
  assert.doesNotMatch(hub + catalog, /service-catalog-drafts|proposedServices/);
  assert.match(hub, /services=\{servicesHub\}/);
});

test("service pages do not present sample portfolio data as verified work", async () => {
  for (const file of ["src/app/(marketing)/services/page.tsx", "src/app/(marketing)/services/[slug]/page.tsx"]) {
    const source = await readFile(file, "utf8");
    assert.doesNotMatch(source, /sample-data|portfolioItems/);
  }
});
