import {NextRequest, NextResponse} from "next/server";
import {v2 as cloudinary} from 'cloudinary';

import connectDB from "@/lib/mongodb";
import Event from '@/database/event.model';

// Fields stored as string arrays on the Event model. A client may send
// these as a JSON-stringified array (e.g. '["Cloud","DevOps"]'), plain
// comma/newline-separated text, or several form fields sharing one name.
const ARRAY_FIELDS = ['agenda', 'tags'] as const;

function parseArrayField(formData: FormData, field: string): string[] {
    const values = formData.getAll(field).map(String);

    // Several form fields with the same name (e.g. multiple "tags" rows).
    // Object.fromEntries() would silently keep only the last one, so this
    // has to be read separately via getAll().
    if (values.length > 1) {
        return values.map((v) => v.trim()).filter(Boolean);
    }

    const raw = values[0]?.trim();
    if (!raw) return [];

    // A single field holding a JSON array, e.g. '["Cloud", "DevOps"]'.
    if (raw.startsWith('[')) {
        try {
            const parsed: unknown = JSON.parse(raw);
            if (Array.isArray(parsed)) {
                return parsed.map((v) => String(v).trim()).filter(Boolean);
            }
        } catch {
            // Not valid JSON — fall through to plain-text splitting below.
        }
    }

    // Plain text: one item per line, or comma-separated.
    return raw.split(/\r?\n|,/).map((v) => v.trim()).filter(Boolean);
}

export async function POST(req: NextRequest) {
    try {
        await connectDB();
        const formData = await req.formData();
        let event: Record<string, unknown>;
        try {
            event = Object.fromEntries(formData.entries());
        } catch {
            return NextResponse.json({message: 'Invalid JSON Data format'}, {status: 400})
        }

        // Replace the raw string value Object.fromEntries() produced for
        // each array field with a properly parsed string[].
        for (const field of ARRAY_FIELDS) {
            event[field] = parseArrayField(formData, field);
        }

        const file = formData.get('image') as File;
        if (!file) {
            return NextResponse.json({message: 'Image file is required'}, {status: 400});
        }

        let tags = JSON.parse(formData.get('tags') as string);
        let agenda = JSON.parse(formData.get('agenda') as string);

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const uploadResult = await new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream({resource_type: 'image', folder: 'DevEvent'}, (error, results) => {
                if (error) return reject(error);
                resolve(results);
            }).end(buffer);
        });

        event.image = (uploadResult as {secure_url: string}).secure_url;

        const createdEvent = await Event.create({
            ...event,
            tags: tags,
            agenda: agenda,
        });
        return NextResponse.json({message: 'Event created successfully', event: createdEvent}, {status: 201});

    } catch (e) {
        // Log the real error server-side only — never leak internals
        // (stack traces, DB details) to the caller of a public endpoint.
        console.error('Event creation failed:', e);
        return NextResponse.json({message: 'Event Creation Failed'}, {status: 500})
    }
}

export async function GET() {
    try {
        await connectDB();
        const events = await Event.find().sort({ createdAt: -1 });
        return NextResponse.json({message: 'Event fetched successfully', events}, {status: 200});
    } catch (e) {
        console.error('Failed to fetch event:', e);
        return NextResponse.json({message: 'Event fetching failed'}, {status: 500});
    }
}
