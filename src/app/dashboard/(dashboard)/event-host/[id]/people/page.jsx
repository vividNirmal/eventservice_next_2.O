"use client";
import React from "react";
import { useParams } from "next/navigation";
import PeoplePage from "@/components/page/eventHost/PeoplePage";

export default function EventPeoplePage() {
  const params = useParams();
  const eventId = params?.id; // Note: using 'id' instead of 'eventId' to match existing structure

  return (
    <div className="container mx-auto p-6">
      <PeoplePage eventId={eventId} id={eventId} />
    </div>
  );
}