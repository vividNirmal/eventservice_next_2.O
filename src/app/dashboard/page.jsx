"use client";
import { AppSidebar } from "@/components/app-sidebar";
import { Breadcrumbs } from "@/components/breadcrumb";
import Header from "@/components/header";
import DashboardPage from "@/components/page/dashboard/dashboardPage";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Loader2 } from "lucide-react";
import { Suspense, useState, useEffect } from "react";
import StaticNavigation from "@/components/page/eventHost/StaticNavigation";
import { ThemeProvider } from "@/contexts/ThemeContext";
import ThemedWrapper from "@/components/ThemedWrapper";
import HeaderBar from "@/components/header-bar";

export default function Page() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get user data from localStorage
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem('loginuser');
      if (userData) {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
      }
      setIsLoading(false);
    }
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // If user is superadmin, show AppSidebar, otherwise show StaticNavigation
  const isSuperAdmin = user?.role === "superadmin";

  // Simple HeaderBar component for admin users (without sidebar functionality)
  const SimpleHeaderBar = () => (
    <header className="flex shrink-0 items-center gap-2 rounded-2xl bg-white border border-solid border-gray-200 shadow-[0_0px_6px_0_rgba(0,0,0,0.07)] transition-[width,height] ease-linear themed-header">
      <div className="flex items-center gap-2 px-4 w-full">
        <Header />
      </div>
    </header>
  );

  return (
    <Suspense fallback={<Loader2 />}>
      <ThemeProvider>
        <ThemedWrapper>
          {isSuperAdmin ? (
            // SuperAdmin Layout with AppSidebar
            <SidebarProvider className={"bg-[#f7f7f7]"}>
              <AppSidebar />
              <SidebarInset className={"bg-transparent gap-3 2xl:gap-5"}>
                <HeaderBar />
                <div className="flex flex-1 flex-col space-y-4 p-4 2xl:p-5 bg-white rounded-2xl border border-solid border-gray-200 shadow-[0_0px_6px_0_rgba(0,0,0,0.07)]">
                  <Breadcrumbs />
                  <DashboardPage />
                </div>
              </SidebarInset>
            </SidebarProvider>
          ) : (
            // Admin Layout with StaticNavigation
            <div className="flex h-screen bg-gray-50">
              <StaticNavigation />
              <div className="flex-1 flex flex-col overflow-hidden">
                <SimpleHeaderBar />
                <div className="flex-1 overflow-auto p-4 xl:p-6">
                  <div className="bg-white rounded-2xl border border-solid border-gray-200 shadow-[0_0px_6px_0_rgba(0,0,0,0.07)] p-4 xl:p-6 h-full themed-content">
                    <Breadcrumbs />
                    <DashboardPage />
                  </div>
                </div>
              </div>
            </div>
          )}
        </ThemedWrapper>
      </ThemeProvider>      
    </Suspense>
  );
}
