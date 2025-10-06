import CreateUserTemplate from "@/components/page/userTemplateManagement/common/CreateUserTemplate";
import React from "react";

export default async function CreateUserSmsTemplatePage({ params }) {
  const { id } = await params;
  return <CreateUserTemplate eventId={id} templateType="sms" />;
}

export const metadata = {
  title: 'SMS Template Management - Event Dashboard',
  description: 'Manage SMS template',
};