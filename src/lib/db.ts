import mongoose from "mongoose";

// Only read from MONGODB_URI — this is the canonical name validated by env.ts.
const MONGODB_URI = process.env.MONGODB_URI;

// Warn at import time rather than throwing, since this runs during build
// when env vars may not yet be set (e.g. Vercel static page collection).
// The actual connection error will surface at runtime when dbConnect() is called.
if (!MONGODB_URI) {
  console.warn(
    "[WARNING] MONGODB_URI is not defined. " +
    "Set it in .env.local (development) or your deployment environment."
  );
}

type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

declare global {
  var mongoose: MongooseCache | undefined;
}

const cached = global.mongoose ?? (global.mongoose = { conn: null, promise: null });

async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!MONGODB_URI) {
    throw new Error(
      "MONGODB_URI is not configured. Set it in .env.local or your deployment environment."
    );
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default dbConnect;
