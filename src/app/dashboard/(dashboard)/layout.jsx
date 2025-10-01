"use client";
// src/app/admin/(admin)/layout.jsx
import { Suspense, useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import StaticNavigation from "@/components/page/eventHost/StaticNavigation";
import { Separator } from "@/components/ui/separator";
import Header from "@/components/header";
import { ThemeProvider } from "@/contexts/ThemeContext";
import ThemedWrapper from "@/components/ThemedWrapper";
import HeaderBar from "@/components/header-bar";
import { usePathname } from "next/navigation";

export default function RootLayout({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    // Get user data from localStorage
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem('loginuser');
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

  // If user is superadmin, show AppSidebar, otherwise show StaticNavigation conditionally
  const isSuperAdmin = user?.role === "superadmin";
  
  // Check if we're on the event list page (should not show sidebar)
  const isEventListPage = pathname === "/dashboard/event-host";
  
  // Check if we're on an event detail page (should show sidebar with event context)
  const isEventDetailPage = pathname?.startsWith("/dashboard/event-host/") && pathname !== "/dashboard/event-host";
  
  // Extract eventId from pathname if on event detail page
  const eventId = isEventDetailPage ? pathname.split("/dashboard/event-host/")[1] : null;

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
            <SidebarProvider>
              <AppSidebar />
              <SidebarInset className={'bg-transparent gap-5'}>
                <HeaderBar />
                <div className="flex flex-col flex-1 space-y-4 p-4 xl:p-6 bg-white rounded-2xl border border-solid border-gray-200 shadow-[0_0px_6px_0_rgba(0,0,0,0.07)] min-h-0 overflow-auto themed-content">
                  {children}
                </div>
              </SidebarInset>
            </SidebarProvider>
          ) : (
            // Admin Layout - conditionally show StaticNavigation based on page
            <>
              {isEventListPage ? (
                // Event List Page - No Sidebar
                <div className="flex flex-col h-screen bg-gray-50">
                  <SimpleHeaderBar />
                  <div className="flex-1 overflow-auto p-4 xl:p-6">
                    <div className="bg-white rounded-2xl border border-solid border-gray-200 shadow-[0_0px_6px_0_rgba(0,0,0,0.07)] p-4 xl:p-6 min-h-0 themed-content">
                      {children}
                    </div>
                  </div>
                </div>
              ) : isEventDetailPage ? (
                // Event Detail Page - With StaticNavigation and eventId context
                <div className="flex h-screen bg-gray-50">
                  <StaticNavigation eventId={eventId} />
                  <div className="flex-1 flex flex-col overflow-hidden">
                    <SimpleHeaderBar />
                    <div className="flex-1 overflow-auto p-4 xl:p-6">
                      {children}
                    </div>
                  </div>
                </div>
              ) : (
                // Other Admin Pages - Default Layout with StaticNavigation
                <div className="flex h-screen bg-gray-50">
                  <StaticNavigation />
                  <div className="flex-1 flex flex-col overflow-hidden">
                    <SimpleHeaderBar />
                    <div className="flex-1 overflow-auto p-4 xl:p-6">
                      <div className="bg-white rounded-2xl border border-solid border-gray-200 shadow-[0_0px_6px_0_rgba(0,0,0,0.07)] p-4 xl:p-6 min-h-0 themed-content">
                        {children}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </ThemedWrapper>
      </ThemeProvider>      
    </Suspense>
  );
}
