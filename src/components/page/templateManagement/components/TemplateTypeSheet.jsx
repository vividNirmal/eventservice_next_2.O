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
  });

  const formik = useFormik({
    initialValues: {
      typeName: initialData?.typeName || "",
    },
    validationSchema,
    onSubmit: async (values) => {
      await onSubmit(values.typeName.trim());
    },
    enableReinitialize: true,
  });

  useEffect(() => {
    if (initialData) {
      formik.setValues({
        typeName: initialData.typeName || "",
      });
    } else {
      formik.resetForm();
    }
  }, [initialData, isOpen]);

  const handleClose = () => {
    formik.resetForm();
    onClose();
  };

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
