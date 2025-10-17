"use client";
import React, { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Upload, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { updateRequest } from "@/service/viewService";
import { cn } from "@/lib/utils";
import { getFieldKey, parseFieldOption } from "./fieldUtils";
import { DynamicSelect } from "@/components/form-builder/dynamicSelected";
import dynamic from "next/dynamic";

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });
import "react-quill-new/dist/quill.snow.css";

const RegistrationEditSheet = ({
  open,
  onOpenChange,
  registration,
  formFields,
  onSuccess,
}) => {
  const [editedData, setEditedData] = useState({});
  const [fileUploads, setFileUploads] = useState({});
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (registration && open) {
      setEditedData({
        ...registration.formData,
        // email: registration.email,
        approved: registration.approved,
      });
      setFileUploads({});
    }
  }, [registration, open]);

  const handleFieldChange = (fieldKey, value) => {
    setEditedData((prev) => ({
      ...prev,
      [fieldKey]: value,
    }));
  };

  const handleFileChange = (fieldKey, files) => {
    if (files && files[0]) {
      setFileUploads((prev) => ({
        ...prev,
        [fieldKey]: files[0],
      }));
    }
  };

  const handleFaceImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const allowedTypes = ["image/png", "image/jpeg", "image/jpg"];
      if (!allowedTypes.includes(file.type)) {
        toast.error("Only PNG and JPG files are allowed");
        return;
      }
      setFileUploads((prev) => ({
        ...prev,
        faceImage: file,
      }));
    }
  };

  const handleSave = async () => {
    if (!registration) return;

    setUpdating(true);
    try {
      const formData = new FormData();

      // Get all file field keys from formFields
      const fileFieldKeys = formFields
        .filter(field => field.fieldType === 'file')
        .map(field => getFieldKey(field));

      // Add all edited form data, EXCLUDING file fields that haven't changed
      Object.keys(editedData).forEach((key) => {
        const value = editedData[key];
        
        // Skip file fields that haven't been updated with new files
        if (fileFieldKeys.includes(key) && !fileUploads[key]) {
          return; // Don't send the old file path as string
        }
        
        if (value !== null && value !== undefined) {
          if (Array.isArray(value)) {
            value.forEach((item, index) => {
              formData.append(`${key}[${index}]`, item);
            });
          } else {
            formData.append(key, value);
          }
        }
      });

      // Add file uploads (new files)
      Object.keys(fileUploads).forEach((fieldName) => {
        const file = fileUploads[fieldName];
        if (file instanceof File) {
          formData.append(fieldName, file);
        }
      });

      const response = await updateRequest(
        `update-register-form/${registration._id}`,
        formData
      );

      if (response.status === 1) {
        toast.success("Registration updated successfully");
        onOpenChange(false);
        if (onSuccess) onSuccess();
      } else {
        toast.error(response.message || "Failed to update registration");
      }
    } catch (error) {
      console.error("Error updating registration:", error);
      toast.error("Failed to update registration");
    } finally {
      setUpdating(false);
    }
  };

  const renderEditField = (field) => {
    const fieldKey = getFieldKey(field);
    const value = editedData[fieldKey] || "";
    const {
      fieldType,
      fieldTitle,
      placeHolder,
      fieldDescription,
      fieldOptions,
      isRequired,
      fileType,
      fileSize,
    } = field;

    switch (fieldType) {
      case "textarea":
        return (
          <div className="space-y-2">
            <Label>
              {fieldTitle || fieldKey}
              {isRequired && <span className="text-red-500 ml-1">*</span>}
            </Label>
            {fieldDescription && (
              <p className="text-xs text-muted-foreground">
                {fieldDescription}
              </p>
            )}
            <Textarea
              value={value}
              onChange={(e) => handleFieldChange(fieldKey, e.target.value)}
              placeholder={placeHolder}
              rows={4}
              className="bg-white"
            />
          </div>
        );

      case "select":
        return (
          <div className="space-y-2">
            <Label>
              {fieldTitle || fieldKey}
              {isRequired && <span className="text-red-500 ml-1">*</span>}
            </Label>
            {fieldDescription && (
              <p className="text-xs text-muted-foreground">
                {fieldDescription}
              </p>
            )}
            <DynamicSelect
              element={field}
              value={value}
              onChange={(val) => handleFieldChange(fieldKey, val)}
              onBlur={() => {}}
              error={null}
              formValues={editedData}
            />
          </div>
        );

      case "radio":
        return (
          <div className="space-y-2">
            <Label>
              {fieldTitle || fieldKey}
              {isRequired && <span className="text-red-500 ml-1">*</span>}
            </Label>
            {fieldDescription && (
              <p className="text-xs text-muted-foreground">
                {fieldDescription}
              </p>
            )}
            <RadioGroup
              value={value}
              onValueChange={(val) => handleFieldChange(fieldKey, val)}
            >
              {fieldOptions?.map((option, idx) => {
                const { key: optionKey, value: optionLabel } =
                  parseFieldOption(option);
                return (
                  <div key={idx} className="flex items-center space-x-2">
                    <RadioGroupItem
                      value={optionKey}
                      id={`${fieldKey}-${idx}`}
                    />
                    <Label htmlFor={`${fieldKey}-${idx}`}>{optionLabel}</Label>
                  </div>
                );
              })}
            </RadioGroup>
          </div>
        );

      case "checkbox":
        const hasOptions = fieldOptions && fieldOptions.length > 0;

        if (hasOptions) {
          return (
            <div className="space-y-2">
              <Label>
                {fieldTitle || fieldKey}
                {isRequired && <span className="text-red-500 ml-1">*</span>}
              </Label>
              {fieldDescription && (
                <p className="text-xs text-muted-foreground">
                  {fieldDescription}
                </p>
              )}
              <div className="space-y-2">
                {fieldOptions.map((option, idx) => {
                  const { key: optionKey, value: optionLabel } =
                    parseFieldOption(option);
                  const isChecked = Array.isArray(value)
                    ? value.includes(optionKey)
                    : value === optionKey;

                  return (
                    <div key={idx} className="flex items-center space-x-2">
                      <Checkbox
                        id={`${fieldKey}-${idx}`}
                        checked={isChecked}
                        onCheckedChange={(checked) => {
                          let newValue;
                          if (Array.isArray(value)) {
                            newValue = checked
                              ? [...value, optionKey]
                              : value.filter((v) => v !== optionKey);
                          } else {
                            newValue = checked ? [optionKey] : [];
                          }
                          handleFieldChange(fieldKey, newValue);
                        }}
                      />
                      <Label htmlFor={`${fieldKey}-${idx}`}>
                        {optionLabel}
                      </Label>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        } else {
          return (
            <div className="flex items-center space-x-2">
              <Checkbox
                id={fieldKey}
                checked={value === true || value === "true"}
                onCheckedChange={(checked) =>
                  handleFieldChange(fieldKey, checked)
                }
              />
              <Label htmlFor={fieldKey}>
                {fieldTitle || fieldKey}
                {isRequired && <span className="text-red-500 ml-1">*</span>}
              </Label>
            </div>
          );
        }

      case "file":
        return (
          <div className="space-y-2">
            <Label>
              {fieldTitle || fieldKey}
              {isRequired && <span className="text-red-500 ml-1">*</span>}
            </Label>
            {fieldDescription && (
              <p className="text-xs text-muted-foreground">
                {fieldDescription}
              </p>
            )}
            {value && (
              <div className="mb-2">
                <p className="text-xs text-muted-foreground">Current file:</p>
                {fieldType === "image" ||
                value.includes(".jpg") ||
                value.includes(".png") ? (
                  <img
                    src={`${value}`}
                    alt={fieldTitle}
                    className="w-20 h-20 object-cover rounded border mt-1"
                  />
                ) : (
                  <p className="text-sm">{value}</p>
                )}
              </div>
            )}
            <Input
              type="file"
              accept={
                fileType
                  ? fileType.map((type) => `.${type}`).join(",")
                  : undefined
              }
              onChange={(e) => handleFileChange(fieldKey, e.target.files)}
              className="bg-white"
            />
            {(fileType || fileSize) && (
              <p className="text-xs text-muted-foreground">
                {fileType && `Allowed: ${fileType.join(", ")}`}
                {fileType && fileSize && " | "}
                {fileSize && `Max size: ${fileSize}`}
              </p>
            )}
          </div>
        );

      case "html":
        return (
          <div className="space-y-2">
            <Label>
              {fieldTitle || fieldKey}
              {isRequired && <span className="text-red-500 ml-1">*</span>}
            </Label>
            {fieldDescription && (
              <p className="text-xs text-muted-foreground">
                {fieldDescription}
              </p>
            )}
            <ReactQuill
              value={value}
              onChange={(content) => handleFieldChange(fieldKey, content)}
              placeholder={placeHolder}
              theme="snow"
              className="w-full min-h-64 flex flex-col 
              [&>.ql-container.ql-snow]:flex 
              [&>.ql-container.ql-snow]:flex-col 
              [&>.ql-container>.ql-editor]:grow 
              [&>.ql-toolbar.ql-snow]:rounded-t-md 
              [&>.ql-container.ql-snow]:rounded-b-md 
              [&>.ql-container.ql-snow]:flex-grow"
            />
          </div>
        );

      case "date":
        return (
          <div className="space-y-2">
            <Label>
              {fieldTitle || fieldKey}
              {isRequired && <span className="text-red-500 ml-1">*</span>}
            </Label>
            {fieldDescription && (
              <p className="text-xs text-muted-foreground">
                {fieldDescription}
              </p>
            )}
            <Input
              type="date"
              value={value}
              onChange={(e) => handleFieldChange(fieldKey, e.target.value)}
              className="bg-white"
            />
          </div>
        );

      case "password":
        return (
          <div className="space-y-2">
            <Label>
              {fieldTitle || fieldKey}
              {isRequired && <span className="text-red-500 ml-1">*</span>}
            </Label>
            {fieldDescription && (
              <p className="text-xs text-muted-foreground">
                {fieldDescription}
              </p>
            )}
            <Input
              type="password"
              value={value}
              onChange={(e) => handleFieldChange(fieldKey, e.target.value)}
              placeholder={placeHolder}
              className="bg-white"
            />
          </div>
        );

      case "hidden":
        return null;

      default:
        return (
          <div className="space-y-2">
            <Label>
              {fieldTitle || fieldKey}
              {isRequired && <span className="text-red-500 ml-1">*</span>}
            </Label>
            {fieldDescription && (
              <p className="text-xs text-muted-foreground">
                {fieldDescription}
              </p>
            )}
            <Input
              type={fieldType || "text"}
              value={value}
              onChange={(e) => handleFieldChange(fieldKey, e.target.value)}
              placeholder={placeHolder}
              className="bg-white"
            />
          </div>
        );
    }
  };

  if (!registration) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl pr-2">
        <SheetHeader className={'pb-0 gap-0'}>
          <SheetTitle className={"text-base md:text-lg xl:text-xl font-bold mb-0"}>Edit Registration</SheetTitle>
          <SheetDescription >
            Update registration information
          </SheetDescription>
        </SheetHeader>
        <div className="space-y-6 p-4 pt-0 h-20 grow overflow-auto custom-scroll">
          {/* Basic Information */}

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>
                Email <span className="text-red-500">*</span>
              </Label>
              <Input
                type="email"
                value={registration.email || ""}
                // onChange={(e) => handleFieldChange("email", e.target.value)}
                disabled
                className="bg-white"
              />
            </div>

            <div className="space-y-2">
              <Label>Badge Number</Label>
              <Input
                value={registration.badgeNo || ""}
                disabled
                className="bg-gray-50"
              />
            </div>
          </div>

          {/* Dynamic Form Fields */}
          {formFields.length > 0 && (
            <div className="space-y-4">
              <div className="space-y-4">
                {formFields.map((field) => (
                  <div key={field._id}>{renderEditField(field)}</div>
                ))}
              </div>
            </div>
          )}

          {/* Face Image */}
          {registration.faceImageUrl && (
            <div className="space-y-4">
              <Label className={'mb-0'}>Face Image</Label>

              <div className="space-y-4">
                {fileUploads.faceImage && (
                  <div className="text-sm text-green-600">
                    New image selected: {fileUploads.faceImage.name}
                  </div>
                )}

                <div>
                  <Label htmlFor="faceImage" className="cursor-pointer">
                    <div className="flex items-center space-x-2 px-4 py-2 border rounded-md hover:bg-gray-50 w-fit">
                      <Upload className="h-4 w-4" />
                      <span>Upload New Face Image</span>
                    </div>
                    <input
                      id="faceImage"
                      type="file"
                      accept="image/png, image/jpeg, image/jpg"
                      onChange={handleFaceImageUpload}
                      className="hidden"
                    />
                  </Label>
                </div>
              </div>
            </div>
          )}
        </div>
        <SheetFooter className="flex flex-row justify-end gap-3 shadow-[0_-4px_4px_0_rgba(0,0,0,0.12)]">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={updating}>Cancel</Button>
          <Button onClick={handleSave} disabled={updating}>
            {updating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : ("Save Changes")}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default RegistrationEditSheet;
