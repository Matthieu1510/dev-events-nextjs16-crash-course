// One-off helper: inserts a couple of demo Events so the homepage has more
// than the handful of test events created while debugging the booking flow.
//
// Run from the project root with:
//   node --env-file=.env.local scripts/add-demo-events.mjs

import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error(
    "Missing MONGODB_URI. Run with: node --env-file=.env.local scripts/add-demo-events.mjs"
  );
  process.exit(1);
}

// Mirrors the real slugify() in database/event.model.ts so slugs generated
// here look exactly like ones the app would generate itself.
function slugify(title) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const EventSchema = new mongoose.Schema({}, { strict: false, collection: "events" });
const Event = mongoose.models.Event ?? mongoose.model("Event", EventSchema);

const events = [
  {
    title: "Web Summit 2026",
    description:
      "One of the world's largest tech conferences, bringing together startups, investors, and industry leaders to explore the future of technology.",
    overview:
      "Web Summit gathers tens of thousands of attendees from the global tech ecosystem for keynotes, workshops, and networking spanning AI, fintech, climate tech, and beyond.",
    image: "https://res.cloudinary.com/gvogzmrw/image/upload/v1788436519/event6.png",
    venue: "MEO Arena",
    location: "Lisbon, Portugal",
    date: "2026-11-09",
    time: "09:00",
    mode: "offline",
    audience: "Founders, investors, engineers, product leaders",
    agenda: [
      "09:00 AM - 10:00 AM | Opening Keynote: The Next Decade of Tech",
      "10:15 AM - 11:30 AM | Panel: AI, Trust, and Regulation",
      "11:45 AM - 01:00 PM | Startup Pitch Sessions",
      "01:00 PM - 02:00 PM | Lunch & Networking",
      "02:00 PM - 03:30 PM | Workshops: Scaling a Product from 0 to 1",
      "03:45 PM - 05:00 PM | Fireside Chat: Founders Who Shipped",
    ],
    organizer:
      "Web Summit brings together the people and companies redefining the tech industry for three days of keynotes, workshops, and networking.",
    tags: ["Startups", "AI", "Networking", "Innovation"],
  },
  {
    title: "Open Source Summit Europe 2026",
    description:
      "The premier event for open source developers, technologists, and community leaders to collaborate and share the latest open source developments.",
    overview:
      "Open Source Summit Europe brings together the open source ecosystem for talks on Linux, cloud native technologies, AI, and the future of collaborative software development.",
    image: "https://res.cloudinary.com/gvogzmrw/image/upload/v1788413676/DevEvent/belpfejhsdqkkkbhgdp6.png",
    venue: "Vienna Exhibition Center",
    location: "Vienna, Austria",
    date: "2026-08-24",
    time: "09:30",
    mode: "hybrid",
    audience: "Open source maintainers, cloud engineers, DevOps teams",
    agenda: [
      "09:30 AM - 10:30 AM | Keynote: The State of Open Source",
      "10:45 AM - 12:00 PM | Deep Dive: Cloud Native Security",
      "12:00 PM - 01:00 PM | Lunch & Community Booths",
      "01:00 PM - 02:30 PM | Workshops: Contributing to Major OSS Projects",
      "02:45 PM - 04:00 PM | Panel: Sustaining Open Source Maintainers",
    ],
    organizer:
      "The Linux Foundation organizes Open Source Summit to advance the growth of open source software through collaboration, education, and support of open technology projects.",
    tags: ["Open Source", "Cloud", "Linux", "DevOps"],
  },
];

await mongoose.connect(MONGODB_URI, { bufferCommands: false });

for (const event of events) {
  const slug = slugify(event.title);
  const existing = await Event.findOne({ slug }).lean();
  if (existing) {
    console.log(`Skipped "${event.title}" — an event with slug "${slug}" already exists.`);
    continue;
  }

  const now = new Date();
  await Event.create({ ...event, slug, createdAt: now, updatedAt: now });
  console.log(`Created "${event.title}" (slug: ${slug})`);
}

await mongoose.disconnect();
process.exit(0);
