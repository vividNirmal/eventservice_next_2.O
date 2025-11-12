import EventFormList from "@/components/page/EventUsersPages/EventList/EventFormList";
import React from "react";

export default async function page({params}) {
  const { id } = await params;
  return <EventFormList id={id}/>;
}
