import { Schema, model, models, type Model, type HydratedDocument } from "mongoose";

// Kept as a union instead of a free string so invalid values are caught
// both at compile time (TS) and at runtime (Mongoose's `enum` validator).
export type EventMode = "online" | "offline" | "hybrid";

// Shape of an Event document's own fields.
export interface IEvent {
  title: string;
  slug: string;
  description: string;
  overview: string;
  image: string;
  venue: string;
  location: string;
  date: string;
  time: string;
  mode: EventMode;
  audience: string;
  agenda: string[];
  organizer: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export type EventDocument = HydratedDocument<IEvent>;

const eventSchema = new Schema<IEvent>(
  {
    title: { type: String, required: true, trim: true },
    // Not `required`: it doesn't exist yet on a brand-new document — the
    // pre-save hook below fills it in from `title` before the write happens.
    slug: { type: String, unique: true, trim: true },
    description: { type: String, required: true, trim: true },
    overview: { type: String, required: true, trim: true },
    image: { type: String, required: true, trim: true },
    venue: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    date: { type: String, required: true, trim: true },
    time: { type: String, required: true, trim: true },
    mode: { type: String, required: true, enum: ["online", "offline", "hybrid"] },
    audience: { type: String, required: true, trim: true },
    // Mongoose's `required` check on an array also enforces length > 0,
    // and on a string field it also rejects an empty string — so this
    // already covers "present and non-empty" for every field below.
    agenda: { type: [String], required: true },
    organizer: { type: String, required: true, trim: true },
    tags: { type: [String], required: true },
  },
  { timestamps: true } // adds & maintains createdAt / updatedAt automatically
);

/** Lowercases, trims, and hyphenates a title into a URL-friendly slug. */
function slugify(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Matches "9:30 AM", "09:30am", "14:05" and normalizes to 24h "HH:MM".
const TIME_PATTERN = /^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i;

// Mongoose 9 dropped the callback-style `next` for `pre("save", ...)`
// hooks: it's now purely promise-based — return normally to continue,
// or throw/reject to abort the save.
eventSchema.pre("save", function () {
  // Only regenerate the slug when the title is new or changed, so editing
  // an unrelated field never silently changes the event's URL.
  if (this.isModified("title")) {
    this.slug = slugify(this.title);
  }

  // Normalize `date` to ISO format (YYYY-MM-DD) so sorting/filtering by
  // date is consistent no matter how the caller formatted it.
  if (this.isModified("date")) {
    const parsed = new Date(this.date);
    if (Number.isNaN(parsed.getTime())) {
      throw new Error(`Invalid date value: "${this.date}"`);
    }
    this.date = parsed.toISOString().split("T")[0];
  }

  // Normalize `time` to 24-hour "HH:MM" for consistent storage/display.
  if (this.isModified("time")) {
    const match = this.time.trim().match(TIME_PATTERN);
    if (!match) {
      throw new Error(`Invalid time value: "${this.time}"`);
    }
    const [, hoursRaw, minutes, meridiem] = match;
    let hours = Number(hoursRaw);
    if (meridiem) {
      const isPM = meridiem.toUpperCase() === "PM";
      if (isPM && hours !== 12) hours += 12;
      if (!isPM && hours === 12) hours = 0;
    }
    this.time = `${String(hours).padStart(2, "0")}:${minutes}`;
  }
});

// Reuse the existing model in dev: Next.js hot-reload re-executes this
// module, and calling `model()` twice for the same name throws
// "OverwriteModelError".
const Event: Model<IEvent> = models.Event ?? model<IEvent>("Event", eventSchema);

export default Event;
