"use client";
import { Suspense, useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import {
  SidebarInset,
  SidebarProvider,  
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import StaticNavigation from "@/components/page/eventHost/StaticNavigation";
import Header from "@/components/header";
import { ThemeProvider } from "@/contexts/ThemeContext";
import ThemedWrapper from "@/components/ThemedWrapper";
import { CompanyImageProvider } from "@/contexts/CompanyImageContext";
import HeaderBar from "@/components/header-bar";
import { usePathname } from "next/navigation";
import HeaderEventuser from "@/components/page/EventUsersPages/HeaderEventuser";
import EventAdminNavigation from "@/components/page/eventHost/eventAdminNavigation";

export default function RootLayout({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    // Get user data from localStorage
    if (typeof window !== "undefined") {
      const userData = localStorage.getItem("loginuser");
      if (userData) {
        setUser(JSON.parse(userData));
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

  const isSuperAdmin = user?.role === "superadmin";

  const isEventDetailPage =
    pathname?.startsWith("/dashboard/event-host/") &&
    pathname !== "/dashboard/event-host";
  
  const eventId = isEventDetailPage
    ? pathname.split("/dashboard/event-host/")[1]
    : null;
  
  const SimpleHeaderBar = () => (
    <header className="flex shrink-0 items-center gap-2 rounded-0 bg-white border border-solid border-gray-200 shadow-[0_0px_6px_0_rgba(0,0,0,0.07)] transition-[width,height] ease-linear themed-header">
      <div className="flex items-center gap-2 px-4 w-full">
        <Header />
      </div>
    </header>
  );

  function ConditionHeder() {    
    if (pathname?.startsWith("/dashboard/eventuser")) {
      return (
        <div className="flex flex-col h-screen bg-[#F5F6FA]">
          <HeaderEventuser />
          <div className="flex-1 flex flex-col overflow-auto custom-scroll px-4 pb-4 relative pt-36 z-20">
            <div className="max-w-full w-full rounded-b-2xl overflow-hidden fixed top-0 left-0 z-10">
              {/* <img src="/music-banner.webp" className="max-w-full w-full h-64 2xl:h-72 object-cover" alt="banner image" /> */}
            </div>
            {children}
          </div>
        </div>
      );
    }
    
    // Check for exact /dashboard/event-host path (event list page)
    if (pathname === "/dashboard/event-host" && user.role !== 'admin') {
      return (
        <div className="flex flex-col h-screen bg-gray-50">
          <SimpleHeaderBar />
          <div className="flex flex-col grow overflow-auto p-4 xl:p-6">
            <div className="bg-white rounded-2xl border border-solid border-gray-200 shadow-[0_0px_6px_0_rgba(0,0,0,0.07)] p-4 xl:p-6 min-h-0 themed-content">
              {children}
            </div>
          </div>
        </div>
      );
    }

    if (pathname === "/dashboard/event-host" && user.role == 'admin' || pathname === "/dashboard/package" || pathname === "/dashboard/company-banner" || pathname === "/dashboard/user-list") {
      return (
        <div className="flex h-screen bg-gray-50">
          <EventAdminNavigation  />
          <div className="flex-1 flex flex-col overflow-hidden">
            <SimpleHeaderBar />
            <div className="flex flex-col grow overflow-auto p-4 xl:p-6">{children}</div>
          </div>
        </div>
      );
    }

    // Check for event detail pages (like /dashboard/event-host/123)
    if (pathname?.startsWith("/dashboard/event-host/")) {
      return (
        <div className="flex h-screen bg-gray-50">
          <StaticNavigation eventId={eventId} />
          <div className="flex-1 flex flex-col overflow-hidden">
            <SimpleHeaderBar />
            <div className="flex flex-col grow overflow-auto p-4 xl:p-6">{children}</div>
          </div>
        </div>
      );
    }
    
    // Default layout for other pages
    return (
      <div className="flex h-screen bg-gray-50">
        <StaticNavigation eventId={eventId} />
        <div className="flex-1 flex flex-col overflow-hidden">
          <SimpleHeaderBar />
          <div className="flex flex-col grow overflow-auto p-4 xl:p-6">{children}</div>
        </div>
      </div>
    );
  }

  return (
    <Suspense fallback={<Loader2 />}>
      <ThemeProvider>
        <ThemedWrapper>
          {/* COMPANY IMAGE PROVIDER */}
          <CompanyImageProvider>
            {isSuperAdmin ? (
              // SuperAdmin Layout with AppSidebar
              <SidebarProvider>
                <AppSidebar />
                <SidebarInset className={"bg-transparent gap-5"}>
                  <HeaderBar />
                  <div className="flex flex-col flex-1 space-y-4 p-4 xl:p-6 bg-white rounded-2xl border border-solid border-gray-200 shadow-[0_0px_6px_0_rgba(0,0,0,0.07)] min-h-0 overflow-auto themed-content">
                    {children}
                  </div>
                </SidebarInset>
              </SidebarProvider>
            ) : (
            // Admin Layout
              <>{ConditionHeder()}</>
            )}
          </CompanyImageProvider>
        </ThemedWrapper>
      </ThemeProvider>
    </Suspense>
  );
}