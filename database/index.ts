// Single entry point for the database layer: import models from
// "@/database" instead of reaching into individual files.
export { default as Event } from "./event.model";
export { default as Booking } from "./booking.model";
export type { IEvent, EventMode, EventDocument } from "./event.model";
export type { IBooking, BookingDocument } from "./booking.model";
