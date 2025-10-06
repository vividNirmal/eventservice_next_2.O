import UserSmsTemplateManagement from "@/components/page/userTemplateManagement/sms/UserSmsTemplateManagement";
import React from "react";

export default async function UserEmailTemplateManagementPage({ params }) {
  const { id } = await params;
  return <UserSmsTemplateManagement eventId={id} />;
}

export const metadata = {
  title: 'SMS Template Management - Event Dashboard',
  description: 'Manage SMS templates for this event',
};