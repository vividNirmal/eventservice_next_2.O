import CreateUserTemplate from "@/components/page/userTemplateManagement/common/CreateUserTemplate";
import React from "react";

export default async function UpdateUserWhatsappTemplatePage({ params }) {
  const { id, templateId } = await params;
  return <CreateUserTemplate eventId={id} templateId={templateId} templateType="whatsapp" />;
}

export const metadata = {
  title: 'Whatsapp Template Management - Event Dashboard',
  description: 'Manage Whatsapp template',
};