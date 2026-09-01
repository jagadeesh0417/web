import {
  Collection,
  Document,
  InsertOneResult,
  UpdateResult,
  DeleteResult,
  OptionalUnlessRequiredId,
  Filter,
  UpdateFilter,
  WithId,
} from "mongodb";
import { getDb } from "./mongodb";

export { getDb } from "./mongodb";
export { COLLECTIONS } from "./collections";
export type {
  User,
  Course,
  Module,
  Lesson,
  Video,
  Pdf,
  Purchase,
  Subscription,
  Referral,
  WalletTransaction,
  Withdrawal,
  PricingConfig,
  CourseAccess,
  AuditLog,
  UserRole,
  AccountStatus,
  CourseStatus,
  LessonStatus,
  PurchaseStatus,
  SubscriptionStatus,
  ReferralStatus,
  TransactionType,
  WithdrawalStatus,
  AccessType,
} from "./models";

async function getCollection<T extends Document = Document>(
  collectionName: string
): Promise<Collection<T>> {
  const db = await getDb();
  return db.collection<T>(collectionName);
}

export async function findOne<T extends Document = Document>(
  collectionName: string,
  filter: Filter<T>
): Promise<WithId<T> | null> {
  const collection = await getCollection<T>(collectionName);
  return collection.findOne(filter);
}

export async function findMany<T extends Document = Document>(
  collectionName: string,
  filter: Filter<T>
): Promise<WithId<T>[]> {
  const collection = await getCollection<T>(collectionName);
  return collection.find(filter).toArray();
}

export async function insertOne<T extends Document = Document>(
  collectionName: string,
  document: OptionalUnlessRequiredId<T>
): Promise<InsertOneResult<T>> {
  const collection = await getCollection<T>(collectionName);
  return collection.insertOne(document);
}

export async function updateOne<T extends Document = Document>(
  collectionName: string,
  filter: Filter<T>,
  update: UpdateFilter<T>
): Promise<UpdateResult<T>> {
  const collection = await getCollection<T>(collectionName);
  return collection.updateOne(filter, update);
}

export async function deleteOne<T extends Document = Document>(
  collectionName: string,
  filter: Filter<T>
): Promise<DeleteResult> {
  const collection = await getCollection<T>(collectionName);
  return collection.deleteOne(filter);
}

export async function countDocuments<T extends Document = Document>(
  collectionName: string,
  filter: Filter<T>
): Promise<number> {
  const collection = await getCollection<T>(collectionName);
  return collection.countDocuments(filter);
}
