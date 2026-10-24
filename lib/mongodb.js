import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable inside .env.local");
}

// Reuse one connection across hot reloads and serverless invocations
let cached = global.mongoose || (global.mongoose = { conn: null, promise: null });

async function connectToDatabase() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGODB_URI, { maxPoolSize: 10 })
      .then((mongoose) => {
        console.log("✅ MongoDB Connected Successfully");
        return mongoose;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (err) {
    // Don't cache a failed connection forever — allow the next request to retry
    cached.promise = null;
    throw err;
  }
  return cached.conn;
}

export default connectToDatabase;
