import ExhibitorApplicationList from "@/components/page/exhibitorFormApplication/ExhibitorFormApplicationList";
import React from "react";

export default async function ExhibitorFormApplicationListPage({ params }) {
  const { id, formId } = await params;
  return <ExhibitorApplicationList eventId={id} exhibitorFormId={formId} />;
}

export const metadata = {
  title: 'Exhibitor Form Applications - Event Dashboard',
  description: 'Manage exhibitor form applications',
};
