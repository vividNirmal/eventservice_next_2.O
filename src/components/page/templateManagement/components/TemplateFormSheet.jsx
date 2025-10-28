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
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { textEditormodule } from "@/lib/constant";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { CustomCombobox } from "@/components/common/customcombox";


// Dynamically import ReactQuill to avoid SSR issues
const ReactQuill = dynamic(() => import("react-quill-new"), {
  ssr: false,
});

// Message type options for WhatsApp
const messageTypeOptions = [
  { value: "text", title: "Text" },
  { value: "template", title: "Template" },
  { value: "image", title: "Image" },
  { value: "video", title: "Video" },
  { value: "audio", title: "Audio" },
  { value: "document", title: "Document" },
  { value: "sticker", title: "Sticker" },
  { value: "location", title: "Location" },
];

// Phone number options
const phoneNumberOptions = [
  { value: "+1234567890", title: "+1 (234) 567-890" },
  { value: "+0987654321", title: "+0 (987) 654-321" },
  { value: "+1122334455", title: "+1 (122) 334-455" },
];

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
  const [currentStep, setCurrentStep] = useState(1);

  // Filter template types based on the current template type
  useEffect(() => {
    const filteredTypes = templateTypes.filter(
      (templateType) => templateType.type === type
    );
    setAvailableTypes(filteredTypes);
  }, [templateTypes, type]);

  // Reset step when sheet opens/closes
  useEffect(() => {
    if (!isOpen) {
      setCurrentStep(1);
    }
  }, [isOpen]);

  // Dynamic validation schema based on template type and message type
  const getValidationSchema = () => {
    const baseSchema = {
      name: Yup.string().required("Template name is required"),
      typeId: Yup.string().required("Template type is required"),
    };

    if (type === "email") {
      return Yup.object({
        ...baseSchema,
        subject: Yup.string().required("Subject is required for email templates"),
        content: Yup.string().required("HTML content is required for email templates"),
      });
    }

    if (type === "sms") {
      return Yup.object({
        ...baseSchema,
        text: Yup.string().required("Text content is required"),
      });
    }

    if (type === "whatsapp") {
      const whatsappSchema = {
        ...baseSchema,
        phoneNumber: Yup.string().required("Phone number is required"),
        messageType: Yup.string().required("Message type is required"),
      };

      return Yup.object(whatsappSchema).shape(
        getWhatsAppMessageTypeValidation()
      );
    }

    return Yup.object(baseSchema);
  };

  

  var formik = useFormik({
    initialValues: {
      name: initialData?.name || "",
      typeId: initialData?.typeId || "",
      subject: initialData?.subject || "",
      content: initialData?.content || "",
      text: initialData?.text || "",
      // WhatsApp fields
      phoneNumber: initialData?.phoneNumber || "",
      messageType: initialData?.messageType || "",
      // WhatsApp - Text
      // text field already defined above
      // WhatsApp - Template
      templateName: initialData?.templateName || "",
      templateLanguage: initialData?.templateLanguage || "en",
      templateParams: initialData?.templateParams || "",
      // WhatsApp - Media (Image, Video, Audio, Document)
      mediaUrl: initialData?.mediaUrl || "",
      caption: initialData?.caption || "",
      // WhatsApp - Sticker
      stickerUrl: initialData?.stickerUrl || "",
      // WhatsApp - Location
      latitude: initialData?.latitude || "",
      longitude: initialData?.longitude || "",
      locationName: initialData?.locationName || "",
      locationAddress: initialData?.locationAddress || "",
    },
    validationSchema: getValidationSchema(),
    onSubmit: async (values) => {
      await onSubmit(values);
    },
    enableReinitialize: true,
  });
  // Get validation rules based on WhatsApp message type
  function getWhatsAppMessageTypeValidation () {
    const messageType = formik?.values?.messageType;

    switch (messageType) {
      case "text":
        return {
          text: Yup.string().required("Message text is required"),
        };
      case "template":
        return {
          templateName: Yup.string().required("Template name is required"),
          templateLanguage: Yup.string().required("Template language is required"),
          // Add more template fields as needed
        };
      case "image":
      case "video":
      case "audio":
      case "document":
        return {
          mediaUrl: Yup.string().url("Must be a valid URL").required("Media URL is required"),
          caption: Yup.string(),
        };
      case "sticker":
        return {
          stickerUrl: Yup.string().url("Must be a valid URL").required("Sticker URL is required"),
        };
      case "location":
        return {
          latitude: Yup.number().required("Latitude is required"),
          longitude: Yup.number().required("Longitude is required"),
          locationName: Yup.string(),
          locationAddress: Yup.string(),
        };
      default:
        return {};
    }
  };

  const handleClose = () => {
    formik.resetForm();
    setCurrentStep(1);
    onClose();
  };

  const handleNextStep = () => {
    // Validate current step fields before proceeding
    if (type === "whatsapp" && currentStep === 1) {
      formik.setFieldTouched("phoneNumber", true);
      formik.setFieldTouched("messageType", true);
      
      if (formik.values.phoneNumber && formik.values.messageType) {
        setCurrentStep(2);
      }
    }
  };

  const handlePrevStep = () => {
    setCurrentStep(1);
  };

  const getTypeColor = (type) => {
    const colors = {
      email: "bg-blue-100 text-blue-800 border-blue-200",
      sms: "bg-green-100 text-green-800 border-green-200",
      whatsapp: "bg-purple-100 text-purple-800 border-purple-200",
    };
    return colors[type] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  // Render WhatsApp Step 2 based on message type
  const renderWhatsAppMessageFields = () => {
    const messageType = formik.values.messageType;

    switch (messageType) {
      case "text":
        return (
          <div className="flex flex-col gap-1">
            <Label htmlFor="text">Message Text *</Label>
            <div className="relative pb-3.5">
              <textarea
                id="text"
                name="text"
                value={formik.values.text}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="Enter your WhatsApp message text"
                rows={6}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  formik.touched.text && formik.errors.text
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
              />
              {formik.touched.text && formik.errors.text && (
                <p className="text-red-500 text-xs absolute left-0 -bottom-1">
                  {formik.errors.text}
                </p>
              )}
            </div>
            <p className="text-zinc-600 text-xs leading-normal border border-solid border-zinc-200 bg-zinc-100 p-0.5 px-1.5 rounded-full w-fit">
              Use <code className="bg-zinc-500 rounded-full px-1 py-0.5 text-white font-mono text-xs leading-none">{"{{fieldName}}"}</code> for dynamic data.
            </p>
          </div>
        );

      case "template":
        return (
          <>
            <div className="flex flex-col gap-1">
              <Label htmlFor="templateName">Template Name *</Label>
              <div className="relative pb-3.5">
                <Input
                  id="templateName"
                  name="templateName"
                  value={formik.values.templateName}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="Enter WhatsApp template name"
                  className={cn(
                    "xl:h-9",
                    formik.touched.templateName && formik.errors.templateName
                      ? "border-red-500"
                      : ""
                  )}
                />
                {formik.touched.templateName && formik.errors.templateName && (
                  <p className="text-red-500 text-xs absolute left-0 -bottom-1">
                    {formik.errors.templateName}
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <Label htmlFor="templateLanguage">Template Language *</Label>
              <div className="relative pb-3.5">
                <Select
                  value={formik.values.templateLanguage}
                  onValueChange={(value) =>
                    formik.setFieldValue("templateLanguage", value)
                  }
                >
                  <SelectTrigger
                    className={cn(
                      "w-full",
                      formik.touched.templateLanguage &&
                        formik.errors.templateLanguage
                        ? "border-red-500"
                        : ""
                    )}
                  >
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="en_US">English (US)</SelectItem>
                    <SelectItem value="es">Spanish</SelectItem>
                    <SelectItem value="fr">French</SelectItem>
                    <SelectItem value="de">German</SelectItem>
                    <SelectItem value="pt_BR">Portuguese (Brazil)</SelectItem>
                    <SelectItem value="hi">Hindi</SelectItem>
                  </SelectContent>
                </Select>
                {formik.touched.templateLanguage &&
                  formik.errors.templateLanguage && (
                    <p className="text-red-500 text-xs absolute left-0 -bottom-1">
                      {formik.errors.templateLanguage}
                    </p>
                  )}
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <Label htmlFor="templateParams">Template Parameters (JSON)</Label>
              <div className="relative pb-3.5">
                <Textarea
                  id="templateParams"
                  name="templateParams"
                  value={formik.values.templateParams}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder='{"1": "{{name}}", "2": "{{date}}"}'
                  rows={4}
                  className={
                    formik.touched.templateParams && formik.errors.templateParams
                      ? "border-red-500"
                      : ""
                  }
                />
                {formik.touched.templateParams &&
                  formik.errors.templateParams && (
                    <p className="text-red-500 text-xs absolute left-0 -bottom-1">
                      {formik.errors.templateParams}
                    </p>
                  )}
              </div>
              <p className="text-zinc-600 text-xs leading-normal border border-solid border-zinc-200 bg-zinc-100 p-0.5 px-1.5 rounded-full w-fit">
                Add template parameters as JSON key-value pairs
              </p>
            </div>
          </>
        );

      case "image":
      case "video":
      case "audio":
      case "document":
        return (
          <>
            <div className="flex flex-col gap-1">
              <Label htmlFor="mediaUrl">
                {messageType.charAt(0).toUpperCase() + messageType.slice(1)} URL *
              </Label>
              <div className="relative pb-3.5">
                <Input
                  id="mediaUrl"
                  name="mediaUrl"
                  type="url"
                  value={formik.values.mediaUrl}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder={`Enter ${messageType} URL`}
                  className={cn(
                    "xl:h-9",
                    formik.touched.mediaUrl && formik.errors.mediaUrl
                      ? "border-red-500"
                      : ""
                  )}
                />
                {formik.touched.mediaUrl && formik.errors.mediaUrl && (
                  <p className="text-red-500 text-xs absolute left-0 -bottom-1">
                    {formik.errors.mediaUrl}
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <Label htmlFor="caption">Caption (Optional)</Label>
              <div className="relative pb-3.5">
                <Textarea
                  id="caption"
                  name="caption"
                  value={formik.values.caption}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="Enter caption for media"
                  rows={3}
                />
              </div>
              <p className="text-zinc-600 text-xs leading-normal border border-solid border-zinc-200 bg-zinc-100 p-0.5 px-1.5 rounded-full w-fit">
                Use <code className="bg-zinc-500 rounded-full px-1 py-0.5 text-white font-mono text-xs leading-none">{"{{fieldName}}"}</code> for dynamic data.
              </p>
            </div>
          </>
        );

      case "sticker":
        return (
          <div className="flex flex-col gap-1">
            <Label htmlFor="stickerUrl">Sticker URL *</Label>
            <div className="relative pb-3.5">
              <Input
                id="stickerUrl"
                name="stickerUrl"
                type="url"
                value={formik.values.stickerUrl}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="Enter sticker URL (WebP format)"
                className={cn(
                  "xl:h-9",
                  formik.touched.stickerUrl && formik.errors.stickerUrl
                    ? "border-red-500"
                    : ""
                )}
              />
              {formik.touched.stickerUrl && formik.errors.stickerUrl && (
                <p className="text-red-500 text-xs absolute left-0 -bottom-1">
                  {formik.errors.stickerUrl}
                </p>
              )}
            </div>
            <p className="text-zinc-600 text-xs leading-normal border border-solid border-zinc-200 bg-zinc-100 p-0.5 px-1.5 rounded-full w-fit">
              Sticker must be in WebP format
            </p>
          </div>
        );

      case "location":
        return (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <Label htmlFor="latitude">Latitude *</Label>
                <div className="relative pb-3.5">
                  <Input
                    id="latitude"
                    name="latitude"
                    type="number"
                    step="any"
                    value={formik.values.latitude}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="e.g., 37.7749"
                    className={cn(
                      "xl:h-9",
                      formik.touched.latitude && formik.errors.latitude
                        ? "border-red-500"
                        : ""
                    )}
                  />
                  {formik.touched.latitude && formik.errors.latitude && (
                    <p className="text-red-500 text-xs absolute left-0 -bottom-1">
                      {formik.errors.latitude}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <Label htmlFor="longitude">Longitude *</Label>
                <div className="relative pb-3.5">
                  <Input
                    id="longitude"
                    name="longitude"
                    type="number"
                    step="any"
                    value={formik.values.longitude}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="e.g., -122.4194"
                    className={cn(
                      "xl:h-9",
                      formik.touched.longitude && formik.errors.longitude
                        ? "border-red-500"
                        : ""
                    )}
                  />
                  {formik.touched.longitude && formik.errors.longitude && (
                    <p className="text-red-500 text-xs absolute left-0 -bottom-1">
                      {formik.errors.longitude}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <Label htmlFor="locationName">Location Name (Optional)</Label>
              <div className="relative pb-3.5">
                <Input
                  id="locationName"
                  name="locationName"
                  value={formik.values.locationName}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="e.g., San Francisco"
                  className="xl:h-9"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <Label htmlFor="locationAddress">Address (Optional)</Label>
              <div className="relative pb-3.5">
                <Textarea
                  id="locationAddress"
                  name="locationAddress"
                  value={formik.values.locationAddress}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="Enter full address"
                  rows={2}
                />
              </div>
            </div>
          </>
        );

      default:
        return (
          <div className="text-center text-gray-500 py-8">
            Please select a message type to continue
          </div>
        );
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={handleClose}>
      <SheetContent className="sm:max-w-xl flex flex-col">
        <SheetHeader className={"border-b border-solid border-gray-200"}>
          <SheetTitle className="flex items-center gap-2">
            {title}
            <Badge variant="outline" className={getTypeColor(type)}>
              {type.toUpperCase()}
            </Badge>
            {type === "whatsapp" && (
              <Badge variant="outline" className="ml-auto">
                Step {currentStep} of 2
              </Badge>
            )}
          </SheetTitle>
          <SheetDescription>{description}</SheetDescription>
        </SheetHeader>

        <form
          onSubmit={formik.handleSubmit}
          className="w-full flex flex-col h-96 grow"
        >
          <div className="p-4 pt-0 h-96 flex flex-col gap-4 grow overflow-y-auto">
            {/* Basic Information - Always visible */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <Label htmlFor="name">Template Name *</Label>
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

              <div className="flex flex-col gap-1">
                <Label htmlFor="typeId">Template Type *</Label>
                <div className="relative pb-3.5">
                  <Select
                    value={formik.values.typeId}
                    onValueChange={(value) =>
                      formik.setFieldValue("typeId", value)
                    }
                  >
                    <SelectTrigger
                      className={cn(
                        "w-full",
                        formik.touched.typeId && formik.errors.typeId
                          ? "border-red-500"
                          : ""
                      )}
                    >
                      <SelectValue placeholder="Select template type" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableTypes.map((templateType) => (
                        <SelectItem
                          key={templateType._id}
                          value={templateType._id}
                        >
                          {templateType.typeName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formik.touched.typeId && formik.errors.typeId && (
                    <p className="text-red-500 text-xs absolute left-0 -bottom-1">
                      {formik.errors.typeId}
                    </p>
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
                    <Input
                      id="subject"
                      name="subject"
                      value={formik.values.subject}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      placeholder="Enter email subject"
                      className={
                        formik.touched.subject && formik.errors.subject
                          ? "border-red-500"
                          : ""
                      }
                    />
                    {formik.touched.subject && formik.errors.subject && (
                      <p className="text-red-500 text-xs absolute left-0 -bottom-1">
                        {formik.errors.subject}
                      </p>
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
                      onChange={(value) =>
                        formik.setFieldValue("content", value)
                      }
                      onBlur={() => formik.setFieldTouched("content", true)}
                      modules={textEditormodule.modules}
                      className="w-full min-h-72 flex flex-col [&>.ql-container.ql-snow]:flex [&>.ql-container.ql-snow]:flex-col [&>.ql-container>.ql-editor]:grow [&>.ql-toolbar.ql-snow]:rounded-t-xl [&>.ql-container.ql-snow]:rounded-b-xl [&>.ql-container.ql-snow]:flex-grow"
                    />
                    <p className="text-zinc-600 text-xs leading-normal border border-solid border-zinc-200 bg-zinc-100 p-0.5 px-1.5 rounded-full w-fit mt-1">
                      Use{" "}
                      <code className="bg-zinc-500 rounded-full px-1 py-0.5 text-white font-mono text-xs leading-none">
                        {"{{fieldName}}"}
                      </code>{" "}
                      for dynamic data.
                    </p>
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
                  <Textarea
                    placeholder="Plain text version for email clients that don't support HTML"
                    id="text"
                    name="text"
                    value={formik.values.text}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                </div>
              </>
            )}

            {/* SMS Specific Fields */}
            {type === "sms" && (
              <div className="flex flex-col gap-1">
                <Label htmlFor="text">Message Text *</Label>
                <div className="relative pb-3.5">
                  <textarea
                    id="text"
                    name="text"
                    value={formik.values.text}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="Enter your SMS message text"
                    rows={6}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      formik.touched.text && formik.errors.text
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  />
                  {formik.touched.text && formik.errors.text && (
                    <p className="text-red-500 text-xs absolute left-0 -bottom-1">
                      {formik.errors.text}
                    </p>
                  )}
                </div>
                <p className="text-zinc-600 text-xs leading-normal border border-solid border-zinc-200 bg-zinc-100 p-0.5 px-1.5 rounded-full w-fit">
                  Use{" "}
                  <code className="bg-zinc-500 rounded-full px-1 py-0.5 text-white font-mono text-xs leading-none">
                    {"{{fieldName}}"}
                  </code>{" "}
                  for dynamic data.
                </p>
              </div>
            )}

            {/* WhatsApp Step-based Form */}
            {type === "whatsapp" && (
              <>
                {/* Step 1: Phone Number and Message Type */}
                {currentStep === 1 && (
                  <>
                    <div className="flex flex-col gap-1">
                      <Label htmlFor="phoneNumber">Default Phone Number *</Label>
                      <CustomCombobox
                        name="phoneNumber"
                        value={formik.values.phoneNumber}
                        onChange={(value) =>
                          formik.setFieldValue("phoneNumber", value)
                        }
                        onBlur={() =>
                          formik.setFieldTouched("phoneNumber", true)
                        }
                        valueKey="value"
                        labelKey="title"
                        options={phoneNumberOptions || []}
                        placeholder="Select Phone Number"
                        id="phoneNumber"
                      />
                      {formik.touched.phoneNumber &&
                        formik.errors.phoneNumber && (
                          <p className="text-sm text-red-500">
                            {formik.errors.phoneNumber}
                          </p>
                        )}
                    </div>

                    <div className="flex flex-col gap-1">
                      <Label htmlFor="messageType">Message Type *</Label>
                      <CustomCombobox
                        name="messageType"
                        value={formik.values.messageType}
                        onChange={(value) =>
                          formik.setFieldValue("messageType", value)
                        }
                        onBlur={() =>
                          formik.setFieldTouched("messageType", true)
                        }
                        valueKey="value"
                        labelKey="title"
                        options={messageTypeOptions || []}
                        placeholder="Select Message Type"
                        id="messageType"
                      />
                      {formik.touched.messageType &&
                        formik.errors.messageType && (
                          <p className="text-sm text-red-500">
                            {formik.errors.messageType}
                          </p>
                        )}
                    </div>
                  </>
                )}

                {/* Step 2: Dynamic fields based on message type */}
                {currentStep === 2 && renderWhatsAppMessageFields()}
              </>
            )}
          </div>

          {/* Footer Buttons */}
          <div className="flex justify-between space-x-2 p-4 bg-white border-t border-solid border-gray-200 shadow-[0_-4px_4px_0_rgba(0,0,0,0.07)]">
            <div>
              {type === "whatsapp" && currentStep === 2 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePrevStep}
                  disabled={isSubmitting}
                >
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Previous
                </Button>
              )}
            </div>
            <div className="flex space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              {type === "whatsapp" && currentStep === 1 ? (
                <Button
                  type="button"
                  onClick={handleNextStep}
                  disabled={
                    !formik.values.phoneNumber || !formik.values.messageType
                  }
                >
                  Next
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {isSubmitting ? "Saving..." : submitButtonText}
                </Button>
              )}
            </div>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
};