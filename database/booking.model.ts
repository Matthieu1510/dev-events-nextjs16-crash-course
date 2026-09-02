import { Schema, model, models, Types, type Model, type HydratedDocument } from "mongoose";
import Event from "./event.model";

export interface IBooking {
  eventId: Types.ObjectId;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

export type BookingDocument = HydratedDocument<IBooking>;

// Simple, dependency-free email shape check (local@domain.tld).
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const bookingSchema = new Schema<IBooking>(
  {
    eventId: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      required: true,
      index: true, // speeds up "all bookings for this event" queries
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      validate: {
        validator: (value: string) => EMAIL_PATTERN.test(value),
        message: (props: { value: string }) => `"${props.value}" is not a valid email address`,
      },
    },
  },
  { timestamps: true } // adds & maintains createdAt / updatedAt automatically
);

// Mongoose 9 dropped the callback-style `next` for `pre("save", ...)`
// hooks: an async function that throws aborts the save automatically.
// Guards against orphaned bookings: only checks when eventId is
// new/changed, and rejects the save if that Event doesn't exist.
bookingSchema.pre("save", async function () {
  if (!this.isModified("eventId")) {
    return;
  }

  const eventExists = await Event.exists({ _id: this.eventId });
  if (!eventExists) {
    throw new Error(`Event with id "${this.eventId.toString()}" does not exist`);
  }
});

// Reuse the existing model in dev: Next.js hot-reload re-executes this
// module, and calling `model()` twice for the same name throws
// "OverwriteModelError".
const Booking: Model<IBooking> = models.Booking ?? model<IBooking>("Booking", bookingSchema);

export default Booking;
