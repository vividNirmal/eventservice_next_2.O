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
import { X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ActionConfirmationDialog({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title,
  description,
  confirmButtonText = "Confirm",
  cancelButtonText = "Cancel",
  loading = false,
  variant = "default", // 'default' | 'destructive'
  icon: Icon,
  showCloseButton = true
}) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        {/* Close Icon */}
        {showCloseButton && (
          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute right-4 top-4 text-gray-400 hover:text-gray-700 focus:outline-none"
            type="button"
            disabled={loading}
          >
            <X className="w-5 h-5" />
          </button>
        )}
        
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            {Icon && (
              <div className={`p-2 rounded-full ${
                variant === 'destructive' 
                  ? 'bg-red-100 text-red-600' 
                  : 'bg-blue-100 text-blue-600'
              }`}>
                <Icon className="w-5 h-5" />
              </div>
            )}
            <AlertDialogTitle className={variant === 'destructive' ? 'text-red-600' : ''}>
              {title}
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription>
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>
            {cancelButtonText}
          </AlertDialogCancel>
          <Button
            onClick={onConfirm}
            disabled={loading}
            variant={variant === 'destructive' ? 'destructive' : 'default'}
            className="flex items-center gap-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {confirmButtonText}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}