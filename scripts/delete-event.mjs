// One-off, targeted deletion: removes exactly one Event document by its
// slug. Hardcoded to "cloud-next-2026" on purpose — this script deletes
// nothing else, and does nothing at all if that slug doesn't exist.
//
// Run from the project root with:
//   node --env-file=.env.local scripts/delete-event.mjs

import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error(
    "Missing MONGODB_URI. Run with: node --env-file=.env.local scripts/delete-event.mjs"
  );
  process.exit(1);
}

const SLUG_TO_DELETE = "the-real-cloud-next-2029";

const EventSchema = new mongoose.Schema({}, { strict: false, collection: "events" });
const Event = mongoose.models.Event ?? mongoose.model("Event", EventSchema);

await mongoose.connect(MONGODB_URI, { bufferCommands: false });

const target = await Event.findOne({ slug: SLUG_TO_DELETE }).select("title slug").lean();

if (!target) {
  console.log(`No event found with slug "${SLUG_TO_DELETE}". Nothing deleted.`);
} else {
  await Event.deleteOne({ _id: target._id });
  console.log(`Deleted "${target.title}" (slug: ${target.slug}).`);
}

await mongoose.disconnect();
process.exit(0);
