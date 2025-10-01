import { TicketManagement } from "@/components/page/ticketManagement";
import React from "react";

export default async function EventTicketManagement({ params }) {
  const { id } = await params;
  return <TicketManagement eventId={id} />;
}

export const metadata = {
  title: 'Ticket Management - Event Dashboard',
  description: 'Manage tickets for this event',
};