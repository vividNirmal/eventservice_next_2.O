"use client";

import Link from "next/link";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { apiGet } from "@/lib/api";
import { toast } from "sonner";

const sideBarMenuOnlyRole0 = [
  "OTP",
  "Manage Users",
  "Manage Admin Users",
  "Live User",
  "Email Premium Listing",
  "Manage User Ip Activity",
  "All Quotation",
  "All Email Testing",
  "All Pending Listings List",
  "All Category wise",
  "All Category",
  "Keywords",
  "All Domain IP Address",
  "Premium Notification",
];

export function NavMain({ items, pathname }) {
  const [userRole, setUserRole] = useState(null);
  const [filteredItems, setFilteredItems] = useState([]);

  const isActive = (url) => {
    return pathname === url;
  };

  const hasActiveSubItem = (items) => {
    if (!items) return false;
    return items.some((item) => isActive(item.url));
  };

  const shouldBeOpen = (item) => {
    if (item.url && isActive(item.url)) return true;
    return hasActiveSubItem(item.items);
  };

  const isMenuItemVisible = (item) => {
    if (userRole === "0") return true;
    return !sideBarMenuOnlyRole0.includes(item.title);
  };

  const isSubItemVisible = (subItem) => {
    if (userRole === "0") return true;
    return !sideBarMenuOnlyRole0.includes(subItem.title);
  };

  const getVisibleItems = (menuItems) => {
    return menuItems
      .filter((item) => isMenuItemVisible(item))
      .map((item) => {
        if (item.items && Array.isArray(item.items)) {
          const visibleSubItems = item.items.filter((subItem) =>
            isSubItemVisible(subItem)
          );

          if (visibleSubItems.length > 0) {
            return {
              ...item,
              items: visibleSubItems,
            };
          } else if (item.url) {
            return {
              ...item,
              items: [],
            };
          } else {
            return null;
          }
        }
        return item;
      })
      .filter(Boolean);
  };

  useEffect(() => {
    const loginUser = localStorage.getItem("loginuser");
    if (loginUser) {
      try {
        const user = JSON.parse(loginUser);
        setUserRole(user.role);
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
  }, []);

  useEffect(() => {
    if (userRole !== null) {
      setFilteredItems(getVisibleItems(items));
    }
  }, [userRole, items]);

  return (
    <SidebarGroup>
      <SidebarMenu>
        {filteredItems.map((item) => {
          const hasSubItems =
            Array.isArray(item.items) && item.items.length > 0;

          // Handle logout item
          if (item.isLogout) {
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuSubButton
                  className="w-full flex cursor-pointer items-center gap-2 px-3 py-2 text-left hover:bg-gray-100"
                  onClick={async () => {
                    const res = await apiGet("/logout-all-admin-user");
                    if (res.status === 1) {
                      toast.success(res.message);
                      localStorage.removeItem("loginuser");
                      localStorage.removeItem("token");
                      window.location.href = "/dashboard/login";
                    }
                  }}
                >
                  {item.icon && <item.icon />}
                  <span>{item.title}</span>
                </SidebarMenuSubButton>
              </SidebarMenuItem>
            );
          }

          const MenuContent = (
            <SidebarMenuButton tooltip={item.title}>
              {item.icon && <item.icon />}
              <span>{item.title}</span>
              {hasSubItems && (
                <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
              )}
            </SidebarMenuButton>
          );

          if (hasSubItems) {
            return (
              item.show && (
                <Collapsible
                  key={item.title}
                  asChild
                  defaultOpen={shouldBeOpen(item)}
                  className="group/collapsible"
                >
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      {MenuContent}
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {item.items.map((subItem) => (
                          <SidebarMenuSubItem key={subItem.title}>
                            <SidebarMenuSubButton
                              asChild
                              isActive={isActive(subItem.url)}
                            >
                              <Link href={subItem.url}>
                                <span>{subItem.title}</span>
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              )
            );
          } else {
            return (
              item.show && (
                <SidebarMenuItem key={item.title}>
                  {item.url ? (
                    <Link href={item.url} className="cursor-pointer">
                      <SidebarMenuButton
                        key={item.title}
                        tooltip={item.title}
                        isActive={isActive(item.url)}
                      >
                        {item.icon && <item.icon />}
                        <span>{item.title}</span>
                      </SidebarMenuButton>
                    </Link>
                  ) : (
                    <SidebarMenuButton key={item.title} tooltip={item.title}>
                      {item.icon && <item.icon />}
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  )}
                </SidebarMenuItem>
              )
            );
          }
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
