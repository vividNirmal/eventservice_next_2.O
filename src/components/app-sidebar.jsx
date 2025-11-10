"use client";
import { useState } from "react";
import { usePathname } from "next/navigation";
import {
  Building,
  FileText,
  HomeIcon,
  QrCode,
  Shapes,
  SquareTerminal,
  TicketsIcon,
  Users,
  CalendarDays,
  Ticket,
  FolderMinusIcon,
  LayoutTemplate,
  HandPlatter,
} from "lucide-react";

import { NavMain } from "@/components/nav-main";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { useEffect } from "react";
import { useTheme } from "@/contexts/ThemeContext";

// This is sample data.

export function AppSidebar({ ...props }) {
  const pathname = usePathname();
  const [user, setUser] = useState();
  useEffect(() => {
    setUser(JSON.parse(localStorage.getItem("loginuser")));
  }, []);
  const { currentTheme, getThemeConfig } = useTheme();
  const themeConfig = getThemeConfig();

  // Hide sidebar if current theme doesn't have one
  if (!themeConfig?.hasSidebar) {
    return null;
  }

  const data = {
    user: {
      name: "shadcn",
      email: "m@example.com",
      avatar: "/avatars/shadcn.jpg",
    },
    navMain: [
      {
        title: "Event Host",
        icon: CalendarDays,
        url: "/dashboard/event-host",
        show: true,
      },
      {
        title: "Dashboard",
        icon: HomeIcon,
        url: "/dashboard",
        show: true,
      },
      {
        title: "Registered Event List",
        icon: TicketsIcon,
        url: "/dashboard/events-list",
        show: true,
      },
      {
        title: "User List",
        icon: Users,
        url: "/dashboard/user-list",
        show: true,
      },
      {
        title: "Event Company List",
        icon: Building,
        url: "/dashboard/event-company-list",
        show: user?.role == "superadmin" ? true : false,
      },
      {
        title: "Scanner Machine List",
        icon: QrCode,
        url: "/dashboard/scanner-machine-list",
        show: user?.role == "superadmin" ? true : false,
      },
      {
        title: "Blog List",
        icon: Shapes,
        url: "/dashboard/blog-list",
        show: true,
      },
      {
        title: "Participant User",
        icon: SquareTerminal,
        url: "/dashboard/participant-list",
        show: true,
      },
      {
        title: "Directory",
        icon: FileText,
        items: [
          { title: "Manage Compay", url: "/dashboard/adminCompany-list" },
          { title: "company Team", url: "/dashboard/company_teams" },
        ],
        show: user?.role == "admin" ? true : false,
      },
      {
        title: "Setting",
        icon: SquareTerminal,
        url: "/dashboard/setting",
        show: true,
      },
      {
        title: "Form Settings",
        icon: FileText,
        items: [
          { title: "Default Fields", url: "/dashboard/default-fields" },
          { title: "User Types", url: "/dashboard/user-types" },
          { title: "Field Constants", url: "/dashboard/field-constant" },
        ],
        show: true,        
      },
      {
        title: "Template",
        icon: LayoutTemplate,
        items: [
          { title: "Email", url: "/dashboard/email-template-management" },
          { title: "SMS", url: "/dashboard/sms-template-management" },
          { title: "Whatsapp", url: "/dashboard/whatsapp-template-management" },
        ],
        show: true,
      },
      {
        title: "Exhibitor Settings",
        icon: HandPlatter,
        items: [
          { title: "Exhibitor Form Configurations", url: "/dashboard/exhibitor-form-configurations" },
        ],
        show: true,
      },
    ],
  };

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="py-4">
        <h1 className="text-2xl xl:text-3xl font-bold text-center text-primary truncate">
          Event Service
        </h1>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} pathname={pathname} />
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
