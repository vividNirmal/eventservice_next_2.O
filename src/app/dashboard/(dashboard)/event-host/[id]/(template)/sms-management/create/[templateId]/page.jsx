import CreateUserTemplate from "@/components/page/userTemplateManagement/common/CreateUserTemplate";
import React from "react";

export default async function UpdateUserSmsTemplatePage({ params }) {
  const { id, templateId } = await params;
  return <CreateUserTemplate eventId={id} templateId={templateId} templateType="sms" />;
}

export const metadata = {
  title: 'SMS Template Management - Event Dashboard',
  description: 'Manage SMS template',
};