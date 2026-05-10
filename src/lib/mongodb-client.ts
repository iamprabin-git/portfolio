import { MongoClient, type Db } from "mongodb";

const uri = process.env.MONGODB_URI?.trim();
const dbName = process.env.MONGODB_DB?.trim() || "portfolio";

const globalForMongo = globalThis as typeof globalThis & {
  __portfolioMongoClientPromise?: Promise<MongoClient>;
};

export function isMongoConfigured(): boolean {
  return Boolean(uri);
}

/** Returns the database handle, or `null` when `MONGODB_URI` is not set. */
export async function getMongoDb(): Promise<Db | null> {
  if (!uri) return null;
  if (!globalForMongo.__portfolioMongoClientPromise) {
    const client = new MongoClient(uri);
    globalForMongo.__portfolioMongoClientPromise = client.connect();
  }
  const client = await globalForMongo.__portfolioMongoClientPromise;
  return client.db(dbName);
}
