import EventCompanyTeamList from "@/components/page/EventUsersPages/DirectoryModule/Exhibitor/EventCompanyTeamList";
import React from "react";

export default async function CompanyTeamPage({ params }) {
  const { id } = await params;
  return <EventCompanyTeamList />;
}

export const metadata = {
  title: 'Company Teams - Exhibitor Dashboard',
  description: 'Manage company teams for exhibitor',
};
