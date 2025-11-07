import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  CalendarDays,
  HomeIcon,
  LucidePackagePlus,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function EventAdminNavigation () {
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(true);
  const [activeSection, setActiveSection] = useState("dashboard");
  const [expandedSections, setExpandedSections] = useState({
    registration: false,
  });

  useEffect(() => {
    if (!pathname) return;

    // Check for sub-routes first
    if (pathname.includes("/ticket-management")) {
      setActiveSection("forms");
      setExpandedSections((prev) => ({ ...prev, registration: true })); // Expand Registration automatically
    } else if (pathname.includes("/scanning-devices")) {
      setActiveSection("scanning-devices");
      setExpandedSections((prev) => ({ ...prev, ManageRegistrations: true })); // Expand Manage Registrations automatically
    } else if (pathname.includes("/participant-list")) {
      setActiveSection("attendee");
    } else if (pathname.includes("/event-host/")) {
      setActiveSection("dashboard");
    } else {
      setActiveSection("dashboard");
    }
  }, [pathname]);

  const navigationItems = [
    {
      id: "event-host",
      label: "Event Host",
      icon: CalendarDays,
      url:  "/dashboard/event-host",
      show: true,
      description: "Manage event hosting",
      isActive: activeSection === "event-host",
    },
    {
      id: "package",
      label: "Event Package",
      icon: LucidePackagePlus,
      url: "/dashboard/package",
      show: true,
      description: "Main dashboard",
      isActive: activeSection === "dashboard",
    },
  ];

  const toggleNavigation = () => {
    setIsOpen(!isOpen);
  };

  const toggleSection = (sectionId) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  const handleItemClick = (item) => {
    setActiveSection(item.id);
    if (item.url) {
      router.replace(item.url);
    }
  };

  const handleSubItemClick = (subItem, parentId) => {
    setActiveSection(subItem.id);
    setExpandedSections((prev) => ({
      ...prev,
      [parentId]: true,
    }));
    if (subItem.url) {
      router.replace(subItem.url);
    }
  };

  return (
    <>
      {/* Navigation Sidebar */}
      <div
        className={cn(
          "bg-white shadow-lg border-r border-gray-200 transition-all duration-300 ease-in-out flex flex-col h-full",
          isOpen ? "w-64" : "w-16"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          {isOpen && (
            <h2 className="text-lg font-semibold text-gray-800 truncate">
              Event Management
            </h2>
          )}
          <button
            onClick={toggleNavigation}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
            aria-label={isOpen ? "Close navigation" : "Open navigation"}
          >
            {isOpen ? (
              <ChevronLeft className="h-5 w-5 text-gray-600" />
            ) : (
              <ChevronRight className="h-5 w-5 text-gray-600" />
            )}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 py-1">
          <ul className="space-y-2 px-3">
            {navigationItems.map((item) => {
              const IconComponent = item.icon;
              const isActive = activeSection === item.id;

              // Only show items that should be visible
              if (item.show === false) return null;

              return (
                <li key={item.id}>
                  {item.isExpandable ? (
                    // Expandable section
                    <div>
                      <button
                        onClick={() => toggleSection(item.id)}
                        className={cn(
                          "w-full flex items-center gap-3 px-3 py-1 rounded-lg transition-all duration-200 text-left hover:scale-105 text-gray-700 hover:bg-gray-50 hover:text-gray-900",
                          !isOpen ? "justify-center" : ""
                        )}
                        title={!isOpen ? item.label : ""}
                      >
                        <IconComponent className="h-4 w-4 flex-shrink-0 text-gray-500" />
                        {isOpen && (
                          <>
                            <div className="flex-1 min-w-0">
                              <div className="font-small text-xs font-medium truncate">
                                {item.label}
                              </div>
                            </div>
                            {item.isExpanded ? (
                              <ChevronUp className="h-4 w-4 text-gray-500" />
                            ) : (
                              <ChevronDown className="h-4 w-4 text-gray-500" />
                            )}
                          </>
                        )}
                      </button>

                      {/* Sub-items */}
                      {isOpen && item.isExpanded && (
                        <ul className="ml-6 mt-2 space-y-1">
                          {item.subItems?.map((subItem) => {
                            const SubIconComponent = subItem.icon;
                            const isSubActive = activeSection === subItem.id;

                            return (
                              <li key={subItem.id}>
                                <button
                                  onClick={() =>
                                    handleSubItemClick(subItem, item.id)
                                  }
                                  className={cn(
                                    "w-full flex items-center gap-3 px-3 py-1.5 rounded-lg transition-all duration-200 text-left border-r-2 border-solid hover:scale-105",
                                    isSubActive
                                      ? "bg-blue-50 text-blue-700 border-blue-700"
                                      : "border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                  )}
                                  title={subItem.label}
                                >
                                  <SubIconComponent
                                    className={cn(
                                      "h-3 w-3 flex-shrink-0",
                                      isSubActive
                                        ? "text-blue-700"
                                        : "text-gray-400"
                                    )}
                                  />
                                  <div className="flex-1 min-w-0">
                                    <div className="font-small text-xs font-medium truncate">
                                      {subItem.label}
                                    </div>
                                  </div>
                                </button>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </div>
                  ) : (
                    // Regular navigation item
                    <button
                      onClick={() => handleItemClick(item)}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-1 rounded-lg transition-all duration-200 text-left hover:scale-105",
                        isActive
                          ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700"
                          : "text-gray-700 hover:bg-gray-50 hover:text-gray-900",
                        !isOpen ? "justify-center" : ""
                      )}
                      title={!isOpen ? item.label : ""}
                    >
                      <IconComponent
                        className={cn(
                          "h-4 w-4 flex-shrink-0",
                          isActive ? "text-blue-700" : "text-gray-500"
                        )}
                      />
                      {isOpen && (
                        <div className="flex-1 min-w-0">
                          <div className="font-small text-xs font-medium truncate">
                            {item.label}
                          </div>
                        </div>
                      )}
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        {isOpen && (
          <div className="p-4 border-t border-gray-200">
            <div className="text-xs text-gray-500 text-center">
              Current Section:{" "}
              {navigationItems.find((item) => item.id === activeSection)?.label}
            </div>
          </div>
        )}
      </div>
    </>
  );
};