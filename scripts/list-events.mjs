// Read-only helper: lists every Event document's title, slug, and tags.
//
// Run from the project root with:
//   node --env-file=.env.local scripts/list-events.mjs

import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error(
    "Missing MONGODB_URI. Run with: node --env-file=.env.local scripts/list-events.mjs"
  );
  process.exit(1);
}

const EventSchema = new mongoose.Schema({}, { strict: false, collection: "events" });
const Event = mongoose.models.Event ?? mongoose.model("Event", EventSchema);

await mongoose.connect(MONGODB_URI, { bufferCommands: false });

const events = await Event.find({}).select("title slug tags createdAt").sort({ createdAt: 1 }).lean();

console.log(`Found ${events.length} event(s):\n`);
for (const e of events) {
  console.log(`- "${e.title}"  (slug: ${e.slug})`);
  console.log(`    tags: ${JSON.stringify(e.tags)}`);
}

await mongoose.disconnect();
process.exit(0);
