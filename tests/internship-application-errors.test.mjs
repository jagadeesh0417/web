import { test } from "node:test";
import { strict as assert } from "node:assert";
import { readFile } from "node:fs/promises";
import ts from "typescript";

const source = await readFile("src/lib/internships/application-errors.ts", "utf8");
const js = ts.transpile(source, { module: ts.ModuleKind.ESNext });
const { applicationErrorFields, applicationErrorKey } = await import(`data:text/javascript;base64,${Buffer.from(js).toString("base64")}`);

test("server validation keys map to form fields and the fields render errors", async () => {
  const page = await readFile("src/app/(marketing)/internships/apply/page.tsx", "utf8");
  const route = await readFile("src/app/api/internships/apply/route.ts", "utf8");
  assert.match(route, /applicationErrorKey\(String\(issue\.path/);
  for (const field of applicationErrorFields) assert.match(page, new RegExp(`errors\\.${field}\\b`), `${field} has no rendered error`);
  for (const key of ["categorySlug", "programSlug", "duration", "website", "referralCode", "", ...applicationErrorFields]) {
    const mapped = applicationErrorKey(key);
    assert.ok(mapped === "general" || applicationErrorFields.includes(mapped), `${key} is not mapped`);
  }
  for (const match of route.matchAll(/errors:\s*\{\s*(\w+)\s*:/g)) assert.ok(applicationErrorFields.includes(match[1]), `${match[1]} is not a rendered field`);
});
