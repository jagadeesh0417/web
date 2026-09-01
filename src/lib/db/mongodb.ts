import { MongoClient, Db } from "mongodb";

const DATABASE_NAME = "akradhii";

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

async function connectToDatabase(): Promise<MongoClient> {
  if (cachedClient) {
    return cachedClient;
  }

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI environment variable is not defined");
  }

  const client = await MongoClient.connect(uri);
  cachedClient = client;
  return client;
}

export async function getDb(): Promise<Db> {
  if (cachedDb) {
    return cachedDb;
  }

  const client = await connectToDatabase();
  cachedDb = client.db(DATABASE_NAME);
  return cachedDb;
}
