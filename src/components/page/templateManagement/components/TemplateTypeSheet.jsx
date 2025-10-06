// components/TemplateTypeSheet.jsx
"use client";
import React, { useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export const TemplateTypeSheet = ({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
  initialData,
  title,
  description,
  submitButtonText,
}) => {
  // Validation schema
  const validationSchema = Yup.object({
    typeName: Yup.string()
      .required("Type name is required")
      .min(2, "Type name must be at least 2 characters")
      .max(50, "Type name must not exceed 50 characters")
      .trim(),
    module: Yup.string()
      .required("Module is required")
      .oneOf(["ticket"], "Please select a valid module"),
    actionType: Yup.string()
      .required("Action type is required")
      .oneOf(["welcome", "approve", "disapprove", "suspend", "onboard", "notify"], "Please select a valid action type"),
  });

  const formik = useFormik({
    initialValues: {
      typeName: initialData?.typeName || "",
      module: initialData?.module || "",
      actionType: initialData?.actionType || "",
    },
    validationSchema,
    onSubmit: async (values) => {
      await onSubmit({
        typeName: values.typeName.trim(),
        module: values.module,
        actionType: values.actionType,
      });
    },
    enableReinitialize: true,
  });

  useEffect(() => {
    if (initialData) {
      formik.setValues({
        typeName: initialData.typeName || "",
        module: initialData.module || "",
        actionType: initialData.actionType || "",
      });
    } else {
      formik.resetForm();
    }
  }, [initialData, isOpen]);

  const handleClose = () => {
    formik.resetForm();
    onClose();
  };

  // Module options
  const moduleOptions = [
    { value: "ticket", label: "Ticket" },
  ];

  // Action type options
  const actionTypeOptions = [
    { value: "welcome", label: "Welcome" },
    { value: "approve", label: "Approve" },
    { value: "disapprove", label: "Disapprove" },
    { value: "suspend", label: "Suspend" },
    { value: "onboard", label: "Onboard" },
    { value: "notify", label: "Notify" },
  ];

  return (
    <Sheet open={isOpen} onOpenChange={handleClose}>
      <SheetContent className="sm:max-w-md flex flex-col">
        <SheetHeader className="border-b border-solid border-gray-200">
          <SheetTitle>{title}</SheetTitle>

          <SheetDescription>{description}</SheetDescription>
        </SheetHeader>

        <form
          onSubmit={formik.handleSubmit}
          className="flex flex-col grow h-60"
        >
          <div className="p-4 pt-0 flex flex-col gap-4 grow overflow-y-auto">
            {/* Type Name Input */}
            <div className="flex flex-col gap-1">
              <Label htmlFor="typeName">Type Name *</Label>

              <div className="relative pb-3.5">
                <Input
                  id="typeName"
                  name="typeName"
                  value={formik.values.typeName}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="Enter type name"
                  className={cn(
                    "xl:h-9",

                    formik.touched.typeName && formik.errors.typeName
                      ? "border-red-500"
                      : ""
                  )}
                />

                {formik.touched.typeName && formik.errors.typeName && (
                  <p className="text-red-500 text-xs absolute left-0 -bottom-1">
                    {formik.errors.typeName}
                  </p>
                )}
              </div>
            </div>

            {/* Module Select */}
            <div className="flex flex-col gap-1">
              <Label htmlFor="module">Module *</Label>
              <div className="relative pb-3.5">
                <Select
                  value={formik.values.module}
                  onValueChange={(value) =>
                    formik.setFieldValue("module", value)
                  }
                >
                  <SelectTrigger
                    className={cn(
                      "xl:h-9 w-full",
                      formik.touched.module && formik.errors.module
                        ? "border-red-500"
                        : ""
                    )}
                  >
                    <SelectValue placeholder="Select module" />
                  </SelectTrigger>
                  <SelectContent>
                    {moduleOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formik.touched.module && formik.errors.module && (
                  <p className="text-red-500 text-xs absolute left-0 -bottom-1">
                    {formik.errors.module}
                  </p>
                )}
              </div>
            </div>

            {/* Action Type Select */}
            <div className="flex flex-col gap-1">
              <Label htmlFor="actionType">Action Type *</Label>
              <div className="relative pb-3.5">
                <Select
                  value={formik.values.actionType}
                  onValueChange={(value) =>
                    formik.setFieldValue("actionType", value)
                  }
                >
                  <SelectTrigger
                    className={cn(
                      "xl:h-9 w-full",
                      formik.touched.actionType && formik.errors.actionType
                        ? "border-red-500"
                        : ""
                    )}
                  >
                    <SelectValue placeholder="Select action type" />
                  </SelectTrigger>
                  <SelectContent>
                    {actionTypeOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formik.touched.actionType && formik.errors.actionType && (
                  <p className="text-red-500 text-xs absolute left-0 -bottom-1">
                    {formik.errors.actionType}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}

          <div className="flex justify-end space-x-2 p-4 bg-white border-t border-solid border-gray-200 shadow-[0_-4px_4px_0_rgba(0,0,0,0.07)]">
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
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
};
