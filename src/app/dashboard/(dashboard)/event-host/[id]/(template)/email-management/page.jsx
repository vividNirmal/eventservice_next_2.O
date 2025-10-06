import UserEmailTemplateManagement from "@/components/page/userTemplateManagement/email/UserEmailTemplateManagement";
import React from "react";

export default async function UserEmailTemplateManagementPage({ params }) {
  const { id } = await params;
  return <UserEmailTemplateManagement eventId={id} />;
}

export const metadata = {
  title: 'Email Template Management - Event Dashboard',
  description: 'Manage email templates for this event',
};