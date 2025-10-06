import CreateUserTemplate from "@/components/page/userTemplateManagement/common/CreateUserTemplate";
import React from "react";

export default async function UpdateUserEmailTemplatePage({ params }) {
  const { id, templateId } = await params;
  return <CreateUserTemplate eventId={id} templateId={templateId} templateType="email" />;
}

export const metadata = {
  title: 'Email Template Management - Event Dashboard',
  description: 'Manage email template',
};