import EventHostDetailsPage from "@/components/page/eventHost/eventHostDetailsPage";
import React from "react";

export default async function EventHostDetails({ params }) {
  const { id } = await params;
  return <EventHostDetailsPage eventId={id} />;
}

export const metadata = {
  title: 'Event Details - Admin Dashboard',
  description: 'View detailed information about the event',
};
