'use client';

import React, {useState} from "react";
import {createBooking} from "@/lib/actions/booking.actions";
import posthog from "posthog-js";

const BookEvent = ({ eventId, slug}: {eventId: string, slug: string}) => {
    const [email, setEmail] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState('');
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        const { success } = await createBooking({eventId, slug, email});
        if(success) {
            setSubmitted(true);
            posthog.capture('event_booked', {eventId, slug, email});
        } else {
            console.error('Error creating booking event');
            posthog.captureException('Booking Creation failed');
            setError("Something went wrong — this email may already be booked for this event. Please try again.");
        }
    }
    return (
        <div id="book-event">
            {submitted ? (
                <p className="text-sm">Thank you for signing up!</p>
            ): (
                <form onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="email">Email Address</label>
                        <input type="email"
                               value={email}
                               onChange={(e) => setEmail(e.target.value)}
                               id="email"
                               placeholder="Enter your email address"
                        />
                        <button type="submit" className="button-submit">Submit</button>
                        {error && <p className="text-sm">{error}</p>}
                    </div>
                </form>
            )}
        </div>
    )
}
export default BookEvent
