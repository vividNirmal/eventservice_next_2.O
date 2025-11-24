"use client";
import React from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Mail, Phone, Building, Calendar } from "lucide-react";

const ExhibitorApplicationPreviewSheet = ({
  isOpen,
  onClose,
  application,
}) => {
  if (!application) return null;

  const renderFieldValue = (value) => {
    if (value === null || value === undefined || value === "") return "N/A";

    if (Array.isArray(value)) {
      return (
        <div className="flex flex-wrap gap-2 mt-1">
          {value.map((item, index) => {
            if (typeof item === 'string' && item.startsWith('uploads/')) {
              return (
                <img
                  key={index}
                  src={`${process.env.NEXT_PUBLIC_BASE_URL || ''}/${item}`}
                  alt="Uploaded file"
                  className="w-16 h-16 rounded-md border object-cover"
                />
              );
            }
            return <span key={index}>{String(item)}</span>;
          })}
        </div>
      );
    }

    if (typeof value === 'string' && value.startsWith('uploads/')) {
      return (
        <img 
          src={`${process.env.NEXT_PUBLIC_BASE_URL || ''}/${value}`} 
          alt="Uploaded file" 
          className="w-32 h-32 object-cover rounded-md border"
        />
      );
    }

    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No';
    }

    if (typeof value === 'string' && !isNaN(Date.parse(value)) && value.includes('-')) {
      return new Date(value).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    }

    return String(value);
  };

  const formatFieldName = (fieldName) => {
    return fieldName
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const formData = application.formData || {};

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-3xl overflow-hidden">
        <SheetHeader>
          <SheetTitle className={'text-base md:text-lg xl:text-xl font-bold mb-0'}>
            Exhibitor Application Details
          </SheetTitle>
        </SheetHeader>

        <div className="h-full flex flex-col">
          
          {/* Header Info */}
          <div className="bg-muted mx-4 rounded-xl p-5">
            <div className="flex items-start gap-3">
              <Building className="w-6 h-6 text-gray-600 mt-1 flex-shrink-0" />

              <div className="flex-1 space-y-2 text-sm">
                <h2 className="text-lg font-semibold">
                  {application.exhibitorFormId?.formName || 'Exhibitor Application'}
                </h2>

                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span className="text-muted-foreground">
                    Submitted: {new Date(application.createdAt).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                  </span>
                </div>

                {application.eventUser?.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-500" />
                    <span className="text-muted-foreground">
                      User: {application.eventUser.email}
                    </span>
                  </div>
                )}

                {application.exhibitorFormId?.eventId?.eventName && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span className="text-muted-foreground">
                      Event: {application.exhibitorFormId.eventId.eventName}
                    </span>
                  </div>
                )}

                <Badge
                  variant={application.approved ? "default" : "secondary"}
                  className={
                    application.approved
                      ? "bg-green-100 text-green-800 hover:bg-green-100"
                      : "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
                  }
                >
                  {application.approved ? "Approved" : "Disapproved"}
                </Badge>
              </div>
            </div>
          </div>

          {/* Application Details - Display ALL form data */}
          <ScrollArea className="flex-1 px-4 my-4">
            <div className="rounded-xl border border-solid border-zinc-200 mb-4">
              {Object.entries(formData).length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No form data available
                </div>
              ) : (
                Object.entries(formData).map(([key, value], index) => (
                  <div 
                    key={key} 
                    className={`grid grid-cols-2 gap-3 text-sm p-3 ${
                      index > 0 ? 'border-t border-solid border-zinc-200' : ''
                    } ${index % 2 === 0 ? 'bg-white' : 'bg-zinc-50'}`}
                  >
                    <p className="text-zinc-950 font-medium break-words">
                      {formatFieldName(key)}
                    </p>
                    <div className="break-words">
                      {renderFieldValue(value)}
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default ExhibitorApplicationPreviewSheet;