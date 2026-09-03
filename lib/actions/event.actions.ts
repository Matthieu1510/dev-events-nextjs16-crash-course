'use server';
import Event from '@/database/event.model';
import connectDB from '@/lib/mongodb'

export const getSimilarEventsBySlug = async (slug: string) => {
    try {
        await connectDB();
        const event = await Event.findOne({ slug });

        // No event matches this slug — nothing to compare tags against.
        if (!event) {
            return [];
        }

        // `tags` must be a sibling of `_id`, not nested inside it — each is
        // a separate condition on the query (exclude this event, and match
        // on shared tags).
        // Capped to 1: with a small dataset where every event shares the
        // same tags, an uncapped query would return every other event as
        // "similar" (all of them overlap). Limiting keeps the section to a
        // single, genuinely-most-relevant suggestion instead of listing
        // the entire catalog.
        const similarEvents = await Event.find({
            _id: {$ne: event._id},
            tags: {$in: event.tags},
        }).limit(3).lean();

        // This result crosses a Server Component -> Client Component
        // boundary (EventCard is 'use client'), which requires plain,
        // JSON-serializable data. `.lean()` alone isn't enough: fields
        // like `_id` are still BSON ObjectId instances with their own
        // `toJSON()`, which React's RSC serializer rejects. Round-tripping
        // through JSON strips them down to plain strings/objects.
        return JSON.parse(JSON.stringify(similarEvents));
    } catch {
        return [];
    }
}