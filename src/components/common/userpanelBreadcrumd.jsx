"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Fragment, useEffect } from "react";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

// Helper function to determine if a segment looks like an ID
const isIdSegment = (segment) => {
  return /^[a-zA-Z0-9]{10,}$/.test(segment);
};
const formatSegment = (segment) => {
  return segment
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};


export function UserBreadcrumbs() {
  const pathname = usePathname();
  const pathSegments = pathname.split("/").filter((segment) => segment !== "");

  const getPageTitle = (number) => {
    if (pathSegments.length === 0) return "Home";
    const lastSegment = pathSegments[pathSegments.length - number];
    if (isIdSegment(lastSegment)) {
      return "Edit";
    }
    return formatSegment(lastSegment);
  };
  const isNumeric = (value) => {
    return !isNaN(value) && !isNaN(parseFloat(value));
  };
  //   const secondTile = getPageTitle(2)
  const pageTitle = isNumeric(getPageTitle(1))
    ? getPageTitle(2)
    : getPageTitle(1);
  return (
    <div className="container flex items-center px-2.5 mx-auto h-8 md:h-9">
      {/* <Separator orientation="vertical" className="bg-zinc-300 mx-4" /> */}
      <Breadcrumb className="w-1/3 grow truncate">
        <BreadcrumbList className="md:max-w-2/3">
          <BreadcrumbItem>
            <BreadcrumbLink asChild className={'mr-2'}>
              <Link href="/" className="text-xs lg:text-xs">
                <svg viewBox="0 0 20 20" fill="currentColor" data-slot="icon" aria-hidden="true" className="size-5 text-zinc-300">
                  <path d="M9.293 2.293a1 1 0 0 1 1.414 0l7 7A1 1 0 0 1 17 11h-1v6a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1v-3a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v3a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-6H3a1 1 0 0 1-.707-1.707l7-7Z" clipRule="evenodd" fillRule="evenodd"></path>
                </svg>
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

            if (segment === "dashboard") {
              href = "/dashboard";
            }

            // If it's the last segment and looks like an ID, display "Edit"
            if (isLast && isIdSegment(segment)) {
              displaySegment = pageTitle;
            }

            return (
              <Fragment key={href}>
                <svg viewBox="0 0 24 44" fill="currentColor" preserveAspectRatio="none" aria-hidden="true" className="w-4 h-8 md:h-9 text-zinc-300">
                  <path d="M.293 0l22 22-22 22h1.414l22-22-22-22H.293z"></path>
                </svg>
                <BreadcrumbItem className={'mr-1 md:mr-2 grow w-10 truncate'}>
                  {isLast ? (
                    <BreadcrumbPage className="overflow-hidden text-ellipsis max-w-56 whitespace-nowrap text-xs lg:text-xs ml-1 md:ml-2 grow w-10 truncate">{displaySegment}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink asChild className="ml-1 md:ml-2 grow w-10 truncate">
                      <Link className="text-xs lg:text-xs" href={href}>{displaySegment}</Link>
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
              </Fragment>
            );
          })}
        </BreadcrumbList>
      </Breadcrumb>
      <p className="text-zinc-700 hover:text-foreground transition-colors text-xs lg:text-xs text-end ml-auto ellips-2 md:break-all overflow-hidden grow w-10 truncate">
        {pageTitle}
      </p>
    </div>
  );
}
