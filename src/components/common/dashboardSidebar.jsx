"use client";
import * as React from "react";
import Link from "next/link";
import {
  AudioWaveform,
  Building,
  ChevronRight,
  Command,
  FileText,
  GalleryVerticalEnd,
  QrCode,
  Shapes,
  SquareTerminal,
  Users,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "Acme Inc",
      logo: GalleryVerticalEnd,
      plan: "Enterprise",
    },
    {
      name: "Acme Corp.",
      logo: AudioWaveform,
      plan: "Startup",
    },
    {
      name: "Evil Corp.",
      logo: Command,
      plan: "Free",
    },
  ],
  navMain: [
    {
      title: "Registered Event List",
      icon: FileText,
      children: [
        { title: "Registered Event", url: "/dashboard/registered-event-list" },        
      ],
    },
    {
      title: "User List",
      // url: "/admin/user-list",
      icon: Users,
      children: [{ title: "User List", url: "/dashboard/user-list" }],
    },
    {
      title: "Event Company List",
      // url: "/admin/event-company-list",
      icon: Building,
      children: [{ title: "Event Compan List", url: "/dashboard/event-company-list" }],
    },
    {
      title: "Scanner Machine List",
      // url: "/admin/scanner-machine-list",
      icon: QrCode,
      children: [{ title: "Scanner Machine List", url: "/dashboard/scanner-machine-list" }],
    },
    {
      title: "Blog List",
      // url: "/admin/blog-list",
      icon: Shapes,
      children: [{ title: "Blog List", url: "/dashboard/blog-list" }],
    },
    {
      title: "Participant User",
      // url: "/admin/participant-user",
      icon: SquareTerminal,
      children: [{ title: "Participant User", url: "/dashboard/participant-user" }],
    },
    {
      title: "Directory ",
      icon: FileText,
      children: [
        { title: "Manage Compay", url: "/dashboard/adminCompany-list" },
        { title: "company Team", url: "/dashboard/company_teams" },
      ],
    },
  ],
};

export function AdminSidebar() {
  return (
    <Sidebar >
      <SidebarHeader>
        <h1 className="text-[#ffffff] font-semibold text-2xl">Logo</h1>
      </SidebarHeader>
      <SidebarContent>
        {/* <NavMain items={data.navMain} /> */}
        <SidebarGroup>
          <SidebarMenu>
            {data.navMain.map((item, index) => (
              <div key={index}>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    tooltip={item.title}
                    onClick={() => item.children && handleToggle(index)}
                    className={`cursor-pointer ${item.children ? "" : "pointer-events-none"}`}
                  >
                    <div className="flex hover:text-blue-700 px-3 py-2 items-center gap-2 text-left text-xs font-semibold text-white w-full">
                      {item.icon && <item.icon />}
                      <span className="flex-1 ">{item.title}</span>
                      {item.children && (
                        <ChevronRight
                          className={`transition-transform duration-200 ${
                            openIndex === index ? "rotate-90" : ""
                          }`}
                          size={18}
                        />
                      )}
                    </div>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                {item.children &&
                  openIndex === index &&
                  item.children.map((child, cidx) => (
                    <SidebarMenuItem key={cidx}>
                      <SidebarMenuButton tooltip={child.title}>
                        <Link
                          to={child.url}
                          className={`flex items-center gap-2 rounded-3xl text-left text-xs leading-tight w-full pl-11 py-2 transition-colors
                        ${
                          location.pathname === child.url
                            ? "bg-blue-600 text-white font-semibold shadow"
                            : "text-[#ffffffb3] hover:bg-blue-100 hover:text-blue-700"
                        }
                      `}
                        >
                          <span>{child.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
              </div>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
