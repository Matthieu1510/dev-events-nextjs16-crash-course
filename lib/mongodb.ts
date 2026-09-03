import dns from "node:dns";
import mongoose from "mongoose";

// On some Windows setups, Node's built-in DNS resolver (c-ares) fails to
// reach the network's DNS server for SRV lookups (used by mongodb+srv://),
// even though the OS itself resolves it fine (e.g. via `nslookup`). Pointing
// Node explicitly at public DNS servers works around this.
dns.setServers(["8.8.8.8", "1.1.1.1"]);

// The connection string is read from the environment (see .env.local).
// We fail fast and loudly if it's missing, instead of letting mongoose
// throw a less helpful error later when we try to connect.
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    "Missing MONGODB_URI environment variable. Add it to your .env.local file."
  );
}

// Shape of the object we cache on `global` to survive Next.js dev-mode
// hot-reloads. Without this cache, every file change would open a brand
// nouveau connection to MongoDB and quickly exhaust the connection pool.
interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

// Next.js clears the Node.js module cache on every request in development,
// which would normally reset this cache too. Attaching it to `global`
// instead makes it persist across hot-reloads within the same process.
declare global {
  var mongooseCache: MongooseCache | undefined;
}

const cached: MongooseCache = global.mongooseCache ?? { conn: null, promise: null };

if (!global.mongooseCache) {
  global.mongooseCache = cached;
}

/**
 * Returns a cached Mongoose connection, creating one if it doesn't exist yet.
 * Safe to call from anywhere (Server Components, Route Handlers, Server
 * Actions) — concurrent calls share the same in-flight connection promise
 * instead of opening multiple connections.
 */
async function connectToDatabase(): Promise<typeof mongoose> {
  // Reuse an already-established connection.
  if (cached.conn) {
    return cached.conn;
  }

  // Reuse an in-flight connection attempt instead of starting a second one.
  if (!cached.promise) {
    const opts = {
      bufferCommands: false, // fail fast instead of queueing ops before connecting
    };

    cached.promise = mongoose.connect(MONGODB_URI!, opts);
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    // Reset the promise on failure so the next call can retry the connection
    // instead of being stuck reusing a rejected promise forever.
    cached.promise = null;
    throw error;
  }

  return cached.conn;
}

export default connectToDatabase;
