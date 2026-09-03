// Read-only helper: lists every Booking document with its linked event.
//
// Run from the project root with:
//   node --env-file=.env.local scripts/list-bookings.mjs

import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error(
    "Missing MONGODB_URI. Run with: node --env-file=.env.local scripts/list-bookings.mjs"
  );
  process.exit(1);
}

const BookingSchema = new mongoose.Schema({}, { strict: false, collection: "bookings" });
const Booking = mongoose.models.Booking ?? mongoose.model("Booking", BookingSchema);
const EventSchema = new mongoose.Schema({}, { strict: false, collection: "events" });
const Event = mongoose.models.Event ?? mongoose.model("Event", EventSchema);

await mongoose.connect(MONGODB_URI, { bufferCommands: false });

const bookings = await Booking.find({}).sort({ createdAt: -1 }).lean();

console.log(`Found ${bookings.length} booking(s):\n`);
for (const b of bookings) {
  const event = await Event.findById(b.eventId).select("title slug").lean();
  console.log(`- ${b.email}  →  ${event ? `"${event.title}" (${event.slug})` : `unknown event (${b.eventId})`}`);
  console.log(`    createdAt: ${b.createdAt}`);
}

await mongoose.disconnect();
process.exit(0);
