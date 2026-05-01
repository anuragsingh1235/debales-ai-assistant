import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error('MONGODB_URI environment variable is not defined');
}

// cached connection for hot reloads in dev
let cached = global as typeof global & {
  mongoose?: { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null };
};

if (!cached.mongoose) {
  cached.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.mongoose!.conn) {
    return cached.mongoose!.conn;
  }

  if (!cached.mongoose!.promise) {
    cached.mongoose!.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
    });
  }

  try {
    cached.mongoose!.conn = await cached.mongoose!.promise;
  } catch (err) {
    cached.mongoose!.promise = null;
    throw err;
  }

  return cached.mongoose!.conn;
}

export default connectDB;
