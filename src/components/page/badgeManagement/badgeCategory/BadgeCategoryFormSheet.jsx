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
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export const BadgeCategoryFormSheet = ({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
  initialData,
  title,
  description,
  submitButtonText,
}) => {
  const validationSchema = Yup.object({
    name: Yup.string().required("Name is required"),
    code: Yup.string().nullable(),
    priority: Yup.number().required("Priority is required"),
    backgroundColor: Yup.string().required("Background color is required"),
    textColor: Yup.string().required("Text color is required"),
    description: Yup.string().nullable(),
  });

  const formik = useFormik({
    initialValues: {
      name: initialData?.name || "",
      code: initialData?.code || "",
      priority: initialData?.priority || 0,
      backgroundColor: initialData?.backgroundColor || "#ffffff",
      textColor: initialData?.textColor || "#000000",
      description: initialData?.description || "",
    },
    validationSchema,
    onSubmit: async (values, { resetForm }) => {
      await onSubmit(values);
      // Reset form after successful submission
      if (!isSubmitting) {
        resetForm();
      }
    },
    enableReinitialize: true,
  });

  // Reset form when sheet opens/closes or initialData changes
  useEffect(() => {
    if (isOpen) {
      formik.resetForm();
    }
  }, [isOpen, initialData]);

  const handleClose = () => {
    formik.resetForm();
    onClose();
  };

  return (
    <Sheet open={isOpen} onOpenChange={handleClose}>
      <SheetContent className="sm:max-w-xl flex flex-col">
        <SheetHeader className="border-b border-gray-200 pb-4">
          <SheetTitle>{title}</SheetTitle>
          <SheetDescription>{description}</SheetDescription>
        </SheetHeader>

        <form
          onSubmit={formik.handleSubmit}
          className="flex flex-col grow p-6 overflow-y-auto"
        >
          <div className="flex flex-col gap-4">
            <div>
              <Label>Name *</Label>
              <Input
                name="name"
                value={formik.values.name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
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

            <div>
              <Label>Code</Label>
              <Input
                name="code"
                value={formik.values.code}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
            </div>

            <div>
              <Label>Priority *</Label>
              <Input
                type="number"
                name="priority"
                value={formik.values.priority}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={cn(
                  formik.touched.priority && formik.errors.priority
                    ? "border-red-500"
                    : ""
                )}
              />
              {formik.touched.priority && formik.errors.priority && (
                <p className="text-red-500 text-xs mt-1">
                  {formik.errors.priority}
                </p>
              )}
            </div>

            <div>
              <Label>Background Color *</Label>
              <div className="flex gap-2">
                <Input
                  type="text"
                  name="backgroundColor"
                  value={formik.values.backgroundColor}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="#000"
                  className="flex-1"
                />
                <Input
                  type="color"
                  name="backgroundColor"
                  value={formik.values.backgroundColor}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="w-12 h-10 p-1 cursor-pointer"
                />
              </div>
            </div>

            <div>
              <Label>Text Color *</Label>
              <div className="flex gap-2">
                <Input
                  type="text"
                  name="textColor"
                  value={formik.values.textColor}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="#000"
                  className="flex-1"
                />
                <Input
                  type="color"
                  name="textColor"
                  value={formik.values.textColor}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="w-12 h-10 p-1 cursor-pointer"
                />
              </div>
            </div>

            <div>
              <Label>Description</Label>
              <Textarea
                name="description"
                value={formik.values.description}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="Enter category description"
              />
            </div>
          </div>

          <SheetFooter className="flex flex-row justify-end space-x-2 p-6 py-3 bg-white border-t border-gray-200 shadow-[0_-4px_4px_0_rgba(0,0,0,0.07)]">
            <Button type="button" variant="outline" onClick={handleClose}>
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
