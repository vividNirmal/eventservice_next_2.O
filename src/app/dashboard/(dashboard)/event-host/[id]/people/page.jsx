"use client";
import React from "react";
import { useParams } from "next/navigation";
import PeoplePage from "@/components/page/eventHost/PeoplePage";
import RegistrationManagement from "@/components/page/formPeople/RegistrationManagement";

export default function EventPeoplePage() {
  const params = useParams();
  const eventId = params?.id; // Note: using 'id' instead of 'eventId' to match existing structure

  return (
    <div className="">
      <RegistrationManagement eventId={eventId} />
    </div>
  );
}