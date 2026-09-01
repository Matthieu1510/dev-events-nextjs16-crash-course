export interface Event {
    slug: string;
    title: string;
    image: string;
    description: string;
    category: "Conference" | "Hackathon" | "Meetup";
    location: string;
    date: string;
    time: string;
}

// Donnees d'exemple realistes (vraies conferences/hackathons a venir), a
// utiliser telles quelles avec <EventCard {...event} /> (title + image
// suffisent pour EventCard aujourd'hui ; les autres champs serviront pour
// la page de detail / le filtrage plus tard dans le cours).
export const events: Event[] = [
    {
        slug: "react-summit-2026",
        title: "React Summit 2026",
        image: "/images/event1.png",
        description:
            "The biggest React conference worldwide, bringing together the community for a week of talks and workshops on React, React Native, and the ecosystem around them.",
        category: "Conference",
        location: "Amsterdam, Netherlands",
        date: "June 11-16, 2026",
        time: "9:00 AM",
    },
    {
        slug: "jsnation-2026",
        title: "JSNation 2026",
        image: "/images/event2.png",
        description:
            "A conference for JavaScript and Node.js developers covering the latest in frontend tooling, runtimes, and web performance.",
        category: "Conference",
        location: "Amsterdam, Netherlands",
        date: "June 11-15, 2026",
        time: "9:00 AM",
    },
    {
        slug: "github-universe-2026",
        title: "GitHub Universe 2026",
        image: "/images/event3.png",
        description:
            "GitHub's flagship conference for developers, with announcements on AI-assisted development, DevOps, and the future of collaborative coding.",
        category: "Conference",
        location: "Fort Mason Center, San Francisco, CA",
        date: "October 28-29, 2026",
        time: "9:00 AM",
    },
    {
        slug: "aws-reinvent-2026",
        title: "AWS re:Invent 2026",
        image: "/images/event4.png",
        description:
            "AWS's annual cloud computing conference, featuring keynotes, hands-on workshops, and hundreds of technical sessions across the Las Vegas Strip.",
        category: "Conference",
        location: "Las Vegas, NV",
        date: "November 30 - December 4, 2026",
        time: "8:00 AM",
    },
    {
        slug: "nasa-space-apps-challenge-2026",
        title: "NASA International Space Apps Challenge 2026",
        image: "/images/event5.png",
        description:
            "A global hackathon where teams use NASA's open data to build solutions to real-world challenges on Earth and in space, hosted simultaneously in cities worldwide.",
        category: "Hackathon",
        location: "Global (local venues worldwide)",
        date: "November 14-15, 2026",
        time: "9:00 AM",
    },
    {
        slug: "hack-the-north-2026",
        title: "Hack the North 2026",
        image: "/images/event6.png",
        description:
            "Canada's largest hackathon, bringing hundreds of student hackers together at the University of Waterloo for 36 hours of building, mentorship, and demos.",
        category: "Hackathon",
        location: "University of Waterloo, Waterloo, ON",
        date: "September 11-13, 2026",
        time: "6:00 PM",
    },
];
