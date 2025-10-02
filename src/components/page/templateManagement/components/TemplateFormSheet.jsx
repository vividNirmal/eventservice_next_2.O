// components/TemplateFormSheet.jsx
"use client";
import React, { useState, useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import dynamic from "next/dynamic";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { textEditormodule } from "@/lib/constant";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";

// Dynamically import ReactQuill to avoid SSR issues
const ReactQuill = dynamic(() => import("react-quill-new"), {
  ssr: false,
});

export const TemplateFormSheet = ({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
  initialData,
  templateTypes,
  title,
  description,
  submitButtonText,
  type,
}) => {
  const [availableTypes, setAvailableTypes] = useState([]);

  // Filter template types based on the current template type
  useEffect(() => {
    const filteredTypes = templateTypes.filter(
      (templateType) => templateType.type === type
    );
    setAvailableTypes(filteredTypes);
  }, [templateTypes, type]);

  // Validation schema based on template type
  const validationSchema = Yup.object({
    name: Yup.string().required("Template name is required"),
    typeId: Yup.string().required("Template type is required"),
    ...(type === "email" && {
      subject: Yup.string().required("Subject is required for email templates"),
      content: Yup.string().required(
        "HTML content is required for email templates"
      ),
    }),
    ...((type === "sms" || type === "whatsapp") && {
      text: Yup.string().required("Text content is required"),
    }),
  });

  const formik = useFormik({
    initialValues: {
      name: initialData?.name || "",
      typeId: initialData?.typeId || "",
      subject: initialData?.subject || "",
      content: initialData?.content || "",
      text: initialData?.text || "",
      // status: initialData?.status || "active",
    },
    validationSchema,
    onSubmit: async (values) => {
      await onSubmit(values);
    },
    enableReinitialize: true,
  });

  const handleClose = () => {
    formik.resetForm();
    onClose();
  };

  const getTypeColor = (type) => {
    const colors = {
      email: "bg-blue-100 text-blue-800 border-blue-200",
      sms: "bg-green-100 text-green-800 border-green-200",
      whatsapp: "bg-purple-100 text-purple-800 border-purple-200",
    };
    return colors[type] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  return (
    <Sheet open={isOpen} onOpenChange={handleClose}>
      <SheetContent className="sm:max-w-xl flex flex-col">
        <SheetHeader className={'border-b border-solid border-gray-200'}>
          <SheetTitle className="flex items-center gap-2">
            {title}
            <Badge variant="outline" className={getTypeColor(type)}>
              {type.toUpperCase()}
            </Badge>
          </SheetTitle>
          <SheetDescription>{description}</SheetDescription>
        </SheetHeader>

        <form onSubmit={formik.handleSubmit} className="w-full flex flex-col h-96 grow">
          <div className="p-4 pt-0 h-96 flex flex-col gap-4 grow overflow-y-auto">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <Label htmlFor="name">Template Name *</Label>
                <div className="relative pb-3.5">
                  <Input id="name" name="name" value={formik.values.name} onChange={formik.handleChange} onBlur={formik.handleBlur} placeholder="Enter template name" className={cn("xl:h-9", formik.touched.name && formik.errors.name ? "border-red-500" : "")} />
                  {formik.touched.name && formik.errors.name && (
                    <p className="text-red-500 text-xs absolute left-0 -bottom-1">{formik.errors.name}</p>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <Label htmlFor="typeId">Template Type *</Label>
                <div className="relative pb-3.5">
                  <Select
                    value={formik.values.typeId}
                    onValueChange={(value) => formik.setFieldValue("typeId", value)}
                  >
                    <SelectTrigger
                      className={cn("w-full", formik.touched.typeId && formik.errors.typeId ? "border-red-500" : "")}
                    >
                      <SelectValue placeholder="Select template type" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableTypes.map((templateType) => (
                        <SelectItem key={templateType._id} value={templateType._id}>
                          {templateType.typeName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formik.touched.typeId && formik.errors.typeId && (
                    <p className="text-red-500 text-xs absolute left-0 -bottom-1">{formik.errors.typeId}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Email Specific Fields */}
            {type === "email" && (
              <>
                <div className="flex flex-col gap-1">
                  <Label htmlFor="subject">Subject *</Label>
                  <div className="relative pb-3.5">
                    <Input id="subject" name="subject" value={formik.values.subject} onChange={formik.handleChange} onBlur={formik.handleBlur} placeholder="Enter email subject" className={formik.touched.subject && formik.errors.subject ? "border-red-500" : ""} />
                    {formik.touched.subject && formik.errors.subject && (
                      <p className="text-red-500 text-xs absolute left-0 -bottom-1">{formik.errors.subject}</p>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <Label htmlFor="content">HTML Content *</Label>
                  <div className="min-h-72">
                    <ReactQuill
                      id="content"
                      name="content"
                      theme="snow"
                      value={formik.values.content}
                      onChange={(value) => formik.setFieldValue("content", value)}
                      onBlur={() => formik.setFieldTouched("content", true)}
                      modules={textEditormodule.modules}
                      className="w-full min-h-72 flex flex-col [&>.ql-container.ql-snow]:flex [&>.ql-container.ql-snow]:flex-col [&>.ql-container>.ql-editor]:grow [&>.ql-toolbar.ql-snow]:rounded-t-xl [&>.ql-container.ql-snow]:rounded-b-xl [&>.ql-container.ql-snow]:flex-grow"
                    />
                  </div>
                  {formik.touched.content && formik.errors.content && (
                    <p className="text-red-500 text-xs">
                      {formik.errors.content}
                    </p>
                  )}
                </div>

                {/* Text fallback for email */}
                <div className="flex flex-col gap-1">
                  <Label htmlFor="text">Text</Label>
                  <Textarea placeholder="Plain text version for email clients that don't support HTML" id="text" name="text" value={formik.values.text} onChange={formik.handleChange} onBlur={formik.handleBlur} />
                </div>
              </>
            )}

            {/* SMS and WhatsApp Specific Fields */}
            {(type === "sms" || type === "whatsapp") && (
              <div className="space-y-2">
                <Label htmlFor="text">Message Content *</Label>
                <textarea
                  id="text"
                  name="text"
                  value={formik.values.text}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder={`Enter your ${type} message content`}
                  rows={6}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    formik.touched.text && formik.errors.text
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                />
                {formik.touched.text && formik.errors.text && (
                  <p className="text-red-500 text-xs">{formik.errors.text}</p>
                )}
                <p className="text-xs text-gray-500">
                  {type === "sms"
                    ? "SMS messages have a 160 character limit per segment."
                    : "WhatsApp supports longer messages with formatting."}
                  Current length: {formik.values.text.length} characters
                </p>
              </div>
            )}
          </div>
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
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSubmitting ? "Saving..." : submitButtonText}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
};