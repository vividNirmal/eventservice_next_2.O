import UserTypeList from "@/components/page/userType/UserTypeList";
import React from "react";

export default async function UserTypeListPage({ params }) {
  const { id } = await params;
  return <UserTypeList eventId={id} />;
}

export const metadata = {
  title: 'Email Template Management - Event Dashboard',
  description: 'Manage email templates for this event',
};