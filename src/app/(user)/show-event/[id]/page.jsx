import EventListByshow from "@/components/page/homePage/eventdetails/EventListbyShow";

import React from "react";
export default function page({params}) {
    // id={params.id}
  return <EventListByshow evenId={params.id} />;
}
