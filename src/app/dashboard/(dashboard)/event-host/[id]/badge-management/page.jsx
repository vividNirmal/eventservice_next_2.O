import BadgeManagement from "@/components/page/badgeManagement/BadgeManagement";
import React from "react";

export default async function BadgeManagementPage({ params }) {
  const { id } = await params;
  return <BadgeManagement eventId={id} />;
}

export const metadata = {
  title: 'Badge Management - Event Dashboard',
  description: 'Manage badges for this event',
};