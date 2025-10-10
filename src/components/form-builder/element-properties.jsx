"use client";

import React, { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, Plus, Trash2, Pencil } from "lucide-react";
import { labelToName } from "@/lib/form-utils";
import { CustomCombobox } from "../common/customcombox";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";
import { Textarea } from "../ui/textarea";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import dynamic from "next/dynamic";
const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

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
  { value: "html", title: "HTML" },
];
const optionRequestTypeOptions = [
  { value: "GET", title: "GET" },
  { value: "POST", title: "POST" },
  { value: "PUT", title: "PUT" },
];
const BooleanOptions = [
  { value: "yes", title: "Yes" },
  { value: "no", title: "No" },
];

const fileTypeOptions = [
  // Documents
  { value: "pdf", title: "PDF" },
  { value: "doc", title: "DOC" },
  { value: "docx", title: "DOCX" },
  { value: "txt", title: "TXT" },
  { value: "rtf", title: "RTF" },
  { value: "odt", title: "ODT" },

  // Spreadsheets
  { value: "xls", title: "XLS" },
  { value: "xlsx", title: "XLSX" },
  { value: "csv", title: "CSV" },
  { value: "ods", title: "ODS" },

  // Presentations
  { value: "ppt", title: "PPT" },
  { value: "pptx", title: "PPTX" },
  { value: "odp", title: "ODP" },

  // Images
  { value: "jpg", title: "JPG" },
  { value: "jpeg", title: "JPEG" },
  { value: "png", title: "PNG" },
  { value: "gif", title: "GIF" },
  { value: "bmp", title: "BMP" },
  { value: "svg", title: "SVG" },
  { value: "webp", title: "WEBP" },
  { value: "ico", title: "ICO" },

  // Videos
  { value: "mp4", title: "MP4" },
  { value: "avi", title: "AVI" },
  { value: "mov", title: "MOV" },
  { value: "wmv", title: "WMV" },
  { value: "flv", title: "FLV" },
  { value: "mkv", title: "MKV" },
  { value: "webm", title: "WEBM" },

  // Audio
  { value: "mp3", title: "MP3" },
  { value: "wav", title: "WAV" },
  { value: "flac", title: "FLAC" },
  { value: "aac", title: "AAC" },
  { value: "ogg", title: "OGG" },
  { value: "wma", title: "WMA" },

  // Archives
  { value: "zip", title: "ZIP" },
  { value: "rar", title: "RAR" },
  { value: "7z", title: "7Z" },
  { value: "tar", title: "TAR" },
  { value: "gz", title: "GZ" },

  // Code/Data
  { value: "json", title: "JSON" },
  { value: "xml", title: "XML" },
  { value: "html", title: "HTML" },
  { value: "css", title: "CSS" },
  { value: "js", title: "JavaScript" },
  { value: "ts", title: "TypeScript" },
  { value: "jsx", title: "JSX" },
  { value: "tsx", title: "TSX" },

  // Other
  { value: "exe", title: "EXE" },
  { value: "dmg", title: "DMG" },
  { value: "apk", title: "APK" },
  { value: "iso", title: "ISO" },
];

