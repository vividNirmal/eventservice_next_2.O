"use client";
import React, { useState, useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import dynamic from "next/dynamic";
import { useRouter, useParams, useSearchParams } from "next/navigation";
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
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Loader2,
  Paperclip,
  X,
  Upload,
  Plus,
  Minus,
  ArrowLeft,
} from "lucide-react";
import { textEditormodule } from "@/lib/constant";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { postRequest, updateRequest, getRequest } from "@/service/viewService";
import { toast } from "sonner";

// Dynamically import ReactQuill
const ReactQuill = dynamic(() => import("react-quill-new"), {
  ssr: false,
});

export default function CreateUserTemplate({
  eventId,
  templateId,
  templateType,
}) {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  console.log("templateType>>>>>>>>>>>>>", templateType);
  const isEdit = !!templateId;

  const [availableTypes, setAvailableTypes] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const [loading, setLoading] = useState(isEdit);
  const [initialData, setInitialData] = useState(null);

  // Fetch template data if in edit mode and template types
  useEffect(() => {
    fetchTemplateTypes();
    if (isEdit) {
      fetchTemplateData();
    }
  }, [isEdit, templateId]);

  const fetchTemplateData = async () => {
    try {
      const response = await getRequest(`user-templates/${templateId}`);
      if (response.status === 1) {
        console.log("Fetched template data:", response.data);
        setInitialData(response.data);

        // Initialize attachments from fetched data - preserve original structure
        if (response.data.attachments) {
          const existingAttachments = response.data.attachments.map((att) => ({
            // Preserve all original fields exactly as they come from backend
            filename: att.filename,
            originalName: att.originalName,
            mimetype: att.mimetype,
            size: att.size,
            path: att.path,
            uploadedAt: att.uploadedAt,
            // Add frontend-only fields
            id: Math.random().toString(36).substr(2, 9),
            isExisting: true,
          }));

          setAttachments(existingAttachments);
        }
      }
    } catch (error) {
      console.error("Error fetching template:", error);
      toast.error("Failed to load template data");
    } finally {
      setLoading(false);
    }
  };

  const fetchTemplateTypes = async () => {
    try {
      const params = new URLSearchParams({
        type: templateType,
        status: "active",
      });

      const response = await getRequest(`template-types?${params}`);
      if (response.status === 1) {
        setAvailableTypes(response.data.templateTypes || []);
      }
    } catch (error) {
      console.error("Error fetching template types:", error);
      toast.error("Failed to fetch template types");
    }
  };

  // Validation schema
  const validationSchema = Yup.object({
    name: Yup.string().required("Template name is required"),
    typeId: Yup.string().required("Template type is required"),
    formName: Yup.string().optional(),
    ...(templateType === "email" && {
      subject: Yup.string().required("Subject is required for email templates"),
      content: Yup.string().required(
        "HTML content is required for email templates"
      ),
    }),
    ...((templateType === "sms" || templateType === "whatsapp") && {
      text: Yup.string().required("Text content is required"),
    }),
    defaultOption: Yup.object({
      used: Yup.boolean(),
      cc: Yup.array().of(Yup.string().email("Invalid email address")),
      bcc: Yup.array().of(Yup.string().email("Invalid email address")),
    }),
  });

  const formik = useFormik({
    initialValues: {
      name: initialData?.name || "",
      typeId: initialData?.typeId?._id || "",
      formName: initialData?.formName || "",
      subject: initialData?.subject || "",
      content: initialData?.content || "",
      text: initialData?.text || "",
      defaultOption: {
        used: initialData?.defaultOption?.used || false,
        cc: initialData?.defaultOption?.cc || [""],
        bcc: initialData?.defaultOption?.bcc || [""],
      },
      eventId: initialData?.eventId || eventId || null, // 👈 Add this line
      companyId:
        initialData?.companyId || localStorage.getItem("companyId") || null,
    },
    validationSchema,
    onSubmit: async (values) => {
      await handleSubmit(values);
    },
    enableReinitialize: true,
  });

  const handleFileUpload = (files) => {
    const newAttachments = Array.from(files).map((file) => ({
      file, // Store the actual File object for new uploads
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      type: file.type,
      isExisting: false, // Flag to identify new attachments
    }));

    setAttachments((prev) => [...prev, ...newAttachments]);
  };

  const removeAttachment = (index) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (values) => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();

      // Append basic fields
      formData.append("name", values.name);
      formData.append("typeId", values.typeId);
      formData.append("formName", values.formName);
      formData.append("type", templateType);
      formData.append("status", "active");

      // Append event and company IDs
      formData.append("eventId", values.eventId);
      formData.append("companyId", values.companyId);

      // Append type-specific fields
      if (templateType === "email") {
        formData.append("subject", values.subject);
        formData.append("content", values.content);

        // Separate existing and new attachments
        const existingAttachments = attachments
          .filter((att) => att.isExisting)
          .map(
            ({ id, isExisting, ...originalAttachment }) => originalAttachment
          ); // Remove frontend-only fields

        const newAttachments = attachments.filter((att) => !att.isExisting);

        // Append existing attachments metadata
        if (existingAttachments.length > 0) {
          formData.append(
            "existingAttachments",
            JSON.stringify(existingAttachments)
          );
        }

        // Append new attachments as files
        newAttachments.forEach((attachment) => {
          formData.append("attachments", attachment.file);
        });
      }

      if (values.text) {
        formData.append("text", values.text);
      }

      // Append default option (filter out empty strings)
      const defaultOption = {
        used: values.defaultOption.used,
        cc: values.defaultOption.cc.filter((email) => email.trim() !== ""),
        bcc: values.defaultOption.bcc.filter((email) => email.trim() !== ""),
      };
      formData.append("defaultOption", JSON.stringify(defaultOption));

      let response;
      if (isEdit) {
        response = await updateRequest(
          `user-templates/${templateId}`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
      } else {
        response = await postRequest("user-templates", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      }

      if (response.status === 1) {
        toast.success(
          `Template ${isEdit ? "updated" : "created"} successfully`
        );
        router.push(`/dashboard/event-host/${eventId}/email-management`);
      } else {
        toast.error(`Failed to ${isEdit ? "update" : "create"} template`);
      }
    } catch (error) {
      console.error("Error saving template:", error);
      toast.error(`Failed to ${isEdit ? "update" : "create"} template`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  // Handle adding new CC/BCC fields
  const addEmailField = (fieldType) => {
    const currentEmails = formik.values.defaultOption[fieldType];
    formik.setFieldValue(`defaultOption.${fieldType}`, [...currentEmails, ""]);
  };

  // Handle removing CC/BCC fields
  const removeEmailField = (fieldType, index) => {
    const currentEmails = formik.values.defaultOption[fieldType];
    const newEmails = currentEmails.filter((_, i) => i !== index);
    formik.setFieldValue(`defaultOption.${fieldType}`, newEmails);
  };

  // Handle CC/BCC input changes
  const handleEmailChange = (fieldType, index, value) => {
    const currentEmails = [...formik.values.defaultOption[fieldType]];
    currentEmails[index] = value;
    formik.setFieldValue(`defaultOption.${fieldType}`, currentEmails);
  };

  const getTypeColor = (type) => {
    const colors = {
      email: "bg-blue-100 text-blue-800 border-blue-200",
      sms: "bg-green-100 text-green-800 border-green-200",
      whatsapp: "bg-purple-100 text-purple-800 border-purple-200",
    };
    return colors[type] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  const getTypeDisplayName = (type) => {
    const names = {
      email: "Email",
      sms: "SMS",
      whatsapp: "WhatsApp",
    };
    return names[type] || type;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCancel}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              {isEdit ? "Edit Template" : "Create Template"}
              <Badge variant="outline" className={getTypeColor(templateType)}>
                {getTypeDisplayName(templateType).toUpperCase()}
              </Badge>
            </h1>
            <p className="text-muted-foreground">
              {isEdit
                ? `Update your ${getTypeDisplayName(
                    templateType
                  ).toLowerCase()} template details.`
                : `Create a new ${getTypeDisplayName(
                    templateType
                  ).toLowerCase()} template for your communications.`}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={formik.handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form Content */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Template Information</CardTitle>
                <CardDescription>
                  Basic details and content for your template
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <Label htmlFor="name">Template Name *</Label>
                    <div className="relative">
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
                        <p className="text-red-500 text-xs mt-1">
                          {formik.errors.name}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <Label htmlFor="typeId">Template Type *</Label>
                    <div className="relative">
                      <Select
                        key={formik.values.typeId}
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
                          {availableTypes.map((templateTypeItem) => (
                            <SelectItem
                              key={templateTypeItem._id}
                              value={templateTypeItem._id}
                            >
                              {templateTypeItem.typeName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {formik.touched.typeId && formik.errors.typeId && (
                        <p className="text-red-500 text-xs mt-1">
                          {formik.errors.typeId}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <Label htmlFor="formName">Form Name</Label>
                  <div className="relative">
                    <Input
                      id="formName"
                      name="formName"
                      value={formik.values.formName}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      placeholder="Enter form name"
                      className={
                        formik.touched.formName && formik.errors.formName
                          ? "border-red-500"
                          : ""
                      }
                    />
                    {formik.touched.formName && formik.errors.formName && (
                      <p className="text-red-500 text-xs mt-1">
                        {formik.errors.formName}
                      </p>
                    )}
                  </div>
                </div>

                {/* Email Specific Fields */}
                {templateType === "email" && (
                  <>
                    <div className="flex flex-col gap-1">
                      <Label htmlFor="subject">Subject *</Label>
                      <div className="relative">
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
                          <p className="text-red-500 text-xs mt-1">
                            {formik.errors.subject}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col gap-1">
                      <Label htmlFor="content">HTML Content *</Label>
                      <div className="min-h-64 border rounded-md">
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
                          className="w-full min-h-64 flex flex-col [&>.ql-container.ql-snow]:flex [&>.ql-container.ql-snow]:flex-col [&>.ql-container>.ql-editor]:grow [&>.ql-toolbar.ql-snow]:rounded-t-md [&>.ql-container.ql-snow]:rounded-b-md [&>.ql-container.ql-snow]:flex-grow"
                        />
                      </div>
                      {formik.touched.content && formik.errors.content && (
                        <p className="text-red-500 text-xs mt-1">
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
                        rows={3}
                      />
                    </div>
                  </>
                )}

                {/* SMS and WhatsApp Specific Fields */}
                {(templateType === "sms" || templateType === "whatsapp") && (
                  <div className="flex flex-col gap-1">
                    <Label htmlFor="text">Message Text *</Label>
                    <Textarea
                      id="text"
                      name="text"
                      value={formik.values.text}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      placeholder={`Enter your ${templateType} message text`}
                      rows={8}
                      className={
                        formik.touched.text && formik.errors.text
                          ? "border-red-500"
                          : ""
                      }
                    />
                    {formik.touched.text && formik.errors.text && (
                      <p className="text-red-500 text-xs mt-1">
                        {formik.errors.text}
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Attachments Section - Only for email */}
            {templateType === "email" && (
              <Card>
                <CardHeader>
                  <CardTitle>Attachments</CardTitle>
                  <CardDescription>
                    Add files to be sent with your email template
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* File Upload */}
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <input
                      type="file"
                      id="attachments"
                      multiple
                      onChange={(e) => handleFileUpload(e.target.files)}
                      className="hidden"
                    />
                    <label
                      htmlFor="attachments"
                      className="cursor-pointer block"
                    >
                      <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-lg font-medium text-gray-600 mb-2">
                        Upload Attachments
                      </p>
                      <p className="text-sm text-gray-500">
                        Click to upload attachments or drag and drop files here
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        All allowed file types for email attachments
                      </p>
                    </label>
                  </div>

                  {/* Attachments List */}
                  {attachments.map((attachment, index) => (
                    <div
                      key={attachment.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <Paperclip className="h-5 w-5 text-gray-400" />
                        <div>
                          <span className="text-sm font-medium block">
                            {attachment.originalName || attachment.name}
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatFileSize(attachment.size)} •{" "}
                            {attachment.mimetype || attachment.type}
                          </span>
                          {/* {attachment.path && (
                            <a
                              href={attachment.path}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-blue-600 hover:underline"
                            >
                              View File
                            </a>
                          )} */}
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeAttachment(index)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {templateType === "email" && (
              <Card>
                <CardHeader>
                  <CardTitle>Default Options</CardTitle>
                  <CardDescription>
                    Configure default settings for this template
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="used" className="text-sm font-medium">
                      Set default options
                    </Label>
                    <Switch
                      id="used"
                      checked={formik.values.defaultOption.used}
                      onCheckedChange={(checked) =>
                        formik.setFieldValue("defaultOption.used", checked)
                      }
                    />
                  </div>

                  {formik.values.defaultOption.used && (
                    <div className="space-y-4 pt-2">
                      {/* CC Emails */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="cc" className="text-sm font-medium">
                            CC Emails
                          </Label>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => addEmailField("cc")}
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            Add
                          </Button>
                        </div>
                        {formik.values.defaultOption.cc.map((email, index) => (
                          <div
                            key={index}
                            className="flex items-center space-x-2"
                          >
                            <Input
                              type="email"
                              placeholder="Enter CC email address"
                              value={email}
                              onChange={(e) =>
                                handleEmailChange("cc", index, e.target.value)
                              }
                              className="flex-1 text-sm"
                            />
                            {formik.values.defaultOption.cc.length > 1 && (
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => removeEmailField("cc", index)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* BCC Emails */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="bcc" className="text-sm font-medium">
                            BCC Emails
                          </Label>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => addEmailField("bcc")}
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            Add
                          </Button>
                        </div>
                        {formik.values.defaultOption.bcc.map((email, index) => (
                          <div
                            key={index}
                            className="flex items-center space-x-2"
                          >
                            <Input
                              type="email"
                              placeholder="Enter BCC email address"
                              value={email}
                              onChange={(e) =>
                                handleEmailChange("bcc", index, e.target.value)
                              }
                              className="flex-1 text-sm"
                            />
                            {formik.values.defaultOption.bcc.length > 1 && (
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => removeEmailField("bcc", index)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Actions Card */}
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full"
                >
                  {isSubmitting && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {isSubmitting
                    ? "Saving..."
                    : isEdit
                    ? "Update Template"
                    : "Create Template"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isSubmitting}
                  className="w-full"
                >
                  Cancel
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
