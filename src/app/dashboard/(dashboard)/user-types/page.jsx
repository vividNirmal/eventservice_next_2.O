import UserTypeList from "@/components/page/userType/UserTypeList";
import React from "react";

export default async function UserTypeListPage() {
  return <UserTypeList />;
}

export const metadata = {
  title: 'User Type Management - Event Dashboard',
  description: 'Manage user types for this event',
};