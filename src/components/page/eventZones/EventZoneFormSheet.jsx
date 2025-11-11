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
  SheetFooter,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export const EventZoneFormSheet = ({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
  initialData,
  title,
  submitButtonText,
}) => {
  const formik = useFormik({
    initialValues: {
      name: initialData?.name || "",
    },
    validationSchema: Yup.object({
      name: Yup.string().required("Zone name is required").max(100),
    }),
    onSubmit: (values) => onSubmit(values),
    enableReinitialize: true,
  });

  useEffect(() => {
    if (!isOpen) {
      formik.resetForm(); // resets when sheet closes
    }
  }, [isOpen]);

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="sm:max-w-lg flex flex-col">
        <SheetHeader className="border-b border-gray-200 ">
          <SheetTitle>{title}</SheetTitle>
          <SheetDescription className={"hidden"}></SheetDescription>
        </SheetHeader>

        <form
          onSubmit={formik.handleSubmit}
          className="flex flex-col grow gap-4 p-4 overflow-y-auto"
        >
          <div>
            <Label>Zone Name *</Label>
            <div className="relative pb-3.5">
              <Input
                name="name"
                placeholder="Enter zone name"
                value={formik.values.name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.name && formik.errors.name && (
                <p className="text-red-600 text-sm mt-1">
                  {formik.errors.name}
                </p>
              )}
            </div>
          </div>

          <SheetFooter className="flex flex-row justify-end space-x-2 p-6 py-3 bg-white border-t border-gray-200 shadow-[0_-4px_4px_0_rgba(0,0,0,0.07)]">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              {submitButtonText}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
};
