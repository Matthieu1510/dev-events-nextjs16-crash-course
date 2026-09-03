// One-off migration: fixes Event documents created before the
// parseArrayField() fix in app/api/events/route.ts, where `agenda`/`tags`
// were stored as a 1-element array containing a JSON-encoded string
// (e.g. agenda: ['["08:30 AM - ...", "09:45 AM - ..."]']) instead of a
// proper flat string[]. Already-correct documents are left untouched.
//
// Run from the project root with:
//   node --env-file=.env.local scripts/fix-legacy-agenda-tags.mjs

import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error(
    "Missing MONGODB_URI. Run with: node --env-file=.env.local scripts/fix-legacy-agenda-tags.mjs"
  );
  process.exit(1);
}

// Loose schema (strict: false) — this script only needs to read/write
// agenda and tags, not the full validated Event shape.
const EventSchema = new mongoose.Schema({}, { strict: false, collection: "events" });
const Event = mongoose.models.Event ?? mongoose.model("Event", EventSchema);

function tryParseLegacyArray(value) {
  if (!Array.isArray(value) || value.length !== 1) return null;
  const raw = value[0];
  if (typeof raw !== "string" || !raw.trim().startsWith("[")) return null;
  try {
    const parsed = JSON.parse(raw);
    // The legacy bug always collapsed multiple items into one string —
    // a single-element result is more likely a genuine one-item array
    // (e.g. a tag whose text happens to start with "[") than legacy data,
    // so leave it alone rather than guess.
    return Array.isArray(parsed) && parsed.length > 1 ? parsed.map(String) : null;
  } catch {
    return null;
  }
}

await mongoose.connect(MONGODB_URI, { bufferCommands: false });
console.log("Connected. Scanning events...");

const events = await Event.find({});
let fixedCount = 0;

for (const event of events) {
  const update = {};
  const fixedAgenda = tryParseLegacyArray(event.agenda);
  if (fixedAgenda) update.agenda = fixedAgenda;
  const fixedTags = tryParseLegacyArray(event.tags);
  if (fixedTags) update.tags = fixedTags;

  if (Object.keys(update).length > 0) {
    await Event.updateOne({ _id: event._id }, { $set: update });
    console.log(`Fixed "${event.slug}":`, update);
    fixedCount++;
  }
}

console.log(`Done. Fixed ${fixedCount} event(s).`);
await mongoose.disconnect();
process.exit(0);
