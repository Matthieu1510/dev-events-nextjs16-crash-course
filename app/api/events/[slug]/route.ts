import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Event from "@/database/event.model";

// Next.js 15+ passes dynamic route segments as a Promise — must be awaited
// before the value can be used.
interface RouteContext {
    params: Promise<{ slug: string }>;
}

// Matches the format produced by the slugify() helper in event.model.ts:
// lowercase words separated by single hyphens, no leading/trailing hyphen.
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export async function GET(req: NextRequest, { params }: RouteContext) {
    try {
        const { slug: rawSlug } = await params;

        if (!rawSlug || typeof rawSlug !== "string") {
            return NextResponse.json(
                { message: "A valid event slug is required" },
                { status: 400 }
            );
        }

        // Sanitize before validating: a slug is case-insensitive and
        // whitespace shouldn't matter, so normalize first instead of
        // rejecting a request just because it was typed "Cloud-Next-2026".
        const slug = rawSlug.trim().toLowerCase();

        if (!SLUG_PATTERN.test(slug)) {
            return NextResponse.json(
                { message: "A valid event slug is required" },
                { status: 400 }
            );
        }

        await connectDB();

        // .lean() returns a plain object instead of a Mongoose document —
        // faster for a read-only response and serializes cleanly to JSON.
        const event = await Event.findOne({ slug }).lean();

        if (!event) {
            return NextResponse.json(
                { message: `Event with slug '${slug}' not found` },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { message: "Event fetched successfully", event },
            { status: 200 }
        );
    } catch (error) {
        // Log the real error server-side only — never leak internals
        // (stack traces, DB details) to the caller of a public endpoint.
        console.error("Failed to fetch event by slug:", error);
        return NextResponse.json(
            { message: "Failed to fetch event" },
            { status: 500 }
        );
    }
}
