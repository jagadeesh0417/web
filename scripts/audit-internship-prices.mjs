import { MongoClient } from "mongodb";
import { INTERNSHIP_PRICES, INTERNSHIP_PRICES_BY_DURATION } from "../src/lib/internship-pricing.ts";

// Usage: node scripts/audit-internship-prices.mjs <database-name>
// MONGODB_URI must contain the same database name in its path. Use a read-only MongoDB account.
const databaseName = process.argv[2];
if (!databaseName || process.argv.length !== 3 || !/^[a-zA-Z0-9_-]+$/.test(databaseName)) {
  console.error("Supply exactly one explicit database name: node scripts/audit-internship-prices.mjs <database-name>");
  process.exit(1);
}
console.log(`Database: ${databaseName}`);
const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("MONGODB_URI is required.");
  process.exit(1);
}
let uriDatabase;
try {
  const parsed = new URL(uri);
  if (!['mongodb:', 'mongodb+srv:'].includes(parsed.protocol)) throw new Error();
  uriDatabase = decodeURIComponent(parsed.pathname.slice(1));
} catch {
  console.error("Invalid MongoDB URI.");
  process.exit(1);
}
if (uriDatabase !== databaseName) {
  console.error("The URI must explicitly name the same database as the argument.");
  process.exit(1);
}

const durationPrices = { 4: INTERNSHIP_PRICES.foundation, 6: INTERNSHIP_PRICES.professional, 8: INTERNSHIP_PRICES.industry };
const knownIds = { p4: "foundation", p6: "professional", p8: "industry" };
const slugFor = (value) => {
  if (typeof value !== "string") return undefined;
  const key = value.toLowerCase();
  return Object.hasOwn(INTERNSHIP_PRICES, key) ? key : knownIds[key];
};
const get = (obj, field) => field.split(".").reduce((value, key) => value?.[key], obj);
const safeId = (id) => {
  const value = String(id ?? "unknown");
  return /^[a-f\d]{24}$/i.test(value) || /^[a-z\d_-]{1,80}$/i.test(value) ? value : "[redacted-id]";
};
const safeValue = (value) => typeof value === "number" && Number.isFinite(value) ? value : "[non-numeric]";
const specs = [
  { name: "pricingConfig", fields: Object.keys(INTERNSHIP_PRICES_BY_DURATION), settings: true },
  { name: "referral-config", fields: Object.keys(INTERNSHIP_PRICES_BY_DURATION), settings: true },
  { name: "programs", fields: ["price"] },
  { name: "plans", fields: ["price"] },
  { name: "plans-config", fields: ["price", ...Object.keys(INTERNSHIP_PRICES_BY_DURATION)] },
  { name: "categories", fields: ["price"] },
  { name: "enrollments", fields: ["price"], historical: true },
  { name: "applications", fields: ["price", "amount"], historical: true },
  { name: "payments", fields: ["amount"], historical: true },
  { name: "internshipApplications", fields: ["application.amount"], historical: true },
];
const projection = { _id: 1, id: 1, slug: 1, programSlug: 1, programId: 1, duration: 1, durationWeeks: 1, "application.programSlug": 1, "application.duration": 1 };
for (const spec of specs) for (const field of spec.fields) projection[field] = 1;
const client = new MongoClient(uri, { serverSelectionTimeoutMS: 10000 });
try {
  await client.connect();
  const db = client.db(databaseName);
  const programs = new Map();
  for await (const doc of db.collection("programs").find({}, { projection })) {
    const slug = slugFor(doc.slug) ?? slugFor(doc.id);
    if (slug) {
      if (doc.id != null) programs.set(String(doc.id), slug);
      if (doc._id != null) programs.set(String(doc._id), slug);
    }
  }
  let mismatches = 0;
  let unknown = 0;
  for (const spec of specs) {
    for await (const doc of db.collection(spec.name).find({}, { projection })) {
      const slug = slugFor(doc.programSlug) ?? slugFor(doc.application?.programSlug) ?? slugFor(doc.slug) ?? slugFor(doc.programId) ?? programs.get(String(doc.programId));
      const duration = doc.durationWeeks ?? doc.application?.duration ?? doc.duration;
      const durationMatch = typeof duration === "number" ? duration : typeof duration === "string" ? Number.parseInt(duration, 10) : undefined;
      const price = slug ? INTERNSHIP_PRICES[slug] : durationPrices[durationMatch];
      for (const field of spec.fields) {
        const stored = get(doc, field);
        if (stored === undefined) continue;
        const canonical = Object.hasOwn(INTERNSHIP_PRICES_BY_DURATION, field) ? INTERNSHIP_PRICES_BY_DURATION[field] : price;
        if (canonical === undefined) { unknown++; continue; }
        if (stored !== canonical) {
          console.log(JSON.stringify({ collection: spec.name, id: safeId(doc._id ?? doc.id), field, stored: safeValue(stored), canonical, historical: Boolean(spec.historical) }));
          mismatches++;
        }
      }
    }
  }
  console.error(`Audit finished: ${mismatches} differing fields; ${unknown} fields could not be mapped to a plan. Historical differences are not migration candidates by default. File-backed admin stores are not included.`);
} catch {
  console.error("Read-only audit failed; check connectivity and read permissions. No database error details are printed.");
  process.exitCode = 1;
} finally {
  await client.close();
}
