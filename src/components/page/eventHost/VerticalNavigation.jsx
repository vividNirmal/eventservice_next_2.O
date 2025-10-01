"use client";
import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { 
  BarChart3, 
  Users, 
  History, 
  Settings, 
  Menu, 
  X 
} from "lucide-react";
import { Button } from "@/components/ui/button";

const VerticalNavigation = ({ activeSection, onSectionChange, className }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigationItems = [
    {
      id: 'overview',
      label: 'Overview',
      icon: BarChart3,
      description: 'General event information and statistics'
    },
    {
      id: 'participants',
      label: 'Participants',
      icon: Users,
      description: 'Manage event participants and blocking'
    },
    {
      id: 'scan-history',
      label: 'Scan History',
      icon: History,
      description: 'View all completed face scans'
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      description: 'Event configuration and preferences'
    }
  ];

  const handleSectionChange = (sectionId) => {
    onSectionChange(sectionId);
    setIsMobileMenuOpen(false); // Close mobile menu on selection
  };

  const NavigationContent = () => (
    <nav className="space-y-2">
      {navigationItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeSection === item.id;
        
        return (
          <button
            key={item.id}
            onClick={() => handleSectionChange(item.id)}
            className={cn(
              "w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all duration-200 group",
              isActive 
                ? "bg-blue-50 text-blue-700 border-l-4 border-blue-600 shadow-sm" 
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            )}
          >
            <Icon 
              className={cn(
                "h-5 w-5 transition-colors",
                isActive ? "text-blue-600" : "text-gray-400 group-hover:text-gray-600"
              )} 
            />
            <div className="flex-1 min-w-0">
              <div className={cn(
                "font-medium text-sm",
                isActive ? "text-blue-700" : "text-gray-700"
              )}>
                {item.label}
              </div>
              <div className={cn(
                "text-xs mt-0.5 hidden lg:block",
                isActive ? "text-blue-600" : "text-gray-500"
              )}>
                {item.description}
              </div>
            </div>
          </button>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="bg-white shadow-md"
        >
          {isMobileMenuOpen ? (
            <X className="h-4 w-4" />
          ) : (
            <Menu className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Desktop Sidebar */}
      <aside className={cn(
        "hidden lg:flex lg:flex-col lg:w-72 bg-white border-r border-gray-200 h-full",
        className
      )}>
        <div className="flex-1 px-4 py-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              Event Management
            </h2>
            <p className="text-sm text-gray-600">
              Navigate through different sections
            </p>
          </div>
          <NavigationContent />
        </div>
      </aside>

      {/* Mobile Sidebar */}
      <aside className={cn(
        "lg:hidden fixed left-0 top-0 z-50 w-80 h-full bg-white shadow-xl transform transition-transform duration-300 ease-in-out",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex-1 px-4 py-6 pt-16">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              Event Management
            </h2>
            <p className="text-sm text-gray-600">
              Navigate through different sections
            </p>
          </div>
          <NavigationContent />
        </div>
      </aside>
    </>
  );
};

export default VerticalNavigation;
