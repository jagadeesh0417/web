// Run once per MongoDB environment: node --env-file=.env.local scripts/migrate-internship-applications.mjs
import { MongoClient } from "mongodb";

if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI is required");
const client = new MongoClient(process.env.MONGODB_URI);
const databaseName = process.env.MONGODB_DATABASE || "akradhii";
if (process.env.MONGODB_TEST_MODE === "1" && !databaseName.startsWith("test_")) {
  throw new Error("Test migrations require a database name beginning with test_.");
}
try {
  await client.connect();
  const db = client.db(databaseName);
  const existing = await db.listCollections({ name: "internshipApplications" }, { nameOnly: true }).hasNext();
  if (!existing) {
    await db.createCollection("internshipApplications", {
      validator: { $jsonSchema: {
        bsonType: "object",
        required: ["_id", "fingerprint", "application"],
        properties: {
          _id: { bsonType: "string" },
          fingerprint: { bsonType: "string" },
          application: {
            bsonType: "object",
            required: ["id", "categorySlug", "programSlug", "student", "consent", "status", "createdAt"],
            properties: {
              id: { bsonType: "string" }, categorySlug: { bsonType: "string" }, programSlug: { bsonType: "string" },
              student: { bsonType: "object", required: ["fullName", "email", "mobile"] },
              consent: { bsonType: "object", required: ["acceptedAt", "version"] },
              status: { bsonType: "string" }, createdAt: { bsonType: "string" },
            },
          },
        },
      } },
    });
  } else {
    console.log("Existing application collection retained; review its validator separately.");
  }
  await db.collection("internshipApplications").createIndex({ "application.id": 1 }, { unique: true });
  await db.collection("internshipApplications").createIndex({ "application.status": 1, "application.createdAt": -1 });
  await db.collection("internshipApplicationRateLimits").createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
  console.log("Internship application and rate-limit indexes are ready.");
} finally {
  await client.close();
}
