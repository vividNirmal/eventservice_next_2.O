import React from "react";
import EventDetails from "@/components/page/homePage/eventdetails/EventDetails";
export default function page({params}) {
  return <EventDetails evenId={params.id} />;
}
