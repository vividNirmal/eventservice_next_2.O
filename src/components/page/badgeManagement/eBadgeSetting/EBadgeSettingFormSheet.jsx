"use client";
import React, { useState, useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { getRequest } from "@/service/viewService";
import { toast } from "sonner";

export const EBadgeSettingFormSheet = ({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
  initialData,
  eventId,
  title,
  description,
  submitButtonText,
}) => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);

  const validationSchema = Yup.object({
    name: Yup.string().required("Setting name is required"),
    ticketIds: Yup.array()
      .of(Yup.string()),
    downloadOption: Yup.string()
      .oneOf(
        ["print", "print_and_download", "download", "none"],
        "Invalid download option"
      )
      .required("Download option is required"),
  });

  const formik = useFormik({
    initialValues: {
      name: initialData?.name || "",
      ticketIds: initialData?.ticketIds?.map((t) => t._id) || [],
      downloadOption: initialData?.downloadOption || "download",
    },
    validationSchema,
    onSubmit: async (values) => {
      await onSubmit(values);
    },
    enableReinitialize: true,
  });

  useEffect(() => {
    if (isOpen) {
      fetchTicketsWithUsage();
    }
  }, [isOpen, eventId]);

  const fetchTicketsWithUsage = async () => {
    setLoading(true);
    try {
      // Fetch all tickets for the event
      const ticketsResponse = await getRequest(
        `tickets?eventId=${eventId}&limit=1000`
      );
      console.log("ticketsResponse", ticketsResponse);

      // Fetch all e-badge settings to check ticket usage
      const settingsResponse = await getRequest(
        `get-e-badge-settings?eventId=${eventId}&limit=1000`
      );

      if (ticketsResponse.status === 1) {
        const allTickets = ticketsResponse.data.tickets || [];
        const allSettings = settingsResponse.data.settings || [];

        // Mark tickets that are used in other settings
        const updatedTickets = allTickets.map((ticket) => {
          const usedInSettings = allSettings
            .filter(
              (setting) =>
                setting._id !== initialData?._id && // Exclude current setting when editing
                setting.ticketIds.some((t) => t._id === ticket._id)
            )
            .map((setting) => setting.name);

          return {
            ...ticket,
            isUsed: usedInSettings.length > 0,
            usedBySetting: usedInSettings[0] || null,
          };
        });

        setTickets(updatedTickets);
      }
    } catch (error) {
      console.error("Error fetching tickets:", error);
      toast.error("Failed to fetch tickets");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    formik.resetForm();
    onClose();
  };

  const handleTicketToggle = (ticketId) => {
    const currentTicketIds = formik.values.ticketIds;
    const isCurrentlySelected = currentTicketIds.includes(ticketId);

    let newTicketIds;
    if (isCurrentlySelected) {
      newTicketIds = currentTicketIds.filter((id) => id !== ticketId);
    } else {
      newTicketIds = [...currentTicketIds, ticketId];
    }

    formik.setFieldValue("ticketIds", newTicketIds);
  };

  const getTicketStatus = (ticket) => {
    if (ticket.isUsed && !formik.values.ticketIds.includes(ticket._id)) {
      return {
        disabled: true,
        tooltip: `This ticket is already used in "${ticket.usedBySetting}" setting`,
      };
    }
    return { disabled: false, tooltip: "" };
  };

  const downloadOptions = [
    { value: "print", label: "Print Only" },
    { value: "print_and_download", label: "Print & Download" },
    { value: "download", label: "Download Only" },
    { value: "none", label: "None" },
  ];

  return (
    <Sheet open={isOpen} onOpenChange={handleClose}>
      <SheetContent className="sm:max-w-md flex flex-col overflow-hidden">
        <SheetHeader className="border-b border-gray-200 pb-4">
          <SheetTitle>{title}</SheetTitle>
          <SheetDescription>{description}</SheetDescription>
        </SheetHeader>

        <form onSubmit={formik.handleSubmit} className="flex flex-col h-full">
          <div className="p-6 flex flex-col gap-4 grow overflow-y-auto">
            {/* Setting Name */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="name">Setting Name *</Label>
              <div className="relative">
                <Input
                  id="name"
                  name="name"
                  value={formik.values.name}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="Enter setting name"
                  className={cn(
                    formik.touched.name && formik.errors.name
                      ? "border-red-500"
                      : ""
                  )}
                />
                {formik.touched.name && formik.errors.name && (
                  <p className="text-red-500 text-xs mt-1">
                    {formik.errors.name}
                  </p>
                )}
              </div>
            </div>

            {/* Download Option */}
            {/* <div className="flex flex-col gap-2">
              <Label htmlFor="downloadOption">Download Option *</Label>
              <Select
                value={formik.values.downloadOption}
                onValueChange={(value) => formik.setFieldValue("downloadOption", value)}
              >
                <SelectTrigger
                  className={cn(
                    formik.touched.downloadOption && formik.errors.downloadOption
                      ? "border-red-500"
                      : ""
                  )}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {downloadOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formik.touched.downloadOption && formik.errors.downloadOption && (
                <p className="text-red-500 text-xs">
                  {formik.errors.downloadOption}
                </p>
              )}
            </div> */}

            {/* Tickets Selection */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="tickets">Tickets</Label>
              {loading ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Loading tickets...
                </div>
              ) : (
                <div className="border rounded-md p-4 max-h-60 overflow-y-auto">
                  {tickets.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">
                      No tickets available for this event
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {tickets.map((ticket) => {
                        const status = getTicketStatus(ticket);
                        const isSelected = formik.values.ticketIds.includes(
                          ticket._id
                        );

                        return (
                          <div
                            key={ticket._id}
                            className={cn(
                              "flex items-center space-x-2 p-2 rounded-md",
                              status.disabled && "bg-gray-100 opacity-60",
                              isSelected && "bg-blue-50 border border-blue-200"
                            )}
                            title={status.tooltip}
                          >
                            <Checkbox
                              id={`ticket-${ticket._id}`}
                              checked={isSelected}
                              onCheckedChange={() =>
                                handleTicketToggle(ticket._id)
                              }
                              disabled={status.disabled}
                            />
                            <Label
                              htmlFor={`ticket-${ticket._id}`}
                              className={cn(
                                "flex-1 text-sm font-normal cursor-pointer",
                                status.disabled && "text-gray-500"
                              )}
                            >
                              <div className="flex items-center justify-between">
                                <span>{ticket.ticketName}</span>
                              </div>
                            </Label>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
              {formik.touched.ticketIds && formik.errors.ticketIds && (
                <p className="text-red-500 text-xs">
                  {formik.errors.ticketIds}
                </p>
              )}
            </div>
          </div>

          <p className="text-amber-800 text-xs">
            Tickets wich are disabled already attached to other e-badge settings
            and cannot be selected.
          </p>

          <SheetFooter className="flex flex-row justify-end space-x-2 p-6 py-3 bg-white border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {isSubmitting ? "Saving..." : submitButtonText}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
};