export function ElementProperties({ element, onSave, onClose }) {
  const [validationRules, setValidationRules] = useState([]);
  const [isHtmlEditorOpen, setIsHtmlEditorOpen] = useState(false);
  const [htmlContent, setHtmlContent] = useState("");

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
    optionUrl: "",
    optionPath: "",
    optionValue: "",
    optionName: "",
    optionRequestType: "",
    optionDepending:"",
    fileType: [],
    fileSize: "",
    fieldVisibleIf: "",
    fieldEnableIf: "",
    fieldRequiredIf: "",

    // ====> ADDED <====
    fieldConfigration: [],
  },
  validationSchema,
  onSubmit: (values) => {
    // ====> BUILD COMPLETE fieldConfigration array <====
    const completeFieldConfigration = [...(values.fieldConfigration || [])];

    // Add fieldVisibleIf if it has a value
    if (values.fieldVisibleIf && values.fieldVisibleIf.trim() !== "") {
      completeFieldConfigration.push({
        type: "fieldVisibleIf",
        content: values.fieldVisibleIf,
      });
    }

    // Add fieldEnableIf if it has a value
    if (values.fieldEnableIf && values.fieldEnableIf.trim() !== "") {
      completeFieldConfigration.push({
        type: "fieldEnableIf",
        content: values.fieldEnableIf,
      });
    }

    // Add fieldRequiredIf if it has a value
    if (values.fieldRequiredIf && values.fieldRequiredIf.trim() !== "") {
      completeFieldConfigration.push({
        type: "fieldRequiredIf",
        content: values.fieldRequiredIf,
      });
    }

    const updatedElement = {
      ...element,
      fieldTitle: values.fieldTitle,
      fieldName: values.fieldName,
      fieldType: values.fieldType,
      placeHolder: values.placeHolder,
      fieldDescription: values.fieldDescription,
      isRequired: values.isRequired == "yes" ? true : false,
      specialCharactor: values.specialCharactor == "yes" ? true : false,
      defaultValue: values.defaultValue,
      options: values.options,
      content: values.content,
      headingLevel: values.headingLevel,
      requiredErrorText: values.requiredErrorText,
      validation: validationRules.filter(
        (rule) => rule.type && (rule.type === "required" || rule.message)
      ),
    };

    if (["radio", "checkbox", "select"].includes(values.fieldType)) {
      updatedElement.fieldOptions = values.fieldOptions.map((opt, index) => {
        const key = labelToName(opt);
        return JSON.stringify({ [key]: opt });
      });
    } else {
      updatedElement.fieldOptions = values.fieldOptions;
    }

    // Only include RESTful and file validation fields if they are not null/empty
    if (values.optionUrl) updatedElement.optionUrl = values.optionUrl;
    if (values.optionPath) updatedElement.optionPath = values.optionPath;
    if (values.optionValue) updatedElement.optionValue = values.optionValue;
    if (values.optionName) updatedElement.optionName = values.optionName;
    if (values.optionDepending) updatedElement.optionDepending = values.optionDepending;
    if (values.optionRequestType)
      updatedElement.optionRequestType = values.optionRequestType;

    if (values.fileType && values.fileType.length > 0)
      updatedElement.fileType = values.fileType;
    if (values.fileSize) updatedElement.fileSize = values.fileSize;

    // ====> ADD fieldConfigration to updatedElement <====
    if (completeFieldConfigration.length > 0) {
      updatedElement.fieldConfigration = completeFieldConfigration;
    }

    onSave(updatedElement);
  },
});

