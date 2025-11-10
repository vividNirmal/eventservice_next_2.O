import ExhibitorFormList from "@/components/page/exhibitorFormManagement/ExhibitorFormList";
import React from "react";

export default async function ExibitorFormManagementPage({ params }) {
  const { id } = await params;
  return <ExhibitorFormList eventId={id} />;
}

export const metadata = {
  title: 'Exibitor Form Management - Event Dashboard',
  description: 'Manage exhibitor forms for this event',
};