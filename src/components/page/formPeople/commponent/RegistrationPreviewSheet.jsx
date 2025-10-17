"use client";
import React from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";
import { getFieldKey } from "./fieldUtils";

const RegistrationPreviewSheet = ({
  open,
  onOpenChange,
  registration,
  formFields,
}) => {
  if (!registration) return null;

  const renderFieldValue = (field, value) => {
    if (value === null || value === undefined || value === "") return "N/A";

    switch (field.fieldType) {
      case "file":
      case "image":
        return (
          <div className="flex flex-wrap gap-2 mt-1">
            {Array.isArray(value) ? (
              value.map((url, i) => (
                <img
                  key={i}
                  src={url}
                  alt={field.fieldTitle || "file"}
                  className="w-16 h-16 rounded-md border object-cover"
                />
              ))
            ) : (
              <img
                src={value}
                alt={field.fieldTitle || "file"}
                className="w-16 h-16 rounded-md border object-cover"
              />
            )}
          </div>
        );

      case "date":
        return new Date(value).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        });

      case "checkbox":
        return Array.isArray(value)
          ? value.join(", ")
          : value
          ? "Yes"
          : "No";

      case "html":
        return (
          <div
            className="prose prose-sm mt-1"
            dangerouslySetInnerHTML={{ __html: value }}
          />
        );

      default:
        return Array.isArray(value) ? value.join(", ") : String(value);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-3xl overflow-hidden">
        <SheetHeader>
          <SheetTitle>Registration Form Details</SheetTitle>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-120px)] mt-4 pr-4">
          {/* Header Info */}
          <div className="bg-muted/30 rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex-1">
              <h2 className="text-lg font-semibold">
                {registration.name || "Unnamed"}
              </h2>
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <Mail className="w-4 h-4" />
                {registration.email || "N/A"}
              </p>
              <div className="flex gap-2 mt-2">
                <Badge
                  variant={
                    registration.approved ? "default" : "destructive"
                  }
                >
                  {registration.approved ? "Approved" : "Not Approved"}
                </Badge>
                {registration.badgeNo && (
                  <Badge variant="outline">{registration.badgeNo}</Badge>
                )}
              </div>
            </div>
          </div>

          {/* Optional Action Buttons */}
          <div className="flex justify-end gap-2 mt-3">
            <Button size="sm" variant="default">
              Approve
            </Button>
            <Button size="sm" variant="destructive">
              Disapprove
            </Button>
          </div>

          <Separator className="my-4" />

          {/* Unified Dynamic Key-Value Details */}
          <div className="space-y-5">
            {/* Email Field (Static) */}
            <div className="grid grid-cols-2 gap-3 text-sm border-b pb-2">
              <p className="text-muted-foreground font-medium">Email</p>
              <p>{registration.email || "N/A"}</p>
            </div>

            {/* Dynamic Fields */}
            {formFields?.map((field) => {
              const fieldKey = getFieldKey(field);
              const value = registration.formData?.[fieldKey];

              // Skip if value is missing
              if (value === null || value === undefined || value === "") return null;

              return (
                <div
                  key={field._id}
                  className="grid grid-cols-2 gap-3 text-sm border-b pb-2"
                >
                  <p className="text-muted-foreground font-medium">
                    {field.fieldTitle || fieldKey}
                  </p>
                  <div>{renderFieldValue(field, value)}</div>
                </div>
              );
            })}
          </div>

          <Separator className="my-6" />
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};

export default RegistrationPreviewSheet;
