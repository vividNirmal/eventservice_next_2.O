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
import { Switch } from "@/components/ui/switch";

const ExhibitorFormConfigSheet = ({
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
    formNo: Yup.string()
      .required("Form No is required")
      .max(20, "Form No must not exceed 20 characters")
      .trim(),
    configName: Yup.string()
      .required("Configuration name is required")
      .min(2, "Configuration name must be at least 2 characters")
      .max(100, "Configuration name must not exceed 100 characters")
      .trim(),
    configSlug: Yup.string()
      .required("Slug is required")
      .matches(
        /^[a-z0-9_-]+$/,
        "Slug must contain only lowercase letters, numbers, underscores or dashes"
      )
      .trim(),
    hasParticulars: Yup.boolean(),
  });

  const formik = useFormik({
    initialValues: {
      formNo: initialData?.formNo || "",
      configName: initialData?.configName || "",
      configSlug: initialData?.configSlug || "",
      hasParticulars: initialData?.hasParticulars || false,
    },
    validationSchema,
    onSubmit: async (values) => {
      await onSubmit({
        formNo: values.formNo.trim(),
        configName: values.configName.trim(),
        configSlug: values.configSlug.trim(),
        hasParticulars: values.hasParticulars,
      });
    },
    enableReinitialize: true,
  });

  // Auto-generate slug from configName
  useEffect(() => {
    const name = formik.values.configName;
    if (name && (!formik.touched.configSlug || !formik.values.configSlug)) {
      const generatedSlug = name
        .toLowerCase()
        .trim()
        .replace(/[\s]+/g, "_") // replace spaces with underscores
        .replace(/[^\w_]+/g, ""); // remove invalid characters

      formik.setFieldValue("configSlug", generatedSlug);
    }
  }, [formik.values.configName]);

  useEffect(() => {
    if (initialData) {
      formik.setValues({
        formNo: initialData.formNo || "",
        configName: initialData.configName || "",
        configSlug: initialData.configSlug || "",
        hasParticulars: initialData.hasParticulars || false,
      });
    } else formik.resetForm();
  }, [initialData, isOpen]);

  const handleClose = () => {
    formik.resetForm();
    onClose();
  };

  return (
    <Sheet open={isOpen} onOpenChange={handleClose}>
      <SheetContent className="sm:max-w-md flex flex-col">
        <SheetHeader className="border-b border-gray-200">
          <SheetTitle>{title}</SheetTitle>
          <SheetDescription>{description}</SheetDescription>
        </SheetHeader>

        <form
          onSubmit={formik.handleSubmit}
          className="flex flex-col grow h-60"
        >
          <div className="p-4 pt-0 flex flex-col gap-4 grow overflow-y-auto">
            {/* Form No */}
            <div className="flex flex-col gap-1">
              <Label htmlFor="formNo">Form No *</Label>
              <div className="relative pb-3.5">
                <Input
                  id="formNo"
                  name="formNo"
                  value={formik.values.formNo}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="Enter form number"
                  className={cn(
                    "xl:h-9",
                    formik.touched.formNo && formik.errors.formNo
                      ? "border-red-500"
                      : ""
                  )}
                />
                {formik.touched.formNo && formik.errors.formNo && (
                  <p className="text-red-500 text-xs absolute left-0 -bottom-1">
                    {formik.errors.formNo}
                  </p>
                )}
              </div>
            </div>

            {/* Config Name */}
            <div className="flex flex-col gap-1">
              <Label htmlFor="configName">Configuration Name *</Label>
              <div className="relative pb-3.5">
                <Input
                  id="configName"
                  name="configName"
                  value={formik.values.configName}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="Enter configuration name"
                  className={cn(
                    "xl:h-9",
                    formik.touched.configName && formik.errors.configName
                      ? "border-red-500"
                      : ""
                  )}
                />
                {formik.touched.configName && formik.errors.configName && (
                  <p className="text-red-500 text-xs absolute left-0 -bottom-1">
                    {formik.errors.configName}
                  </p>
                )}
              </div>
            </div>

            {/* Config Slug */}
            <div className="flex flex-col gap-1">
              <Label htmlFor="configSlug">Config Slug *</Label>
              <div className="relative pb-3.5">
                <Input
                  id="configSlug"
                  name="configSlug"
                  value={formik.values.configSlug}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="e.g., exhibitor_form_1"
                  className={cn(
                    "xl:h-9",
                    formik.touched.configSlug && formik.errors.configSlug
                      ? "border-red-500"
                      : ""
                  )}
                />
                {formik.touched.configSlug && formik.errors.configSlug && (
                  <p className="text-red-500 text-xs absolute left-0 -bottom-1">
                    {formik.errors.configSlug}
                  </p>
                )}
              </div>
            </div>

            {/* Has Particulars */}
            <div className="flex items-center justify-between border rounded-md p-3">
              <Label htmlFor="hasParticulars" className="text-sm">
                Has Particulars
              </Label>
              <Switch
                id="hasParticulars"
                name="hasParticulars"
                checked={formik.values.hasParticulars}
                onCheckedChange={(checked) =>
                  formik.setFieldValue("hasParticulars", checked)
                }
              />
            </div>
          </div>
          {/* Footer */}
          <div className="flex justify-end space-x-2 p-4 bg-white border-t border-gray-200 shadow-[0_-4px_4px_0_rgba(0,0,0,0.07)]">
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

export default ExhibitorFormConfigSheet;
