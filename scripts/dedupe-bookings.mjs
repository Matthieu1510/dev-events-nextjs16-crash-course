// One-off migration: removes duplicate Booking documents (same eventId +
// email), keeping only the oldest one per pair. Needed before Mongoose can
// build the new unique compound index ({ eventId: 1, email: 1 }) added to
// database/booking.model.ts — MongoDB refuses to create a unique index
// while duplicates already exist in the collection.
//
// Run from the project root with:
//   node --env-file=.env.local scripts/dedupe-bookings.mjs

import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error(
    "Missing MONGODB_URI. Run with: node --env-file=.env.local scripts/dedupe-bookings.mjs"
  );
  process.exit(1);
}

const BookingSchema = new mongoose.Schema({}, { strict: false, collection: "bookings" });
const Booking = mongoose.models.Booking ?? mongoose.model("Booking", BookingSchema);

await mongoose.connect(MONGODB_URI, { bufferCommands: false });

const bookings = await Booking.find({}).sort({ createdAt: 1 }).lean();

const seen = new Set();
const toDelete = [];
for (const b of bookings) {
  const key = `${b.eventId}:${b.email}`;
  if (seen.has(key)) {
    toDelete.push(b._id);
  } else {
    seen.add(key);
  }
}

if (toDelete.length === 0) {
  console.log("No duplicate (eventId, email) bookings found — nothing to delete.");
} else {
  console.log(`Deleting ${toDelete.length} duplicate booking(s):`);
  for (const b of bookings) {
    if (toDelete.includes(b._id)) {
      console.log(`- ${b.email}  (eventId: ${b.eventId}, createdAt: ${b.createdAt})`);
    }
  }
  await Booking.deleteMany({ _id: { $in: toDelete } });
  console.log("Done.");
}

await mongoose.disconnect();
process.exit(0);
