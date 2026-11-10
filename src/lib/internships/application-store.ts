import { createHash } from "node:crypto";
import { MongoServerError } from "mongodb";
import { getDb } from "@/lib/db/mongodb";

export type StoredApplication = {
  id: string;
  orderId: string;
  status: "pending_payment";
  categorySlug: string;
  categoryTitle: string;
  programSlug: string;
  programTitle: string;
  duration: number;
  amount: number;
  currency: string;
  student: Record<string, string | undefined>;
  referralCode?: string;
  consent: { acceptedAt: string; version: string };
  createdAt: string;
};

type ApplicationRecord = { _id: string; fingerprint: string; application: StoredApplication };
const hash = (s: string) => createHash("sha256").update(s).digest("hex");

export async function saveApplication(key: string, fingerprint: string, application: StoredApplication) {
  const records = (await getDb()).collection<ApplicationRecord>("internshipApplications");
  const _id = `request:${hash(key)}`;
  try {
    await records.insertOne({ _id, fingerprint, application });
    return { application, created: true };
  } catch (error) {
    if (error instanceof MongoServerError && error.code === 11000) {
      const existing = await records.findOne({ _id });
      if (existing) return existing.fingerprint === fingerprint ? { application: existing.application, created: false } : null;
    }
    throw error;
  }
}
