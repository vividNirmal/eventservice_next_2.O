import FormManagement from "@/components/page/formManagement/FormManagement";
import React from "react";

export default async function EventFormManagement({ params }) {
  const { id } = await params;
  return <FormManagement eventId={id} />;
}

export const metadata = {
  title: 'Form Management - Event Dashboard',
  description: 'Manage registration forms for this event',
};