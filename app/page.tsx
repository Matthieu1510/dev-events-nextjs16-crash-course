import ExploreBtn from "@/components/ExploreBtn";
import EventCard from "@/components/EventCard";
import {IEvent} from "@/database/event.model";
import {cacheLife} from "next/cache";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

if (!BASE_URL) {
    throw new Error(
        "Missing NEXT_PUBLIC_BASE_URL environment variable. Add it to your .env.local file."
    );
}

const Page = async () => {
    'use cache';
    cacheLife('hours')
    const response = await fetch(`${BASE_URL}/api/events`);

    // Don't hard-crash the whole homepage over a failed events fetch (e.g.
    // the very first production build, before any deployment is live yet
    // to answer this same-origin call) — log it server-side and render an
    // empty list instead, matching the reference implementation's
    // graceful-degradation behavior.
    let events: IEvent[] = [];
    if (response.ok) {
        ({events} = await response.json());
    } else {
        console.error(`Failed to fetch events: ${response.status} ${response.statusText}`);
    }
    return (
        <section>
            <h1 className="text-center">The Hub for Every Dev <br /> Event You Can&apos;t Miss</h1>
            <p className="text-center mt-5">Hackathons, Meetups, and Conferences, All in One Place</p>
            <ExploreBtn />

            <div className="mt-20 space-y-7">
                <h3> Featured Events</h3>
                <ul className="events">
                    {events && events.length > 0 && events.map((event: IEvent) => (
                        <li key={event.slug}>
                            <EventCard {...event} />
                        </li>
                    ))}
                </ul>
            </div>

        </section>

    )
}
export default Page
