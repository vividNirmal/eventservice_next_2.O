import ExhibitorApplicationForm from "@/components/page/EventUsersPages/EventList/ExhibitorApplicationForm";
import React from "react";

export default async function ExhibitorApplicationFormPage({params}) {
  const { id } = await params;
  return <ExhibitorApplicationForm formId={id}/>;
}