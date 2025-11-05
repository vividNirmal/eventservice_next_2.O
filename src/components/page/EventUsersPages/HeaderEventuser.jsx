"use client";

import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  LogOut,
  Settings,
  User,
  Menu,
  ChevronDown,
} from "lucide-react";
import Link from "next/link";
import { useDispatch } from "react-redux";
import { handleEventUserTypeSelected } from "@/redux/eventuserReducer/eventuserReducer";

export default function HeaderEventuser() {
  const [loginUser, setLoginUser] = useState(null);
  const [selectedUserType, setSelectedUserType] = useState(null);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);
  const dispatch = useDispatch()

  // Memoized values
  const hasMultipleUserTypes = useMemo(
    () => (loginUser?.userType?.length || 0) > 1,
    [loginUser?.userType?.length]
  );

  const displayName = useMemo(
    () => loginUser?.name || "User",
    [loginUser?.name]
  );

  const userInitial = useMemo(
    () => loginUser?.name?.[0]?.toUpperCase() || "U",
    [loginUser?.name]
  );

  // Load user data
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("loginuser") || "null");
    if (user) {
      setLoginUser(user);
      if (user.userType?.length > 0) {
        setSelectedUserType(user.userType[0]);
        dispatch(handleEventUserTypeSelected(user.userType[0]))
      }
    }
  }, []);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [open]);

  // Callbacks
  const handleLogout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("loginuser");
    window.location.href = "/login"; // Add redirect after logout
  }, []);

  const toggleDropdown = useCallback(() => {
    setOpen((prev) => !prev);
  }, []);

  const handleUserTypeChange = useCallback((type) => {
    setSelectedUserType(type);
    dispatch(handleEventUserTypeSelected(type))
  }, []);

  return (
    <header className="bg-white">
      <div className="flex items-center justify-between gap-4 container px-4 mx-auto">
        {/* Logo */}
        <div className="min-w-fit">
          <div className="text-2xl font-bold text-gray-800">Logo</div>
        </div>

        {/* Navigation */}
        <div className="flex items-center gap-6 flex-1 justify-center">
          {loginUser && (
            <div className="px-6 py-2 border-gray-200">
              {hasMultipleUserTypes ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900">
                      {selectedUserType?.typeName || "Select Type"}
                      <ChevronDown className="h-4 w-4" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    {loginUser.userType.map((type) => (
                      <DropdownMenuItem
                        key={type._id}
                        onClick={() => handleUserTypeChange(type)}
                        className="cursor-pointer"
                      >
                        {type.typeName}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="text-sm font-medium text-gray-700">
                  {selectedUserType?.typeName || "No Type"}
                </div>
              )}
            </div>
          )}

          {/* Fixed: Compare typeName instead of object */}
          <Link
            href="/dashboard/eventuser"
            className="text-gray-700 hover:text-gray-900 font-medium text-sm"
          >
            {selectedUserType?.typeName === "Exhibitor" ? "Shows" : "Event"}
          </Link>

          <Link
            href="/dashboard/eventuser/company-teams"
            className="text-gray-700 hover:text-gray-900 font-medium text-sm"
          >
            Directory
          </Link>
          <Link
            href="/dashboard/eventuser/payment"
            className="text-gray-700 hover:text-gray-900 font-medium text-sm"
          >
            Payments
          </Link>
        </div>

        {/* Company Name */}
        <div className="min-w-fit text-right px-4 border-r border-gray-200">
          <div className="text-sm font-semibold text-amber-600 capitalize">
            {loginUser?.compayId?.company_name}
          </div>
        </div>

        {/* User Info */}
        <div className="flex items-center gap-4 min-w-fit">
          <div className="text-right">
            <div className="text-xs text-gray-600">Welcome</div>
            <div className="text-sm font-medium text-gray-800">
              {displayName}
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            className="text-xs font-medium bg-transparent"
          >
            Non Member
          </Button>

          {/* Menu Dropdowns */}
          <div className="flex items-center gap-2 pl-2 border-l border-gray-200">
            {/* Settings Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-2 hover:bg-gray-100 rounded transition">
                  <Menu className="h-5 w-5 text-gray-700" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem className="gap-2 cursor-pointer">
                  <User className="h-4 w-4" />
                  <span>Account</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-2 cursor-pointer">
                  <Settings className="h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="gap-2 cursor-pointer text-destructive"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Profile Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={toggleDropdown}
                className="p-1 rounded-full hover:bg-gray-100 transition"
                aria-label="User menu"
              >
                {loginUser?.image ? (
                  <img
                    src={loginUser.image}
                    alt={displayName}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <span className="flex items-center justify-center w-8 h-8 bg-blue-600 text-white font-semibold text-xs rounded-full">
                    {userInitial}
                  </span>
                )}
              </button>

              {open && (
                <div className="absolute right-0 mt-2 w-56 bg-white border rounded shadow-lg z-10">
                  <div className="p-3 border-b">
                    <div className="font-semibold text-gray-900">
                      {displayName}
                    </div>
                    <div className="text-xs text-gray-600 mt-0.5">
                      {loginUser?.email || "No email"}
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}