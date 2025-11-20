import LayoutClientWrapper from "@/components/common/layoutClientWrapper";
import Homepage from "@/components/page/homePage/page";
import { redirect } from "next/navigation";

export default async function Home() {
  // Redirect to login page for root domain access
  // redirect("/dashboard/login");

  return (
    <LayoutClientWrapper>
      <Homepage />
    </LayoutClientWrapper>
  );
}
