"use client";

import React, { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X, Plus, Trash2 } from "lucide-react";
import { labelToName } from "@/lib/form-utils";
import { CustomCombobox } from "../common/customcombox";

/**
 * Element Properties Component with Formik & Yup
 * Side panel for editing selected form element properties
 */

const fieldTypeOptions = [
  { value: "text", title: "Text" },
  { value: "textarea", title: "Textarea" },
  { value: "email", title: "Email" },
  { value: "number", title: "Number" },
  { value: "date", title: "Date" },
  { value: "checkbox", title: "Checkbox" },
  { value: "radio", title: "Radio" },
  { value: "select", title: "Select" },
  { value: "file", title: "File" },
  { value: "password", title: "Password" },
  { value: "url", title: "URL" },
  { value: "tel", title: "Telephone" },
  { value: "hidden", title: "Hidden" },
];
const BooleanOptions = [
  { value: "yes", title: "Yes" },
  { value: "no", title: "No" },
];

const userType = [
  { value: "Event Attendee", title: "Event Attendee" },
  { value: "Exhibiting Company", title: "Exhibiting Company" },
  { value: "Sponsor", title: "Sponsor" },
  { value: "Speaker", title: "Speaker" },
  { value: "Service Provider", title: "Service Provider" },
  { value: "Accompanying", title: "Accompanying" },
];
export function ElementProperties({ element, onSave, onClose }) {
  const [validationRules, setValidationRules] = useState([]);

  // Determine element type flags
  const needsOptions =
    element && ["select", "radio", "checkbox"].includes(element.type);
  const isContentElement =
    element && ["heading", "paragraph"].includes(element.type);
  const isDivider = element && element.type === "divider";

  // Dynamic validation schema based on element type
  const validationSchema = Yup.object({
    fieldTitle: Yup.string().required("Field Title is required"),
    fieldName:
      !isContentElement && !isDivider
        ? Yup.string().required("Field Name is required")
        : Yup.string(),
    placeholder: Yup.string(),
    fieldDescription: Yup.string(),
    required: Yup.boolean(),
    defaultValue: Yup.string(),
    content: isContentElement
      ? Yup.string().required("Content is required")
      : Yup.string(),
    headingLevel:
      element?.type === "heading"
        ? Yup.string().required("Heading level is required")
        : Yup.string(),
    options: needsOptions
      ? Yup.array()
          .of(
            Yup.object({
              fieldTitle: Yup.string().required("Option title is required"),
              value: Yup.string().required("Option value is required"),
            })
          )
          .min(1, "At least one option is required")
      : Yup.array(),
  });

  const formik = useFormik({
    initialValues: {
      fieldName: "",
      fieldType: "",
      isRequired: false,
      placeHolder: "",
      requiredErrorText: "",
      fieldOptions: [],
      userType: [],
      fieldDescription: "",
      fieldminLimit: "",
      fieldmaxLimit: "",
      fieldTitle: "",
      specialCharactor: false,
    },
    validationSchema,
    onSubmit: (values) => {
      const updatedElement = {
        ...element,
        fieldTitle: values.fieldTitle,
        fieldName: values.fieldName,
        fieldType: values.fieldType,
        placeHolder: values.placeHolder,
        fieldDescription: values.fieldDescription,
        required: values.required,
        defaultValue: values.defaultValue,
        options: values.options,
        content: values.content,
        headingLevel: values.headingLevel,
        validation: validationRules.filter(
          (rule) => rule.type && (rule.type === "required" || rule.message)
        ),
      };

      onSave(updatedElement);
    },
  });

  // Reset form when element changes
  useEffect(() => {
    if (element) {
      formik.resetForm();
      formik.setValues({
        fieldTitle: element.fieldTitle || "",
        fieldName: element.fieldName || "",
        placeholder: element.placeHolder || "",
        fieldDescription: element.fieldDescription || "",
        required: element.required || false,
        defaultValue: element.defaultValue || "",
        fieldType: element.fieldType || "text",
        options: element.options || [],
        content: element.content || "",
        headingLevel: element.headingLevel || "h2",
      });
      setValidationRules(element.validation || []);
    }
  }, [element]);

  // Auto-generate field name from field title
  const handleFieldTitleChange = (e) => {
    const value = e.target.value;
    formik.setFieldValue("fieldTitle", value);
    formik.setFieldValue("fieldName", labelToName(value));
  };

  // Handle option changes
  const handleOptionChange = (index, field, value) => {
    const newOptions = [...formik.values.options];
    newOptions[index] = { ...newOptions[index], [field]: value };

    // Auto-generate value from fieldTitle
    if (field === "fieldTitle") {
      newOptions[index].value = labelToName(value);
    }

    formik.setFieldValue("options", newOptions);
  };

  const addOption = () => {
    const newOption = { fieldTitle: "", value: "" };
    formik.setFieldValue("options", [...formik.values.options, newOption]);
  };

  const removeOption = (index) => {
    const newOptions = formik.values.options.filter((_, i) => i !== index);
    formik.setFieldValue("options", newOptions);
  };

  // Validation rules handlers
  const addValidationRule = () => {
    const newRule = { type: "required", value: "", message: "" };
    setValidationRules((prev) => [...prev, newRule]);
  };

  const updateValidationRule = (index, field, value) => {
    const newRules = [...validationRules];
    newRules[index] = { ...newRules[index], [field]: value };
    setValidationRules(newRules);
  };

  const removeValidationRule = (index) => {
    setValidationRules((prev) => prev.filter((_, i) => i !== index));
  };

  if (!element) {
    return (
      <div className="w-80 bg-gray-50 border-l border-gray-200 p-4 content-center sticky top-0">
        <div className="text-center text-gray-500">
          <p className="text-sm">Select an element to edit its properties</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-60 xl:w-80 bg-white border-l border-gray-200 flex flex-col sticky top-0 overflow-auto">
      <Card className="border-0 rounded-none grow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4">
          <CardTitle className="text-base xl:text-lg">
            Element Properties
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="space-y-6">
          <form onSubmit={formik.handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="fieldTitle">Field Title</Label>
              <Input
                id="fieldTitle"
                name="fieldTitle"
                placeholder="Enter field title"
                value={formik.values.fieldTitle}
                onChange={handleFieldTitleChange}
                onBlur={formik.handleBlur}
                className="bg-white/50 backdrop-blur-sm border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200"
              />
              {formik.touched.fieldTitle && formik.errors.fieldTitle && (
                <p className="text-sm text-red-500">
                  {formik.errors.fieldTitle}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="fieldName">Field Name</Label>
              <Input
                id="fieldName"
                name="fieldName"
                placeholder="Enter field name"
                value={formik.values.fieldName}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="bg-white/50 backdrop-blur-sm border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200"
              />
              {formik.touched.fieldName && formik.errors.fieldName && (
                <p className="text-sm text-red-500">
                  {formik.errors.fieldName}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="fieldType">Field Type</Label>
              <CustomCombobox
                name="fieldType"
                value={formik.values.fieldType}
                onChange={(value) => formik.setFieldValue("fieldType", value)}
                onBlur={() => formik.setFieldTouched("fieldType", true)}
                valueKey="value"
                labelKey="title"
                options={fieldTypeOptions || []}
                placeholder="Select Field Type"
                id="fieldType"
              />
              {formik.touched.fieldType && formik.errors.fieldType && (
                <p className="text-sm text-red-500">
                  {formik.errors.fieldType}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="isRequired">Is Field Required?</Label>
              <CustomCombobox
                name="isRequired"
                value={formik.values.isRequired}
                onChange={(value) => formik.setFieldValue("isRequired", value)}
                valueKey="value"
                labelKey="title"
                search={false}
                options={BooleanOptions || []}
                placeholder="Select Field Required"
                id="isRequired"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="placeHolder">Place Holder</Label>
              <Input
                id="placeHolder"
                name="placeHolder"
                type="text"
                placeholder="Enter placeHolder address"
                value={formik.values.placeHolder}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="bg-white/50 backdrop-blur-sm border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200"
              />
              {formik.touched.placeHolder && formik.errors.placeHolder && (
                <p className="text-sm text-red-500">
                  {formik.errors.placeHolder}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="requiredErrorText">Required Error Text</Label>
              <Input
                id="requiredErrorText"
                name="requiredErrorText"
                type="text"
                placeholder="Enter requiredErrorText address"
                value={formik.values.requiredErrorText}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="bg-white/50 backdrop-blur-sm border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200"
              />
            </div>

            {["radio", "checkbox", "select"].includes(
              formik.values.fieldType
            ) && (
              <div className="space-y-2">
                <Label>Options</Label>

                <div className="space-y-2">
                  {formik.values.fieldOptions?.map((opt, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input
                        type="text"
                        value={opt}
                        onChange={(e) => {
                          const newOptions = [...formik.values.fieldOptions];
                          newOptions[index] = e.target.value;
                          formik.setFieldValue("fieldOptions", newOptions);
                        }}
                        placeholder={`Option ${index + 1}`}
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        onClick={() => {
                          const newOptions = formik.values.fieldOptions.filter(
                            (_, i) => i !== index
                          );
                          formik.setFieldValue("fieldOptions", newOptions);
                        }}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      formik.setFieldValue("fieldOptions", [
                        ...(formik.values.fieldOptions || []),
                        "",
                      ])
                    }
                  >
                    + Add Option
                  </Button>
                </div>

                {formik.touched.fieldOptions && formik.errors.fieldOptions && (
                  <p className="text-sm text-red-500">
                    {formik.errors.fieldOptions}
                  </p>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="fieldDescription">Field Description</Label>
              <Input
                id="fieldDescription"
                name="fieldDescription"
                type="text"
                placeholder="Enter Field Description address"
                value={formik.values.fieldDescription}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="bg-white/50 backdrop-blur-sm border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fieldminLimit">Field Minum length</Label>
              <Input
                id="fieldminLimit"
                name="fieldminLimit"
                type="text"
                placeholder="Enter Field Minimum Lenght"
                value={formik.values.fieldminLimit}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="bg-white/50 backdrop-blur-sm border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fieldmaxLimit">Field Maximum length </Label>
              <Input
                id="fieldmaxLimit"
                name="fieldmaxLimit"
                type="text"
                placeholder="Enter Field Maximum Lenght"
                value={formik.values.fieldmaxLimit}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="bg-white/50 backdrop-blur-sm border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="specialCharactor">Is special Charactor?</Label>
              <CustomCombobox
                name="specialCharactor"
                value={formik.values.specialCharactor}
                onChange={(value) =>
                  formik.setFieldValue("specialCharactor", value)
                }
                valueKey="value"
                labelKey="title"
                search={false}
                options={BooleanOptions || []}
                placeholder="Select Field Required"
                id="specialCharactor"
              />
            </div>

            {/* Save Button */}
            <div className="pt-4 border-t">
              <Button type="submit" className="w-full">
                Save Changes
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
