"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Fragment, useState, useEffect } from "react";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "./ui/separator";

// Helper function to determine if a segment looks like an ID
const isIdSegment = (segment) => { 
  return /^[a-zA-Z0-9]{10,}$/.test(segment);
};
const formatSegment = (segment) => {
  return segment
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}

export function Breadcrumbs() {
  const pathname = usePathname();
  const pathSegments = pathname.split("/").filter((segment) => segment !== "");
  const [userRole, setUserRole] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get user data from localStorage to determine role
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem('loginuser');
      if (userData) {
        const parsedUser = JSON.parse(userData);
        setUserRole(parsedUser.role);
      }
      setIsLoading(false);
    }
  }, []);

  // Helper function to determine if user is admin
  const isAdmin = () => {
    return userRole === 'admin' || userRole === 'superadmin';
  };

  
  const getPageTitle = () => {  
    if (pathSegments.length === 0) return "Home";
    const lastSegment = pathSegments[pathSegments.length - 1];    
    if (isIdSegment(lastSegment)) {
      return "Edit";
    }    
    return formatSegment(lastSegment);
  };
  const pageTitle = getPageTitle();
  
  // Don't render anything until we know the user role
  if (isLoading) {
    return <div className="flex items-center max-w-full" />;
  }
  
  return (
    <div className="flex items-center max-w-full">
      {/* <h2 className="text-xl 2xl:text-2xl font-medium tracking-tight text-primary">{pageTitle}</h2> */}
      {/* <Separator orientation="vertical" className="bg-zinc-300 mx-4" /> */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href={isAdmin() ? "/dashboard" : "/"}>
                {isAdmin() ? "" : "Home"}
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          {pathSegments.map((segment, index) => {
            let href = "/" + pathSegments.slice(0, index + 1).join("/");
            let displaySegment = segment
              .split("-")
              .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
              .join(" ");

            const isLast = index === pathSegments.length - 1;
            
            // Admin-specific breadcrumb handling
            if (isAdmin()) {
              if (segment === "dashboard" && index === 0) {
                // Skip the dashboard segment for admins since it's already the home
                return null;
              }
              
              // Adjust hrefs to ensure proper admin navigation
              if (segment === "users" || segment === "profile") {
                href = `/dashboard/${segment}`;
              }
            } else {
              // Regular user breadcrumb handling
              if (segment === "dashboard") {
                href = "/dashboard";
              }
            }

            // If it's the last segment and looks like an ID, display "Edit"
            if (isLast && isIdSegment(segment)) {
              displaySegment = pageTitle;
            }

            return (
              <Fragment key={href}>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  {isLast ? (
                    <BreadcrumbPage>{displaySegment}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink asChild>
                      <Link href={href}>{displaySegment}</Link>
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
              </Fragment>
            );
          })}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
}
