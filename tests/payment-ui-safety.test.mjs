import { readFile } from "node:fs/promises";
import { test } from "node:test";
import assert from "node:assert/strict";

test("checkout UI does not auto-confirm a simulated payment", async () => {
  const source = await readFile("src/app/(marketing)/internships/apply/page.tsx", "utf8");
  assert.doesNotMatch(source, /fetch\(["']\/api\/internships\/payment\/verify/);
  assert.match(source, /Online checkout is currently unavailable/);
});

test("payment configuration exposes presence only and cannot be updated through the API", async () => {
  const source = await readFile("src/app/api/admin/payment-config/route.ts", "utf8");
  assert.match(source, /requireAdminApi/);
  assert.match(source, /Boolean\(process\.env\.RAZORPAY_KEY_SECRET\)/);
  assert.doesNotMatch(source, /export async function PUT/);
});

test("shared styles include native option contrast and reduced motion", async () => {
  const css = await readFile("src/app/globals.css", "utf8");
  assert.match(css, /select option,[\s\S]*?background-color: var\(--dropdown-background\)/);
  assert.match(css, /prefers-reduced-motion: reduce/);
});
