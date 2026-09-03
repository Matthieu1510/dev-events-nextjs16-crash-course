'use client';

import Link from "next/link";
import Image from "next/image";
import posthog from "posthog-js";

const isPostHogConfigured = Boolean(
    process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN && process.env.NEXT_PUBLIC_POSTHOG_HOST
);

interface Props {
    title: string;
    image: string;
    slug: string;
    location: string;
    date: string;
    time: string;
}

const EventCard = ({title, image, slug, location, date, time}: Props) => {
    const handleEventSelection = () => {
        if (isPostHogConfigured) {
            posthog.capture("event_selected", { event_slug: slug });
        }
    };

    return (
        <Link href={`/event/${slug}`} id="event-card" onClick={handleEventSelection}>
            <div className="poster-wrapper">
                <Image
                    src={image}
                    alt={title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover"
                />
            </div>
            <div className="flex flex-row gap-2">
                <Image src="/icons/pin.svg" alt="location" width={14} height={14} className="w-[14px] h-[14px]" />
                <p>{location}</p>
            </div>
            <p className="title">{title}</p>
            <div className="datetime">
                <div>
                    <Image src="/icons/calendar.svg" alt="date" width={14} height={14} className="w-[14px] h-[14px]" />
                    <p>{date}</p>
                </div>
                <div>
                    <Image src="/icons/clock.svg" alt="time" width={14} height={14} className="w-[14px] h-[14px]" />
                    <p>{time}</p>
                </div>
            </div>
        </Link>
    )
}
export default EventCard
