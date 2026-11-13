import { MongoClient, Db } from "mongodb";

const DATABASE_NAME = "akradhii";

let clientPromise: Promise<MongoClient> | null = null;
let cachedDb: Db | null = null;

async function connectToDatabase(): Promise<MongoClient> {
  if (clientPromise) return clientPromise;

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI environment variable is not defined");
  }

  clientPromise = MongoClient.connect(uri).catch((error) => {
    clientPromise = null;
    throw error;
  });
  return clientPromise;
}

export async function getDb(): Promise<Db> {
  if (cachedDb) {
    return cachedDb;
  }

  const client = await connectToDatabase();
  cachedDb = client.db(process.env.MONGODB_DATABASE || DATABASE_NAME);
  return cachedDb;
}
