"use client"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { X } from "lucide-react";

export function StatusConfirmationDialog({ isOpen, onClose, onConfirm, user, loading = false }) {
  const newStatus = user?.status === 0 ?  1 : 0

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
          <AlertDialogTitle>Change  Status</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to {newStatus  == 1 ? "Approve" : "Unapprove"} ?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} disabled={loading}>
            {newStatus  == 1 ? "Approve" : "Unapprove"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
