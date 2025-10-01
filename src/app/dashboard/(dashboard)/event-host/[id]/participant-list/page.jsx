import ParticipantUserListPage from "@/components/page/participantUser/participantUserListPage";
import React from "react";

export default async function EventParticipantList({ params }) {
  const { id } = await params;
  return <ParticipantUserListPage eventId={id} />;
}

export const metadata = {
  title: 'Participant List - Event Dashboard',
  description: 'View registered participants for this event',
};