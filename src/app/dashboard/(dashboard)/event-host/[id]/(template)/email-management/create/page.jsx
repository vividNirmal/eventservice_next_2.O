import CreateUserTemplate from "@/components/page/userTemplateManagement/common/CreateUserTemplate";
import React from "react";

export default async function CreateUserEmailTemplatePage({ params }) {
  const { id } = await params;
  return <CreateUserTemplate eventId={id} templateType="email" />;
}

export const metadata = {
  title: 'Email Template Management - Event Dashboard',
  description: 'Manage email template',
};