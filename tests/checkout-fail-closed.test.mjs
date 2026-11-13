import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { runInNewContext } from "node:vm";

// Exercise the actual route handlers with a minimal NextResponse adapter, without
// connecting to a database or payment provider.
for (const route of [
  "src/app/api/internships/payment/create/route.ts",
  "src/app/api/internships/payment/verify/route.ts",
  "src/app/api/payment/create-order/route.ts",
  "src/app/api/payment/verify/route.ts",
  "src/app/api/purchases/route.ts",
]) {
  test(`${route} rejects unverified checkout`, async () => {
    const source = await readFile(route, "utf8");
    const start = source.indexOf("export async function POST()");
    assert.notEqual(start, -1, "expected a fail-closed POST handler");
    const handler = source.slice(start).replace("export async function POST()", "async function POST()");
    const NextResponse = { json: (body, init) => ({ body, ...init }) };
    const post = runInNewContext(`${handler}\nPOST`, { NextResponse });
    const response = await post();
    assert.equal(response.status, 503);
    assert.equal(response.body.ok, false);
    assert.equal(response.headers["Cache-Control"], "no-store");
  });
}