// Reset form when element changes
useEffect(() => {
  if (element) {
    formik.resetForm();
    
    const parsedOptions = Array.isArray(element.fieldOptions)
      ? element.fieldOptions.map((opt) => {
          try {
            const obj = JSON.parse(opt); // Parse JSON string
            return Object.values(obj)[0]; // Take first value (e.g. "Option 1")
          } catch {
            return opt; // if not JSON, keep as is
          }
        })
      : [];

    // ====> EXTRACT logic fields from fieldConfigration <====
    const fieldConfigrations = element.fieldConfigration || [];
    const manualConfigurations = [];
    let fieldVisibleIf = "";
    let fieldEnableIf = "";
    let fieldRequiredIf = "";

    fieldConfigrations.forEach((config) => {
      if (config.type === "fieldVisibleIf") {
        fieldVisibleIf = config.content;
      } else if (config.type === "fieldEnableIf") {
        fieldEnableIf = config.content;
      } else if (config.type === "fieldRequiredIf") {
        fieldRequiredIf = config.content;
      } else {
        // Other configurations (tooltip, disclaimer, etc.)
        manualConfigurations.push(config);
      }
    });

    formik.setValues({
      fieldTitle: element.fieldTitle || "",
      fieldName: element.fieldName || "",
      fieldType: element.fieldType || "",
      placeHolder: element.placeHolder || "",
      requiredErrorText: element.requiredErrorText || "",
      fieldOptions: parsedOptions || [],
      userType: element.userType || [],
      isRequired: element.isRequired === true ? "yes" : "no",
      fieldDescription: element.fieldDescription || "",
      fieldminLimit: element.fieldminLimit || "",
      fieldmaxLimit: element.fieldmaxLimit || "",
      specialCharactor: element.specialCharactor === true ? "yes" : "no",
      userFieldMapping: element.userFieldMapping || [],
      optionUrl: element.optionUrl || "",
      optionPath: element.optionPath || "",
      optionValue: element.optionValue || "",
      optionName: element.optionName || "",
      optionRequestType: element.optionRequestType || "",
      optionDepending: element.optionDepending || "",
      fileType: element.filevalidation?.[0]?.fileType || [],
      fileSize: element.filevalidation?.[0]?.fileSize || "",      
      fieldVisibleIf: fieldVisibleIf,
      fieldEnableIf: fieldEnableIf,
      fieldRequiredIf: fieldRequiredIf,
      fieldConfigration: manualConfigurations,
    });
    setHtmlContent(element.htmlContent || "");
    setValidationRules(element.validation || []);
  }
}, [element]);

  // Auto-generate field name from field title
  const handleFieldTitleChange = (e) => {
    const value = e.target.value;
    formik.setFieldValue("fieldTitle", value);
    formik.setFieldValue("fieldName", labelToName(value));
  };
   // Handle saving HTML content from editor
  const handleSaveHtmlContent = () => {
    formik.setFieldValue("htmlContent", htmlContent);
    setIsHtmlEditorOpen(false);
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
    <>
    <div className="w-60 xl:w-80 bg-white border-l border-gray-200 flex flex-col sticky top-0 overflow-auto">
      <Card className="border-0 rounded-none grow gap-0 xl:gap-0 2xl:p-4">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 p-0">
          <CardTitle className="text-base xl:text-lg">Element Properties</CardTitle>
          <Button variant="ghost" size="sm" className={"!p-0"} onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={formik.handleSubmit}>
            <Accordion type="single" collapsible className="w-full" defaultValue="generalSettings-1">
              <AccordionItem value="generalSettings-1">
                <AccordionTrigger className={"hover:no-underline text-sm font-semibold text-gray-700"}>General settings</AccordionTrigger>
                <AccordionContent className={"space-y-5"}>
                  <div className="flex flex-col gap-1">
                    <Label htmlFor="fieldTitle">Field Title</Label>
                    <div className="relative pb-3.5">
                      <Input id="fieldTitle" name="fieldTitle" placeholder="Enter field title" value={formik.values.fieldTitle} onChange={handleFieldTitleChange} onBlur={formik.handleBlur} className="bg-white/50 backdrop-blur-sm border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200" />
                      {formik.touched.fieldTitle && formik.errors.fieldTitle && (
                        <p className="text-xs text-red-500 absolute left-0 -bottom-1">{formik.errors.fieldTitle}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <Label htmlFor="fieldName">Field Name</Label>
                    <div className="relative pb-3.5">
                      <Input id="fieldName" name="fieldName" placeholder="Enter field name" value={formik.values.fieldName} onChange={formik.handleChange} onBlur={formik.handleBlur} className="bg-white/50 backdrop-blur-sm border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200" />
                      {formik.touched.fieldName && formik.errors.fieldName && (
                        <p className="text-xs text-red-500 absolute left-0 -bottom-1">
                          {formik.errors.fieldName}
                        </p>
                      )}
                    </div>
                  </div>

                  {["html"].includes(formik.values.fieldType) ? (
                    <div>
                      <Button variant="ghost" type="button" onClick={() => setIsHtmlEditorOpen(true)} >
                        <Pencil />
                      </Button>
                      {formik.values.htmlContent && (
                          <p className="text-xs text-green-600">
                            ✓ Content added ({formik.values.htmlContent.length} characters)
                          </p>
                        )}
                    </div>
                  ) : (
                    <>
                      <div className="flex flex-col gap-1">
                        <Label htmlFor="fieldType">Field Type</Label>
                        <CustomCombobox
                          name="fieldType"
                          value={formik.values.fieldType}
                          onChange={(value) =>
                            formik.setFieldValue("fieldType", value)
                          }
                          onBlur={() =>
                            formik.setFieldTouched("fieldType", true)
                          }
                          valueKey="value"
                          labelKey="title"
                          options={fieldTypeOptions || []}
                          placeholder="Select Field Type"
                          id="fieldType"
                        />
                        {formik.touched.fieldType &&
                          formik.errors.fieldType && (
                            <p className="text-sm text-red-500">
                              {formik.errors.fieldType}
                            </p>
                          )}
                      </div>
                      <div className="flex flex-col gap-1">
                        <Label htmlFor="isRequired">Is Field Required?</Label>
                        <CustomCombobox name="isRequired" value={formik.values.isRequired} onChange={(value) => formik.setFieldValue("isRequired", value)} valueKey="value" labelKey="title" search={false} options={BooleanOptions || []} placeholder="Select Field Required" id="isRequired" />
                      </div>
                      <div className="flex flex-col gap-1">
                        <Label htmlFor="placeHolder">Place Holder</Label>
                        <div className="relative pb-3.5">
                          <Input id="placeHolder" name="placeHolder" type="text" placeholder="Enter placeHolder address" value={formik.values.placeHolder} onChange={formik.handleChange} onBlur={formik.handleBlur} className="bg-white/50 backdrop-blur-sm border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200" />
                          {formik.touched.placeHolder && formik.errors.placeHolder && (<p className="text-xs text-red-500 absolute left-0 -bottom-1">{formik.errors.placeHolder}</p>)}
                        </div>
                      </div>
                      <div className="flex flex-col gap-1">
                        <Label htmlFor="requiredErrorText">Required Error Text</Label>
                        <Input id="requiredErrorText" name="requiredErrorText" type="text" placeholder="Enter requiredErrorText address" value={formik.values.requiredErrorText} onChange={formik.handleChange} onBlur={formik.handleBlur} className="bg-white/50 backdrop-blur-sm border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200" />
                      </div>
                    </>
                  )}
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="generalSettings-2">
                <AccordionTrigger className={"hover:no-underline text-sm font-semibold text-gray-700"}>
                  Other settings
                </AccordionTrigger>
                <AccordionContent className={"space-y-5"}>
                  <div className="flex flex-col gap-1">
                    <Label htmlFor="fieldDescription">Field Description</Label>
                    <Input id="fieldDescription" name="fieldDescription" type="text" placeholder="Enter Field Description address" value={formik.values.fieldDescription} onChange={formik.handleChange} onBlur={formik.handleBlur} className="bg-white/50 backdrop-blur-sm border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <Label htmlFor="fieldminLimit">Field Minum length</Label>
                    <Input id="fieldminLimit" name="fieldminLimit" type="text" placeholder="Enter Field Minimum Lenght" value={formik.values.fieldminLimit} onChange={formik.handleChange} onBlur={formik.handleBlur} className="bg-white/50 backdrop-blur-sm border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <Label htmlFor="fieldmaxLimit">Field Maximum length </Label>
                    <Input id="fieldmaxLimit" name="fieldmaxLimit" type="text" placeholder="Enter Field Maximum Lenght" value={formik.values.fieldmaxLimit} onChange={formik.handleChange} onBlur={formik.handleBlur} className="bg-white/50 backdrop-blur-sm border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <Label htmlFor="specialCharactor">Is special Charactor?</Label>
                    <CustomCombobox name="specialCharactor" value={formik.values.specialCharactor} onChange={(value) => formik.setFieldValue("specialCharactor", value)} valueKey="value" labelKey="title" search={false} options={BooleanOptions || []} placeholder="Select Field Required" id="specialCharactor" />
                  </div>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="field-logic-config">
                <AccordionTrigger className="text-sm font-medium text-gray-800 hover:no-underline">Field Logic Configure</AccordionTrigger>
                <AccordionContent className="space-y-0">
                  <Accordion type="single" collapsible className="w-full">
                    {/* Field Visible If */}
                    <AccordionItem value="visible" className="border-b">
                      <AccordionTrigger className="text-sm font-normal text-gray-600 py-3 hover:no-underline">Field Visible If?</AccordionTrigger>
                      <AccordionContent className="pb-4">
                        <div className="space-y-2">
                          <div className="text-xs text-gray-400 space-y-1">
                            <div>Condition</div>
                            <div>Ex- {"{openTime}"} &lt; {"{closeTime}"}</div>
                            <div>Ex- {"{openTime}"} &gt; 08:00</div>
                          </div>
                          <Textarea name="fieldVisibleIf" value={formik.values.fieldVisibleIf} onChange={formik.handleChange} onBlur={formik.handleBlur} placeholder="" rows={3} className="w-full resize-none text-sm" />
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    {/* Field Enable If */}
                    <AccordionItem value="enable" className="border-b">
                      <AccordionTrigger className="text-sm font-normal text-gray-600 py-3 hover:no-underline">Field Enable If?</AccordionTrigger>
                      <AccordionContent className="pb-4">
                        <div className="space-y-2">
                          <div className="text-xs text-gray-400 space-y-1">
                            <div>Condition</div>
                            <div>Ex- {"{openTime}"} &lt; {"{closeTime}"}</div>
                            <div>Ex- {"{openTime}"} &gt; 08:00</div>
                          </div>
                          <Textarea name="fieldEnableIf" value={formik.values.fieldEnableIf} onChange={formik.handleChange} onBlur={formik.handleBlur} placeholder="" rows={3} className="w-full resize-none text-sm" />
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    {/* Field Required If */}
                    <AccordionItem value="required" className="border-b-0">
                      <AccordionTrigger className="text-sm font-normal text-gray-600 py-3 hover:no-underline">Field Required If?</AccordionTrigger>
                      <AccordionContent className="pb-4">
                        <div className="space-y-2">
                          <div className="text-xs text-gray-400 space-y-1">
                            <div>Condition</div>
                            <div>Ex- {"{openTime}"} &lt; {"{closeTime}"}</div>
                            <div>Ex- {"{openTime}"} &gt; 08:00</div>
                          </div>
                          <Textarea name="fieldRequiredIf" value={formik.values.fieldRequiredIf} onChange={formik.handleChange} onBlur={formik.handleBlur} placeholder="" rows={3} className="w-full resize-none text-sm" />
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </AccordionContent>
              </AccordionItem>
              {["radio", "checkbox", "select"].includes(formik.values.fieldType) && (
                <AccordionItem value="generalSettings-4">
                  <AccordionTrigger className={"hover:no-underline text-sm font-semibold text-gray-700"}>Option Configuration</AccordionTrigger>
                  <AccordionContent className={"space-y-5"}>
                    <div className="space-y-2">
                      <Label>Options</Label>
                      <div className="space-y-2">
                        {formik.values.fieldOptions?.map((opt, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <Input type="text" value={opt}
                              onChange={(e) => {
                                const newOptions = [
                                  ...formik.values.fieldOptions,
                                ];
                                newOptions[index] = e.target.value;
                                formik.setFieldValue(
                                  "fieldOptions",
                                  newOptions
                                );
                              }}
                              placeholder={`Option ${index + 1}`}
                            />
                            <Button type="button" variant="destructive"
                              onClick={() => {
                                const newOptions =
                                  formik.values.fieldOptions.filter(
                                    (_, i) => i !== index
                                  );
                                formik.setFieldValue(
                                  "fieldOptions",
                                  newOptions
                                );
                              }}
                            >
                              Remove
                            </Button>
                          </div>
                        ))}

                        <Button type="button" variant="outline"
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

                      {formik.touched.fieldOptions &&
                        formik.errors.fieldOptions && (<p className="text-sm text-red-500">{formik.errors.fieldOptions}</p>)
                      }
                    </div>
                  </AccordionContent>
                </AccordionItem>
              )}
              {["select"].includes(formik.values.fieldType) && (
                <AccordionItem value="OptionRESETFul">
                  <AccordionTrigger className={"hover:no-underline text-sm font-semibold text-gray-700"}>option Configure from RESETFul service</AccordionTrigger>
                  <AccordionContent className={"space-y-5"}>
                    <div className="flex flex-col gap-1">
                      <Label htmlFor="optionUrl">service Url</Label>
                      <Input id="optionUrl" name="optionUrl" placeholder="Enter service Url" value={formik.values.optionUrl} onChange={formik.handleChange} onBlur={formik.handleBlur} className="bg-white/50 backdrop-blur-sm border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="optionRequestType">Request Type</Label>
                      <CustomCombobox
                        name="optionRequestType"
                        value={formik.values.optionRequestType}
                        onChange={(value) =>
                          formik.setFieldValue("optionRequestType", value)
                        }
                        onBlur={() =>
                          formik.setFieldTouched("optionRequestType", true)
                        }
                        valueKey="value"
                        labelKey="title"
                        options={optionRequestTypeOptions || []}
                        search={false}
                        placeholder="Select  Request Type"
                        id="optionRequestType"
                      />
                      {formik.touched.fieldType && formik.errors.fieldType && (
                        <p className="text-sm text-red-500">{formik.errors.fieldType}</p>
                      )}
                    </div>
                    <div className="flex flex-col gap-1">
                      <Label htmlFor="optionPath">Path</Label>
                      <Input id="optionPath" name="optionPath" placeholder="Enter Path" value={formik.values.optionPath} onChange={formik.handleChange} onBlur={formik.handleBlur} className="bg-white/50 backdrop-blur-sm border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <Label htmlFor="optionValue">Value Name</Label>
                      <Input id="optionValue" name="optionValue" placeholder="Enter Value Name" value={formik.values.optionValue} onChange={formik.handleChange} onBlur={formik.handleBlur} className="bg-white/50 backdrop-blur-sm border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <Label htmlFor="optionName">Text Name</Label>
                      <Input id="optionName" name="optionName" placeholder="Enter Text Name" value={formik.values.optionName} onChange={formik.handleChange} onBlur={formik.handleBlur} className="bg-white/50 backdrop-blur-sm border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <Label htmlFor="optionDepending">Field Depending</Label>
                      <Input id="optionDepending" name="optionDepending" placeholder="Enter Field Name Depending " value={formik.values.optionDepending} onChange={formik.handleChange} onBlur={formik.handleBlur} className="bg-white/50 backdrop-blur-sm border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200" />
                    </div>
                  </AccordionContent>
                </AccordionItem>
              )}
              {["file"].includes(formik.values.fieldType) && (
                <AccordionItem value="File_Validation">
                  <AccordionTrigger className={"hover:no-underline text-sm font-semibold text-gray-700"}>File Validation</AccordionTrigger>
                  <AccordionContent className={"space-y-5"}>
                    <div className="space-y-2">
                      <Label htmlFor="fileType">File Type To validate</Label>
                      <CustomCombobox
                        name="fileType"
                        value={formik.values.fileType}
                        onChange={(value) =>
                          formik.setFieldValue("fileType", value)
                        }
                        onBlur={() => formik.setFieldTouched("fileType", true)}
                        valueKey="value"
                        labelKey="title"
                        options={fileTypeOptions || []}
                        search={true}
                        multiSelect={true}
                        placeholder="Select  Request Type"
                        id="fileType"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <Label htmlFor="fileSize">File Minimum Size</Label>
                      <Input id="fileSize" name="fileSize" placeholder="Enter File Minimum Size in MB" value={formik.values.fileSize} onChange={formik.handleChange} onBlur={formik.handleBlur} className="bg-white/50 backdrop-blur-sm border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200"/>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              )}
            </Accordion>
            {/* Save Button */}
            <div className="pt-4 border-t">
              <Button type="submit" className="w-full">Save Changes</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
     <Sheet open={isHtmlEditorOpen} onOpenChange={setIsHtmlEditorOpen}>
        <SheetContent side="right" className="w-full sm:max-w-3xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>HTML Content Editor</SheetTitle>
            <SheetDescription>
              Add or edit your HTML content. You can write HTML, CSS, and even inline JavaScript.
            </SheetDescription>
          </SheetHeader>
          
          <div className="mt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="html-editor">HTML Content</Label>              
               <ReactQuill
                id="html-editor"
                value={htmlContent}
                onChange={(e) => setHtmlContent(e)}                
                placeholder="Enter your HTML content here..."
                theme="snow"
                className= "w-full min-h-72 flex flex-col [&>.ql-container.ql-snow]:flex [&>.ql-container.ql-snow]:flex-col [&>.ql-container>.ql-editor]:grow [&>.ql-toolbar.ql-snow]:rounded-t-xl [&>.ql-container.ql-snow]:rounded-b-xl [&>.ql-container.ql-snow]:flex-grow"
              />              
            </div>
                                    
            
            <div className="flex gap-2 justify-end pt-4 border-t sticky bottom-0 bg-white">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setHtmlContent(htmlContent || "");
                  setIsHtmlEditorOpen(false);
                }}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleSaveHtmlContent}
              >
                Save Content
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
