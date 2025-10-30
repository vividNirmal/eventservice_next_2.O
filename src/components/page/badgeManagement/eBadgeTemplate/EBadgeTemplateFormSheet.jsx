"use client";
import React, { useState } from "react";
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
    },
    enableReinitialize: true,
  });

  const handleClose = () => {
    formik.resetForm();
    setShowPreview(false);
    onClose();
  };

  const sampleHTMLContent = `<!-- Sample E-Badge HTML Template -->
<table border="0" align="center" cellpadding="10" cellspacing="0" width="480" style="width:480px;max-width:100%;background:white;font-family:Arial,sans-serif;">
  <tbody>
    <tr>
      <td align="center">
        <div style="width:480px;margin:0 auto;border:1px solid #aaa;border-radius:8px;overflow:hidden;box-shadow:0 2px 6px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <header style="background:#1e3a8a;color:#fff;padding:20px 0;">
            <h2 style="margin:0;font-size:20px;">Event Header</h2>
          </header>

          <!-- Main Content -->
           <section style="height:122mm; width:93.5mm">
            <div id="badgeContent"></div>
          </section>

          <!-- Footer -->
          <footer style="background:#f3f4f6;padding:20px 0;text-align:center;color:#666;font-size:12px;">
            <p style="margin:0;font-size:20px">Event Footer</p>
          </footer>

        </div>
      </td>
    </tr>
  </tbody>
</table>`;

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

            <div className="p-6 flex flex-col justify-center overflow-auto flex-1 bg-white">
              <div
                dangerouslySetInnerHTML={{ __html: formik.values.htmlContent }}
                className="mx-auto w-full max-w-lg [&>table]:!w-full"
              />
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};
