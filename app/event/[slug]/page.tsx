import {Suspense} from "react";
import EventDetails from "@/components/EventDetails";

// This page intentionally does NOT `await params` and has no 'use cache'
// of its own: those belong to EventDetails. Awaiting params here (a
// dynamic route segment) counts as reading "runtime data" outside of
// <Suspense>, which blocks the whole route from being prerendered
// (Next.js error E1427 / blocking-prerender-runtime). Passing the
// still-pending promise down and wrapping the data-fetching child in
// <Suspense> keeps this wrapper static while EventDetails does its own
// cached, per-slug rendering.
const EventDetailsPage = async ({ params }: { params: Promise<{ slug: string }>}) => {
    const slug = params.then((p) => p.slug);

    return (
        <Suspense fallback={<div>Loading...</div>}>
            <EventDetails params={slug} />
        </Suspense>
    )
}
export default EventDetailsPage
