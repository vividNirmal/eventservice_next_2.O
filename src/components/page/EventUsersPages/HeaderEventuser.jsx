"use client";

import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation"; // ADD THIS
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  LogOut,
  Settings,
  User,
  Menu,
  ChevronDown,
  Building2,
} from "lucide-react";
import Link from "next/link";
import { useDispatch } from "react-redux";
import { handleEventUserTypeSelected } from "@/redux/eventuserReducer/eventuserReducer";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function HeaderEventuser() {
  const [loginUser, setLoginUser] = useState(null);
  const [selectedUserType, setSelectedUserType] = useState(null);  
  // const [open, setOpen] = useState(false);
  // const dropdownRef = useRef(null);
  const dispatch = useDispatch();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const menuRef = useOutsideClick(() => setMobileMenuOpen(false));
  
  // ADD THESE
  const pathname = usePathname();
  const router = useRouter();

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
        dispatch(handleEventUserTypeSelected(user.userType[0]));
      }
    }
  }, [dispatch]);

  // Handle click outside
  // useEffect(() => {
  //   const handleClickOutside = (event) => {
  //     if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
  //       setOpen(false);
  //     }
  //   };

  //   if (open) {
  //     document.addEventListener("mousedown", handleClickOutside);
  //     return () => document.removeEventListener("mousedown", handleClickOutside);
  //   }
  // }, [open]);

  // Callbacks
  const handleLogout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("loginuser");
    window.location.href = "/login";
  }, []);

  const toggleDropdown = useCallback(() => {
    setOpen((prev) => !prev);
  }, []);

  // UPDATED handleUserTypeChange
  const handleUserTypeChange = useCallback((type) => {
    setSelectedUserType(type);
    dispatch(handleEventUserTypeSelected(type));
    
    // Redirect if switching away from Exhibitor while on directory page
    if (
      type.typeName !== "Exhibitor" && 
      pathname === "/dashboard/eventuser/company-teams"
    ) {
      router.push("/dashboard/eventuser");
    }
  }, [dispatch, pathname, router]);

  return (
    <header className="bg-white border-b border-solid border-[#eee] py-2 relative z-50">
      <div className="flex items-center justify-between gap-4 px-5 xl:px-[4vw] 2xl:px-[5vw] mx-auto">
        {/* Logo */}
        <div className="min-w-fit">
          <div className="text-2xl font-bold text-blue-600">Logo</div>
        </div>

        {/* Navigation */}
        <div ref={menuRef} className={cn("md:flex md:items-center flex-col md:flex-row gap-2 md:gap-6 flex-1 justify-center md:static md:w-auto w-full top-12 p-5 md:p-0 left-0 fixed bg-white md:bg-transparent", !mobileMenuOpen && "hidden")}
        >
          {loginUser && (
            <div className="py-2 border-gray-200">
              {hasMultipleUserTypes ? (
                <DropdownMenu>
                  <DropdownMenuTrigger className="!py-0" asChild>
                    <button className="!py-0 cursor-pointer flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900">
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

          <Link href="/dashboard/eventuser" className="text-gray-700 hover:text-gray-900 font-medium text-sm">{selectedUserType?.typeName === "Exhibitor" ? "Shows" : "Event"}</Link>

          {selectedUserType && selectedUserType.typeName === "Exhibitor" && (
            <Link href="/dashboard/eventuser/company-teams" className="text-gray-700 hover:text-gray-900 font-medium text-sm">Directory</Link>
          )}
          
          <Link href="/dashboard/eventuser/payment" className="text-gray-700 hover:text-gray-900 font-medium text-sm">Payments</Link>
        </div>
        <Button className={'!shadow-none border-0 !bg-transparent !p-0 md:hidden text-black ml-auto'} onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          <Menu className="size-5" />
        </Button>

        {/* Company Name */}
        <Badge className="bg-orange-400 shadow-[0_0_0_4px_rgba(255,137,4,0.2)] text-[10px] xl:text-xs uppercase py-1 pl-2 pr-2 text-white flex flex-wrap gap-1.5 items-center">
          <span className="size-2 xl:size-2.5 bg-white rounded-full"></span>
          {loginUser?.compayId?.company_name}
        </Badge>

        {/* User Info Menu Dropdowns */}
        <DropdownMenu>
          <DropdownMenuTrigger className="flex flex-wrap items-center gap-1 outline-0 cursor-pointer">
            <Avatar className={'2xl:size-9'}>
              {loginUser?.image ? (
                <AvatarImage src={loginUser.image} alt={displayName} />
              ) : (
                <AvatarFallback className={'bg-blue-600 text-white text-xs 2xl:text-sm'}>{userInitial}</AvatarFallback>
              )}
            </Avatar>
            <div className="text-left hidden md:flex flex-col">
              <span className="inline-block text-xs text-gray-600">Welcome</span>
              <h6 className="text-xs 2xl:text-sm font-medium text-gray-800">{displayName}</h6>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel className={'text-sm pb-0'}>{displayName}</DropdownMenuLabel>
            <DropdownMenuItem className={'pt-0 text-gray-500 hover:!text-gray-500 hover:!bg-transparent'}>{loginUser?.email || "No email"}</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className={'cursor-pointer'}>
              <LogOut className="h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}





export function useOutsideClick(callback) {
  const ref = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (ref.current && !ref.current.contains(event.target)) {
        callback();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [callback]);

  return ref;
}