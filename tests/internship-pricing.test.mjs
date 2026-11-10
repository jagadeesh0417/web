import { test } from "node:test";
import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { INTERNSHIP_PRICES, INTERNSHIP_PRICES_BY_DURATION } from "../src/lib/internship-pricing.ts";
import { PLANS } from "../src/lib/payments/razorpay.mjs";

async function* files(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const name = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* files(name);
    else if (/\.(?:tsx?|mjs|jsx?)$/.test(name)) yield name;
  }
}

test("internship price consumers use the canonical amounts", async () => {
  assert.deepEqual(Object.values(INTERNSHIP_PRICES_BY_DURATION), Object.values(INTERNSHIP_PRICES));
  assert.deepEqual([PLANS.basic.amount, PLANS.standard.amount, PLANS.premium.amount], Object.values(INTERNSHIP_PRICES).map((value) => value * 100));
  const constants = await readFile("src/lib/constants.ts", "utf8");
  for (const slug of Object.keys(INTERNSHIP_PRICES)) {
    assert.match(constants, new RegExp(`price: INTERNSHIP_PRICES\\.${slug}`));
  }
});

test("current internship source has no hard-coded price strings or plan price fields", async () => {
  for await (const file of files("src")) {
    const normalized = file.replaceAll("\\", "/");
    // Sample payment and enrollment records represent historical transactions, not current prices.
    if (normalized === "src/lib/data/sample-data.ts" || normalized === "src/lib/internship-pricing.ts") continue;
    const text = await readFile(file, "utf8");
    if (!/internship|fourWeekPrice|sixWeekPrice|eightWeekPrice/i.test(text)) continue;
    assert.doesNotMatch(text, /(?:fourWeekPrice|sixWeekPrice|eightWeekPrice)\s*:\s*\d+/, `${file}: hard-coded plan price`);
    assert.doesNotMatch(text, /(?:₹|\bINR\s*)\s*(?:149|199|249|299|1,?999|3,?499|5,?499)\b/i, `${file}: hard-coded internship price string`);
    if (normalized.startsWith("src/app/(marketing)/internships/") || normalized === "src/lib/constants.ts" || normalized === "src/lib/data/internship-faq.ts") {
      assert.doesNotMatch(text, /(?:₹|\bINR\s*)\s*\d[\d,]*/i, `${file}: hard-coded currency amount requires review`);
      assert.doesNotMatch(text, /\bprice\s*:\s*\d+/, `${file}: hard-coded price`);
    }
  }
});
