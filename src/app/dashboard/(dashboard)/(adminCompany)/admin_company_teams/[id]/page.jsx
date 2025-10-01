import AdminCompanyTeamsPage from "@/components/page/adminCompany/adminCompanyTeamsPage";

export default async function AdminCompanyTeams({params}) {
  const { id } = await params;
  return <AdminCompanyTeamsPage id={id} />;
}