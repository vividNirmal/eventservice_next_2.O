import EventImageList from "@/components/page/imageModule/EventImageList";
import React from "react";

export default async function EventImageManagementPage({ params }) {
  const { id } = await params;
  return <EventImageList eventId={id} />;
}

export const metadata = {
  title: 'Event Images - Event Dashboard',
  description: 'Manage event images for this event',
};