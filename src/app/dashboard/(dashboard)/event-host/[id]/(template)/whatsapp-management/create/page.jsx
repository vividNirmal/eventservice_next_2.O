import CreateUserTemplate from "@/components/page/userTemplateManagement/common/CreateUserTemplate";
import React from "react";

export default async function CreateUserSmsTemplatePage({ params }) {
  const { id } = await params;
  return <CreateUserTemplate eventId={id} templateType="whatsapp" />;
}

export const metadata = {
  title: 'Whatsapp Template Management - Event Dashboard',
  description: 'Manage Whatsapp template',
};