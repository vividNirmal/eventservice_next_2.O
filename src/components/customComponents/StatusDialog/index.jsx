"use client";

// import { AlertDialogContent } from "@/components/ui/alert-dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { X } from "lucide-react";

export function StatusDialog({
  isOpen,
  onClose,
  onConfirm,
  status = "Activate", 
  loading = false,
  userName = "this user",
}) {
  let actionText = status;
  let title = `${actionText} User`;
  let description = `Are you sure you want to ${actionText.toLowerCase()} ${userName}?`;
  let buttonClass = "";
  if (status.toLowerCase() === "activate") {
    buttonClass = "bg-blue-600 hover:bg-blue-700";
  } else if (status.toLowerCase() === "deactivate") {
    buttonClass = "bg-gray-600 hover:bg-gray-700";
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        {/* Close Icon */}
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-700 focus:outline-none"
          type="button"
        >
          <X className="w-5 h-5" />
        </button>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={loading}
            className={buttonClass}
          >
            {loading ? `${actionText}...` : actionText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}