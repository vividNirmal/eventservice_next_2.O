"use client";
import React, { useEffect, useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Loader2, Eye, X } from "lucide-react";
import { cn } from "@/lib/utils";

export const EBadgeTemplateFormSheet = ({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
  initialData,
  title,
  description,
  submitButtonText,
}) => {
  const [showPreview, setShowPreview] = useState(false);

  const validationSchema = Yup.object({
    name: Yup.string().required("Template name is required"),
    htmlContent: Yup.string().required("HTML content is required"),
  });

  const formik = useFormik({
    initialValues: {
      name: initialData?.name || "",
      htmlContent: initialData?.htmlContent || "",
    },
    validationSchema,
    onSubmit: async (values) => {
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
    setShowPreview(false);
    onClose();
  };

  const sampleHTMLContent = `<!-- Sample E-Badge HTML Template (93.5mm × 122mm) -->
<div style="width: 93.5mm; height: 122mm; border: 1px solid #ddd; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.15); background: white; font-family: Arial, sans-serif; position: relative;">
  
  <!-- Header Section (34mm height) -->
  <div style="height: 34mm; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); display: flex; align-items: center; justify-content: center; color: white; position: relative;">
    <div style="text-align: center;">
      <h2 style="margin: 0; font-size: 18px; font-weight: bold;">EVENT NAME</h2>
      <p style="margin: 5px 0 0 0; font-size: 11px;">Conference 2025</p>
    </div>
  </div>

  <!-- Main Content Section (Printable Area: 64mm) -->
  <div id="badgeContent" style="">
    <!-- Dynamic content will be inserted here by the editor -->
    <div style="text-align: center; color: #999; font-size: 12px; padding: 20px 0;">
      <p>Printable Area</p>
      <p style="font-size: 10px; margin-top: 5px;">Fields will appear here</p>
    </div>
  </div>

  <!-- Footer Section (24mm height) -->
  <div style="position: absolute; bottom: 0; left: 0; right: 0; height: 24mm;">
    <!-- Official Agency Bar (10mm) -->
    <div style="height: 10mm; background: #8b8b8b; display: flex; align-items: center; justify-content: center; color: white; font-size: 11px; font-weight: bold; padding: 0 10px;">
      OFFICIAL AGENCY
    </div>
    
    <!-- Sponsor Bar (14mm) -->
    <div style="height: 14mm; background: #4a148c; display: flex; align-items: center; justify-content: center; color: white; font-size: 10px; font-weight: bold; padding: 0 10px;">
      BADGE SPONSOR
    </div>
  </div>

</div>`;

  const insertSampleTemplate = () => {
    formik.setFieldValue("htmlContent", sampleHTMLContent);
  };

  return (
    <Sheet open={isOpen} onOpenChange={handleClose}>
      <SheetContent className="sm:max-w-2xl flex flex-col overflow-hidden">
        {/* HEADER */}
        <SheetHeader className="border-b border-gray-200 pb-4">
          <SheetTitle className="flex items-center gap-2">
            {title}
            <Badge
              variant="outline"
              className="bg-blue-100 text-blue-800 border-blue-200"
            >
              E-BADGE
            </Badge>
          </SheetTitle>
          <SheetDescription>{description}</SheetDescription>
        </SheetHeader>

        {/* CONDITIONAL CONTENT */}
        {!showPreview ? (
          <form
            onSubmit={formik.handleSubmit}
            className="w-full flex flex-col h-full grow"
          >
            <div className="p-6 pt-4 flex flex-col gap-4 grow overflow-y-auto">
              {/* Template Name */}
              <div className="flex flex-col gap-1">
                <Label htmlFor="name">Name *</Label>
                <div className="relative pb-3.5">
                  <Input
                    id="name"
                    name="name"
                    value={formik.values.name}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="Enter template name"
                    className={cn(
                      "xl:h-9",
                      formik.touched.name && formik.errors.name
                        ? "border-red-500"
                        : ""
                    )}
                  />
                  {formik.touched.name && formik.errors.name && (
                    <p className="text-red-500 text-xs absolute left-0 -bottom-1">
                      {formik.errors.name}
                    </p>
                  )}
                </div>
              </div>

              {/* E-Badge HTML Content */}
              <div className="flex flex-col gap-1 h-24 grow">
                <div className="flex flex-row justify-between items-center gap-1">
                  <Label htmlFor="htmlContent" className={"mb-0"}>
                    E-Badge HTML *
                  </Label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={insertSampleTemplate}
                    >
                      Use Sample Template
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowPreview(true)}
                      disabled={!formik.values.htmlContent}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Preview
                    </Button>
                  </div>
                </div>

                <div className="h-20 grow flex flex-col relative pb-3.5">
                  <Textarea
                    id="htmlContent"
                    name="htmlContent"
                    value={formik.values.htmlContent}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="Enter HTML content for the e-badge"
                    rows={15}
                    className={cn(
                      "font-mono text-sm bg-[#141d2b] text-white p-6 rounded-2xl grow h-60 overflow-auto custom-scroll",
                      formik.touched.htmlContent && formik.errors.htmlContent
                        ? "border-red-500"
                        : ""
                    )}
                  />
                  {formik.touched.htmlContent && formik.errors.htmlContent && (
                    <p className="text-red-500 text-xs absolute left-0 -bottom-1">
                      {formik.errors.htmlContent}
                    </p>
                  )}
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-md p-3">
                  <p className="text-amber-800 text-sm">
                    <strong>Important:</strong>
                    <br />
                    If you are using a custom HTML template, please ensure to
                    include the following HTML tag in your template:
                    <code className="bg-amber-100 px-1 py-0.5 rounded text-amber-900 ml-1">
                      &lt;span id="badgeContent"
                      style="visibility:hidden"&gt;&lt;/span&gt;
                    </code>
                  </p>
                </div>
              </div>
            </div>

            <SheetFooter className="flex flex-row justify-end space-x-2 p-6 py-3 bg-white border-t border-gray-200 shadow-[0_-4px_4px_0_rgba(0,0,0,0.07)]">
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
        ) : (
          // PREVIEW PAGE
          <div className="flex flex-col h-full border border-solid border-zinc-200 m-4 mt-0 p-6 rounded-xl">
            <div className="flex items-center justify-between pb-4">
              <h2 className="font-semibold text-lg">E-Badge Preview</h2>
              <Button
                variant={"destructive"}
                onClick={() => setShowPreview(false)}
              >
                Close
              </Button>
            </div>

            <div className="p-6 flex flex-col justify-center items-center overflow-auto flex-1 bg-gray-50">
              <div
                dangerouslySetInnerHTML={{ __html: formik.values.htmlContent }}
                className="[&>div]:!mx-auto"
              />
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};
