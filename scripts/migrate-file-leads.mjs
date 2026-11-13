// Import a backed-up legacy leads.json without deleting or modifying it.
// Usage: node --env-file=.env.local scripts/migrate-file-leads.mjs path/to/leads.json
import { readFile } from "node:fs/promises";
import { MongoClient } from "mongodb";

const file = process.argv[2];
if (!file || !process.env.MONGODB_URI) {
  console.error("Provide a leads JSON file and configure MONGODB_URI.");
  process.exit(1);
}
const leads = JSON.parse(await readFile(file, "utf8"));
if (!Array.isArray(leads) || leads.some((lead) => !lead || typeof lead.id !== "string" || !lead.id)) {
  throw new Error("Expected an array of leads with nonempty IDs; nothing was imported.");
}
const client = new MongoClient(process.env.MONGODB_URI);
try {
  await client.connect();
  const records = client.db("akradhii").collection("websiteLeads");
  let inserted = 0;
  for (const lead of leads) {
    const result = await records.updateOne({ _id: `legacy:${lead.id}` }, { $setOnInsert: { lead } }, { upsert: true });
    inserted += result.upsertedCount;
  }
  console.log(`Imported ${inserted} leads; ${leads.length - inserted} were already imported.`);
} finally {
  await client.close();
}
