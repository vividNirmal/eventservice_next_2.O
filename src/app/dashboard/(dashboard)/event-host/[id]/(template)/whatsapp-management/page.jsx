import UserWhatsappTemplateManagement from "@/components/page/userTemplateManagement/whatsapp/UserWhatsappTemplateManagement";
import React from "react";

export default async function UserWhatsappTemplateManagementPage({ params }) {
  const { id } = await params;
  return <UserWhatsappTemplateManagement eventId={id} />;
}

export const metadata = {
  title: 'WhatsApp Template Management - Event Dashboard',
  description: 'Manage WhatsApp templates for this event',
};