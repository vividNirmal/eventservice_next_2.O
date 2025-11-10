import ExhibitorFormParticularList from "@/components/page/exhibitorFormParticular/ExhibitorFormParticularList";
import React from "react";

export default async function ExhibitorFormParticularListPage({ params }) {
  const { id, formId } = await params;
  return <ExhibitorFormParticularList eventId={id} exhibitorFormId={formId} />;
}

export const metadata = {
  title: 'Exhibitor Form Particulars - Event Dashboard',
  description: 'Manage exhibitor form particulars',
};
