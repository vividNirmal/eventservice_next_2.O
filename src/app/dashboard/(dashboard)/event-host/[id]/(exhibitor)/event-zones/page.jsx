import EventZoneList from "@/components/page/eventZones/EventZoneList";
import React from "react";

export default async function ExibitorFormManagementPage({ params }) {
  const { id } = await params;
  return <EventZoneList eventId={id} />;
}

export const metadata = {
  title: 'Event Zone Management - Event Dashboard',
  description: 'Manage event zones for this event',
};