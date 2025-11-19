// components/campaign/UserCampaignSheet.js
"use client";
import { useEffect, useState, useCallback } from "react";
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
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, UploadCloud, X } from "lucide-react";
import { toast } from "sonner";
import { getRequest, postRequest, updateRequest } from "@/service/viewService";

export const UserCampaignSheet = ({
  isOpen,
  onClose,
  onSuccess,
  initialData,
  eventId,
}) => {
  const [templates, setTemplates] = useState([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [excelFile, setExcelFile] = useState(null);

  // Fix: Create the validation schema outside of useFormik to avoid recreation on every render
  const validationSchema = Yup.object({
    name: Yup.string().required("Name is required"),
    templateId: Yup.string().required("Template is required"),
    scheduled: Yup.boolean(),
    scheduledAt: Yup.string().when("scheduled", {
      is: true,
      then: (schema) =>
        schema.required(
          "Schedule date and time is required when scheduling is enabled"
        ),
      otherwise: (schema) => schema.notRequired(),
    }),
  });

  const formik = useFormik({
    initialValues: {
      name: initialData?.name || "",
      templateId: initialData?.templateId?._id || initialData?.templateId || "",
      scheduled: initialData?.scheduled || false,
      scheduledAt: initialData?.scheduledAt
        ? // Convert UTC to local time for display
          new Date(initialData.scheduledAt).toLocaleString('sv-SE').slice(0, 16).replace(' ', 'T')
        : "",
    },
    validationSchema,
    onSubmit: async (values) => {
      if (!excelFile && !initialData) {
        toast.error("Excel file is required");
        return;
      }

      setIsSubmitting(true);
      try {
        const formData = new FormData();
        formData.append("name", values.name);
        formData.append("templateId", values.templateId);
        formData.append("scheduled", values.scheduled);
        formData.append("eventId", eventId);
        formData.append("companyId", localStorage.getItem("companyId"));

         if (values.scheduled && values.scheduledAt) {
          formData.append("scheduledAt", new Date(values.scheduledAt).toISOString());
        }
        if (excelFile) {
          formData.append("excelFile", excelFile);
        }

        let response;
        if (initialData) {
          response = await updateRequest(
            `user-campaigns/${initialData._id}`,
            formData
          );
        } else {
          response = await postRequest("user-campaigns", formData);
        }

        if (response.status === 1) {
          toast.success(
            `Campaign ${initialData ? "updated" : "created"} successfully`
          );
          onSuccess();
          
          formik.resetForm();
          setExcelFile(null);

          onClose();
        } else {
          toast.error(
            response.message ||
              `Failed to ${initialData ? "update" : "create"} campaign`
          );
        }
      } catch (err) {
        console.error("Error submitting campaign:", err);
        toast.error(`Failed to ${initialData ? "update" : "create"} campaign`);
      } finally {
        setIsSubmitting(false);
      }
    },
    enableReinitialize: true,
  });

  useEffect(() => {
    if (isOpen) {
      fetchTemplates();
      // Reset file when opening for creation
      if (!initialData) {
        setExcelFile(null);
      }
    }
  }, [isOpen, initialData]);

  const fetchTemplates = async () => {
    setLoadingTemplates(true);
    try {
      const response = await getRequest(
        `user-templates?eventId=${eventId}&type=email&limit=100`
      );
      if (response.status === 1) {
        setTemplates(response.data.templates || []);
      }
    } catch (err) {
      console.error("Error fetching templates:", err);
      toast.error("Failed to fetch templates");
    } finally {
      setLoadingTemplates(false);
    }
  };

  const handleFileSelect = useCallback((files) => {
    if (!files || files.length === 0) return;

    const file = files[0];
    // Check if it's an Excel file
    if (!file.name.match(/\.(xlsx|xls)$/)) {
      toast.error("Please select a valid Excel file (.xlsx or .xls)");
      return;
    }

    setExcelFile(file);
  }, []);

  const handleRemoveFile = useCallback(() => {
    setExcelFile(null);
  }, []);

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="sm:max-w-lg flex flex-col">
        <SheetHeader className="border-b border-gray-200">
          <SheetTitle>
            {initialData ? "Edit Campaign" : "Create Campaign"}
          </SheetTitle>
          <SheetDescription>
            {initialData
              ? "Update your email campaign"
              : "Create a new email campaign"}
          </SheetDescription>
        </SheetHeader>

        <form
          onSubmit={formik.handleSubmit}
          className="flex flex-col grow gap-4 p-6 overflow-y-auto"
        >
          <div>
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              name="name"
              value={formik.values.name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="Enter campaign name"
            />
            {formik.touched.name && formik.errors.name && (
              <p className="text-red-500 text-xs mt-1">{formik.errors.name}</p>
            )}
          </div>

          <div>
            <Label htmlFor="templateId">Select Template *</Label>
            <Select
              value={formik.values.templateId}
              onValueChange={(value) =>
                formik.setFieldValue("templateId", value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a template" />
              </SelectTrigger>
              <SelectContent>
                {loadingTemplates ? (
                  <div className="flex items-center justify-center py-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                ) : templates.length === 0 ? (
                  <div className="py-2 text-center text-sm text-gray-500">
                    No templates found
                  </div>
                ) : (
                  templates.map((template) => (
                    <SelectItem key={template._id} value={template._id}>
                      {template.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {formik.touched.templateId && formik.errors.templateId && (
              <p className="text-red-500 text-xs mt-1">
                {formik.errors.templateId}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="scheduled" className="cursor-pointer">
              Schedule Campaign
            </Label>
            <Switch
              id="scheduled"
              checked={formik.values.scheduled}
              onCheckedChange={(checked) => {
                formik.setFieldValue("scheduled", checked);
                if (!checked) {
                  formik.setFieldValue("scheduledAt", "");
                }
              }}
            />
          </div>

          {formik.values.scheduled && (
            <div>
              <Label htmlFor="scheduledAt">Schedule Date & Time *</Label>
              <Input
                id="scheduledAt"
                name="scheduledAt"
                type="datetime-local"
                value={formik.values.scheduledAt}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                min={new Date().toISOString().slice(0, 16)}
              />
              {formik.touched.scheduledAt && formik.errors.scheduledAt && (
                <p className="text-red-500 text-xs mt-1">
                  {formik.errors.scheduledAt}
                </p>
              )}
            </div>
          )}

          <div>
            <Label>Excel File {!initialData && "*"}</Label>
            <label
              htmlFor="excelFile"
              className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
            >
              {excelFile || initialData?.excelFile ? (
                <div className="relative group w-full h-full flex items-center justify-center p-2">
                  <div className="text-center">
                    <p className="font-medium text-sm">
                      {excelFile ? excelFile.name : "File uploaded"}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {excelFile
                        ? "Click to change file"
                        : "File already uploaded"}
                    </p>
                  </div>
                  {excelFile && (
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-1 right-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={handleRemoveFile}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <UploadCloud className="w-8 h-8 mb-3 text-gray-500" />
                  <p className="text-xs text-gray-500">
                    <span className="font-semibold">Click to upload</span> or
                    drag and drop
                  </p>
                  <p className="text-xs text-gray-400">
                    Excel files only (.xlsx, .xls)
                  </p>
                </div>
              )}
              <input
                id="excelFile"
                type="file"
                className="hidden"
                accept=".xlsx,.xls"
                onChange={(e) => handleFileSelect(e.target.files)}
              />
            </label>
            {!excelFile && !initialData && formik.submitCount > 0 && (
              <p className="text-red-500 text-xs mt-1">
                Excel file is required
              </p>
            )}
          </div>

          <SheetFooter className="flex flex-row justify-end space-x-2 p-6 py-3 bg-white border-t border-gray-200 shadow-[0_-4px_4px_0_rgba(0,0,0,0.07)] mt-auto">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {isSubmitting ? "Saving..." : initialData ? "Update" : "Create"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
};
