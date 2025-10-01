import DashboardPage from "@/components/page/dashboard/dashboardPage";
import DynamicTitle from "@/components/DynamicTitle";

export default async function Dashboard() {
  return (
    <>
      <DynamicTitle pageTitle="Dashboard" />
      <DashboardPage />
    </>
  );
}