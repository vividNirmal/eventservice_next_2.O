"use client";
import { useTheme } from '@/contexts/ThemeContext';
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import Header from "@/components/header";
import ThemeSelector from "@/components/ThemeSelector";

export default function HeaderBar() {
  const { getThemeConfig, userEmail } = useTheme();
  const themeConfig = getThemeConfig();
  
  // Determine if sidebar should be visible based on theme
  const hasSidebar = themeConfig?.hasSidebar ?? true;
  
  // Only show theme selector for admin@gmail.com
  const showThemeSelector = userEmail === 'admin@gmail.com';

  return (
    <header className="flex shrink-0 items-center gap-2 rounded-2xl bg-white border border-solid border-gray-200 shadow-[0_0px_6px_0_rgba(0,0,0,0.07)] transition-[width,height] ease-linear themed-header">
      <div className="flex items-center gap-2 px-4 w-full">
        {/* Only show sidebar trigger if theme has sidebar */}
        {hasSidebar && (
          <>
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
          </>
        )}
        
        {/* Existing Header component */}
        <Header />
        
        {/* Theme selector for admin users */}
        {/* {showThemeSelector && (
          <div className="ml-auto">
            <ThemeSelector />
          </div>
        )} */}
      </div>
    </header>
  );
}