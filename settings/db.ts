import mongoose, { Mongoose } from "mongoose";

declare global {
  // บอก TypeScript ว่าเราจะเก็บ cache ไว้ใน globalThis
  var mongoose: {
    conn: Mongoose | null;
    promise: Promise<Mongoose> | null;
  } | undefined;
}

// ใช้ global cache เพื่อป้องกันการ connect ซ้ำเวลา hot-reload (ใน dev)
let cached = global.mongoose ?? {
  conn: null,
  promise: null,
};

global.mongoose = cached;

export default async function connectDB(): Promise<Mongoose | null> {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    if (!process.env.MONGODB_URI) {
      throw new Error("Please define the MONGODB_URI environment variable");
    }

    cached.promise = mongoose.connect(process.env.MONGODB_URI).then((mongoose) => mongoose);
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }

  return cached.conn;
}
