
"use client";

import React, { useState, useEffect } from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { X, Loader2, AlertTriangle, Save, Eye, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PreviewConfirmationModal({ 
  isOpen, 
  onClose, 
  onContinueWithoutSave,
  onContinueWithSave,
  isSaving = false,
  mode = "preview" // "preview" or "exit"
}) {
  const isPreviewMode = mode === "preview";
  
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-md">
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-700 focus:outline-none"
          type="button"
          disabled={isSaving}
        >
          <X className="w-5 h-5" />
        </button>
        
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <AlertDialogTitle className="text-lg">
              {isPreviewMode ? "Show Preview" : "Exit Form Builder"}
            </AlertDialogTitle>
          </div>
        </AlertDialogHeader>
        
        <div className="text-left space-y-3 text-sm text-muted-foreground">
          <p>
            You have unsaved changes in the form canvas. If you continue without saving:
          </p>
          <ul className="list-disc list-inside space-y-1 text-gray-600 ml-2">
            <li>Your current changes will <strong>not</strong> be {isPreviewMode ? "reflected in the preview" : "saved"}</li>
            <li>Changes may be <strong>lost</strong> when you {isPreviewMode ? "return to the form builder" : "leave this page"}</li>
          </ul>
          <p className="font-medium text-gray-700">
            We recommend saving your changes before {isPreviewMode ? "previewing" : "exiting"}.
          </p>
        </div>
        
        <AlertDialogFooter className="flex-col sm:flex-row gap-2 sm:gap-3 mt-4">
          <Button
            variant="outline"
            onClick={onContinueWithoutSave}
            disabled={isSaving}
            className="w-full sm:w-auto order-2 sm:order-1"
          >
            {isPreviewMode ? (
              <>
                <Eye className="w-4 h-4 mr-2" />
                Preview Without Saving
              </>
            ) : (
              <>
                <LogOut className="w-4 h-4 mr-2" />
                Exit Without Saving
              </>
            )}
          </Button>
          <Button
            onClick={onContinueWithSave}
            disabled={isSaving}
            className="w-full sm:w-auto order-1 sm:order-2 bg-blue-600 hover:bg-blue-700"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save & {isPreviewMode ? "Preview" : "Exit"}
              </>
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}