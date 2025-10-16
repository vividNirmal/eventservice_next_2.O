"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { X, LogOut, ExternalLink, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { getRequest, postRequest } from "@/service/viewService"; // Your API service
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Input } from "./ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import { useDispatch, useSelector } from "react-redux";
import { handleAdminuser, handleUser } from "@/redux/userReducer/userRducer";
import { Breadcrumbs } from "./breadcrumb";

export default function Header() {
  const router = useRouter();
  // Get toggle function and mobile state from sidebar context
  const [loginUser, setLoginUser] = useState(null);
  const [emailStatus, setEmailStatus] = useState(false);
  const [statusPopupOpen, setStatusPopupOpen] = useState(false);
  const [buttonLoading, setButtonLoading] = useState(false);
  const adminuser = useSelector((state) => state.users.adminuser);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);
  const dispatch = useDispatch();
  useEffect(() => {
    // getuserBytoken();
    const user = localStorage.getItem("loginuser");
    if (user) {
      setLoginUser(JSON.parse(user));
    }
  }, []);

  // async function getuserBytoken() {
  //   const token = localStorage.getItem("token");
  //   if (token) {
  //     const responce = await getRequest(`get-user-by-token/${token}`);
  //     dispatch(handleAdminuser(responce?.data));
  //   }
  // }

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("loginuser");
    router.push("/dashboard/login"); // Use Next.js router for navigation
  };

  const handleStatusChange = async () => {
    setButtonLoading(true);
    const formData = new FormData();
    formData.append("send_quotation_mail", emailStatus ? "no" : "yes");
    try {
      const res = await postRequest("update-email-permission", formData);
      setEmailStatus(res?.data?.send_quotation_mail === "yes");
      setStatusPopupOpen(false);
      toast.success(res.message || "Email status updated successfully.");
    } catch (err) {
      toast.error(err?.message || "Error updating status.");
    } finally {
      setButtonLoading(false);
    }
  };
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    }

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    // Cleanup on unmount or when 'open' changes
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);
  return (
    <>
      <div className="items-center w-full gap-5 px-0 py-2.5 flex">
        {/* Sidebar Toggle Button for Mobile */}

        <Breadcrumbs />

      <div className="relative ml-auto" ref={dropdownRef}>
          <button
            onClick={() => setOpen((prev) => !prev)}
            aria-expanded={open}
            type="button"
            className="cursor-pointer flex items-center p-0 text-gray-700 focus:outline-none border-0 shadow-none hover:bg-transparent rounded-full"
          >
            <span className="rounded-full overflow-hidden shrink-0">
              {loginUser?.image ? (
                <img
                  src={loginUser.image}
                  alt="User"
                  className="w-8 h-8 md:w-9 md:h-9 2xl:w-10 2xl:h-10 object-cover rounded-full"
                />
              ) : (
                <span className="flex items-center justify-center w-8 h-8 md:w-9 md:h-9 2xl:w-10 2xl:h-10 bg-blue-600 text-white font-semibold text-xs md:text-sm uppercase rounded-full">
                  {loginUser?.name?.[0] || ""}
                </span>
              )}
            </span>
          </button>

          {open && (
            <div className="absolute right-0 mt-2 w-64 p-3 bg-white border rounded shadow-lg z-10">
              <div className="p-2">
                <span className="block font-bold text-black text-sm">
                  {loginUser?.name || "Unknown User"}
                </span>
                <span className="mt-0.5 block text-xs text-zinc-500">
                  {loginUser?.email || "No email available"}
                </span>
              </div>

              <hr className="my-3" />

              <button
                onClick={handleLogout}
                type="button"
                className="cursor-pointer w-full flex items-center gap-3 px-3 py-2 text-xs font-medium text-gray-700 rounded-lg hover:bg-gray-100 hover:text-purple-600 focus:outline-none border-0 shadow-none"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5 fill-gray-500 group-hover:fill-purple-600"
                  viewBox="0 0 24 24"
                  stroke="none"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M16 13v-2H7V8l-5 4 5 4v-3zM20 3h-8v2h8v14h-8v2h8a2 2 0 002-2V5a2 2 0 00-2-2z" />
                </svg>
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Email Status Change Dialog */}
      <AlertDialog open={statusPopupOpen} onOpenChange={setStatusPopupOpen}>
        <AlertDialogContent className="sm:max-w-[425px]">
          <button
            onClick={() => setStatusPopupOpen(false)}
            aria-label="Close"
            className="absolute right-4 top-4 text-gray-400 hover:text-gray-700 focus:outline-none"
            type="button"
          >
            <X className="w-5 h-5" />
          </button>
          <AlertDialogHeader>
            <AlertDialogTitle>Change email status</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to {emailStatus ? "off" : "on"} premium
              email service?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleStatusChange}
              disabled={buttonLoading}
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
