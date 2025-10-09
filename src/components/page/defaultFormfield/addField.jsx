"use client";
import { useEffect, useState } from "react";
import { useFormik, FieldArray, FormikProvider } from "formik";
import * as Yup from "yup";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2, Trash2, Plus } from "lucide-react";
import { toast } from "sonner";
import { getRequest, postRequest } from "@/service/viewService";
import { CustomCombobox } from "@/components/common/customcombox";
import { labelToName } from "@/lib/form-utils";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Textarea } from "@/components/ui/textarea";

export function FormFieldAddDrawer({
  isOpen,
  onClose,
  editUser = null,
  refetch,
  loading = false,
}) {
  const [userType, setUserTypes] = useState([]);
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

  const optionRequestTypeOptions = [
    { value: "GET", title: "GET" },
    { value: "POST", title: "POST" },
    { value: "PUT", title: "PUT" },
  ];

  const BooleanOptions = [
    { value: "yes", title: "Yes" },
    { value: "no", title: "No" },
  ];

  // Field Configuration Type Options (for manual configurations)
  const configurationTypeOptions = [
    { value: "tooltip", title: "Tooltip" },
    { value: "disclaimer", title: "Disclaimer" },
    { value: "helpText", title: "Help Text" },
    { value: "warning", title: "Warning" },
    { value: "info", title: "Info" },
    { value: "note", title: "Note" },
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

  const formik = useFormik({
    initialValues: {
      fieldName: "",
      fieldType: "",
      isRequired: false,
      placeHolder: "",
      requiredErrorText: "",
      fieldOptions: [],
      userType: [],
      userFieldMapping: [],
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
      fileType: [],
      fileSize: "",
      
      fieldVisibleIf: "",
      fieldEnableIf: "",
      fieldRequiredIf: "",      
      fieldConfigration: [],
    },

    validationSchema: Yup.object({
      fieldName: Yup.string().required("Name is required"),
      fieldType: Yup.string().required("Field Type is required"),
      fieldConfigration: Yup.array().of(
        Yup.object().shape({
          type: Yup.string().required("Type is required"),
          content: Yup.string().required("Content is required"),
        })
      ),
    }),

    onSubmit: async (values) => {
      try {
        const formData = new FormData();
        const completeFieldConfigration = [...(values.fieldConfigration || [])];        
        if (values.fieldVisibleIf && values.fieldVisibleIf.trim() !== "") {
          completeFieldConfigration.push({
            type: "fieldVisibleIf",
            content: values.fieldVisibleIf,
          });
        }        
        if (values.fieldEnableIf && values.fieldEnableIf.trim() !== "") {
          completeFieldConfigration.push({
            type: "fieldEnableIf",
            content: values.fieldEnableIf,
          });
        }
        if (values.fieldRequiredIf && values.fieldRequiredIf.trim() !== "") {
          completeFieldConfigration.push({
            type: "fieldRequiredIf",
            content: values.fieldRequiredIf,
          });
        }

        if (editUser) {
          // ===== EDIT MODE =====
          formData.append("fieldName", values.fieldName);
          formData.append("fieldType", values.fieldType);
          if (values.isRequired == "yes") {
            formData.append("isRequired", true);
          } else {
            formData.append("isRequired", false);
          }
          if (values.requiredErrorText) {
            formData.append("requiredErrorText", values.requiredErrorText);
          }
          if (["radio", "checkbox", "select"].includes(values.fieldType)) {
            values.fieldOptions.forEach((opt, index) => {
              const key = labelToName(opt);
              const obj = { [key]: opt };
              formData.append(`fieldOptions[${index}]`, JSON.stringify(obj));
            });
          }
          values.userType.forEach((otp, index) => {
            formData.append(`userType[${index}]`, otp);
          });
          values.userFieldMapping.forEach((user, index) => {
            formData.append(`userFieldMapping[${index}]`, user);
          });

          // Append additional fields if their values are not null or empty
          const fields = [
            "placeHolder",
            "fieldDescription",
            "fieldminLimit",
            "fieldmaxLimit",
            "fieldTitle",
            "optionUrl",
            "optionPath",
            "optionValue",
            "optionName",
            "optionRequestType",
          ];
          fields.forEach((field) => {
            if (
              values[field] !== undefined &&
              values[field] !== null &&
              values[field] !== ""
            ) {
              formData.append(field, values[field]);
            }
          });

          if (values.fileType.length > 0) {
            values.fileType.forEach((type, typeIndex) => {
              formData.append(
                `filevalidation[0][fileType][${typeIndex}]`,
                type
              );
            });
          }
          if (values.fileSize) {
            formData.append(`filevalidation[0][fileSize]`, values.fileSize);
          }
          
          if (completeFieldConfigration.length > 0) {
            completeFieldConfigration.forEach((config, index) => {
              formData.append(`fieldConfigration[${index}][type]`, config.type);
              formData.append(
                `fieldConfigration[${index}][content]`,
                config.content
              );
            });
          }

          const response = await postRequest(
            `update-default-field/${editUser._id}`,
            formData
          );

          if (response.status == 1) {
            toast.success("Field updated successfully");
            onClose();
            refetch(true);
          }
        } else {
          // ===== ADD MODE =====
          formData.append("fieldName", values.fieldName);
          formData.append("fieldType", values.fieldType);
          if (values.isRequired == "yes") {
            formData.append("isRequired", true);
          } else {
            formData.append("isRequired", false);
          }

          if (values.requiredErrorText) {
            formData.append("requiredErrorText", values.requiredErrorText);
          }
          if (["radio", "checkbox", "select"].includes(values.fieldType)) {
            values.fieldOptions.forEach((opt, index) => {
              const key = labelToName(opt);
              const obj = { [key]: opt };
              formData.append(`fieldOptions[${index}]`, JSON.stringify(obj));
            });
          }

          // Append additional fields if their values are not null or empty
          const fields = [
            "placeHolder",
            "fieldDescription",
            "fieldminLimit",
            "fieldmaxLimit",
            "fieldTitle",
            "optionUrl",
            "optionPath",
            "optionValue",
            "optionName",
            "optionRequestType",
          ];
          fields.forEach((field) => {
            if (
              values[field] !== undefined &&
              values[field] !== null &&
              values[field] !== ""
            ) {
              formData.append(field, values[field]);
            }
          });

          values.userType.forEach((otp, index) => {
            formData.append(`userType[${index}]`, otp);
          });
          values.userFieldMapping.forEach((user, index) => {
            formData.append(`userFieldMapping[${index}]`, user);
          });

          if (values.fileType.length > 0) {
            values.fileType.forEach((type, typeIndex) => {
              formData.append(
                `filevalidation[0][fileType][${typeIndex}]`,
                type
              );
            });
          }
          if (values.fileSize) {
            formData.append(`filevalidation[0][fileSize]`, values.fileSize);
          }
          
          if (completeFieldConfigration.length > 0) {
            completeFieldConfigration.forEach((config, index) => {
              formData.append(`fieldConfigration[${index}][type]`, config.type);
              formData.append(
                `fieldConfigration[${index}][content]`,
                config.content
              );
            });
          }

          const response = await postRequest("store-default-field", formData);

          if (response.status == 1) {
            toast.success("Field created successfully");
            onClose();
            refetch(true);
          }
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to process the request");
      }
    },
  });

  // Get filtered user types for "Assign default field to users" based on selected "User To Allow"
  const getFilteredUserTypes = () => {
    if (formik.values.userType.length === 0) {
      return [];
    }
    return userType.filter((user) => formik.values.userType.includes(user._id));
  };

  // Handle user type change
  const handleUserTypeChange = (selectedValues) => {
    formik.setFieldValue("userType", selectedValues);
  };

  const handleFieldTitleChange = (e) => {
    const value = e.target.value;
    formik.setFieldValue("fieldTitle", value);
    formik.setFieldValue("fieldName", labelToName(value));
  };

  useEffect(() => {
    fetchUserTypes();
    formik.resetForm();
    if (editUser) {
      const parsedOptions = Array.isArray(editUser.fieldOptions)
        ? editUser.fieldOptions.map((opt) => {
            try {
              const obj = JSON.parse(opt);
              return Object.values(obj)[0];
            } catch {
              return opt;
            }
          })
        : [];
      
      const fieldConfigrations = editUser.fieldConfigration || [];
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
        fieldTitle: editUser.fieldTitle || "",
        fieldName: editUser.fieldName || "",
        fieldType: editUser.fieldType || "",
        placeHolder: editUser.placeHolder || "",
        requiredErrorText: editUser.requiredErrorText || "",
        fieldOptions: parsedOptions || [],
        userType: editUser.userType || [],
        isRequired: editUser.isRequired === true ? "yes" : "no",
        fieldDescription: editUser.fieldDescription || "",
        fieldminLimit: editUser.fieldminLimit || "",
        fieldmaxLimit: editUser.fieldmaxLimit || "",
        specialCharactor: editUser.specialCharactor === true ? "yes" : "no",
        userFieldMapping: editUser.userFieldMapping || [],
        optionUrl: editUser.optionUrl || "",
        optionPath: editUser.optionPath || "",
        optionValue: editUser.optionValue || "",
        optionName: editUser.optionName || "",
        optionRequestType: editUser.optionRequestType || "",
        optionDepending: editUser.optionDepending || "",
        fileType: editUser.filevalidation?.[0]?.fileType || [],
        fileSize: editUser.filevalidation?.[0]?.fileSize || "",
        // Populate separated logic fields
        fieldVisibleIf: fieldVisibleIf,
        fieldEnableIf: fieldEnableIf,
        fieldRequiredIf: fieldRequiredIf,        
        fieldConfigration: manualConfigurations,
      });
    }
  }, [editUser, isOpen]);

  const fetchUserTypes = async () => {
    try {
      const response = await getRequest(`user-types`);
      if (response.status === 1) {
        setUserTypes(response.data.userTypes || []);
      }
    } catch (error) {
      console.error("Error fetching user types:", error);
      toast.error("Failed to fetch user types");
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-[400px] sm:w-[540px] px-4">
        <SheetHeader>
          <SheetTitle>{editUser ? "Edit Field" : "Add Field"}</SheetTitle>
          <SheetDescription>
            {editUser ? "Update field information" : "Create a new field"}
          </SheetDescription>
        </SheetHeader>

        <FormikProvider value={formik}>
          <form
            onSubmit={formik.handleSubmit}
            className="space-y-4 mt-6 overflow-x-auto"
          >
            <Accordion
              type="single"
              collapsible
              className="w-full"
              defaultValue="generalSettings-1"
            >
              <AccordionItem value="generalSettings-1">
                <AccordionTrigger
                  className={
                    "hover:no-underline text-sm font-semibold text-gray-700"
                  }
                >
                  General settings
                </AccordionTrigger>
                <AccordionContent className={"space-y-5"}>
                  <div className="flex flex-col gap-1">
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
                      onChange={(value) =>
                        formik.setFieldValue("fieldType", value)
                      }
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
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="generalSettings-2">
                <AccordionTrigger
                  className={
                    "hover:no-underline text-sm font-semibold text-gray-700"
                  }
                >
                  Permission settings
                </AccordionTrigger>
                <AccordionContent className={"space-y-5"}>
                  <div className="space-y-2">
                    <Label htmlFor="isRequired">Is Field Required?</Label>
                    <CustomCombobox
                      name="isRequired"
                      value={formik.values.isRequired}
                      onChange={(value) =>
                        formik.setFieldValue("isRequired", value)
                      }
                      valueKey="value"
                      labelKey="title"
                      search={false}
                      options={BooleanOptions || []}
                      placeholder="Select Field Required"
                      id="isRequired"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="isRequired">User To Allow</Label>
                    <CustomCombobox
                      name="userType"
                      value={formik.values.userType}
                      onChange={handleUserTypeChange}
                      onBlur={() => formik.setFieldTouched("userType", true)}
                      valueKey="_id"
                      labelKey="typeName"
                      multiSelect={true}
                      options={userType || []}
                      placeholder="Select User Type to allow"
                      id="userType"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="isRequired">
                      Assign default field to users
                    </Label>
                    <CustomCombobox
                      name="userFieldMapping"
                      value={formik.values.userFieldMapping}
                      onChange={(value) =>
                        formik.setFieldValue("userFieldMapping", value)
                      }
                      onBlur={() =>
                        formik.setFieldTouched("userFieldMapping", true)
                      }
                      valueKey="_id"
                      labelKey="typeName"
                      multiSelect={true}
                      options={getFilteredUserTypes()}
                      placeholder={
                        formik.values.userType.length === 0
                          ? "First select User To Allow"
                          : "Select User Type to assign"
                      }
                      id="userFieldMapping"
                      disabled={formik.values.userType.length === 0}
                    />
                    {formik.values.userType.length === 0 && (
                      <p className="text-sm text-gray-500">
                        Please select User To Allow first to assign fields
                      </p>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="generalSettings-3">
                <AccordionTrigger
                  className={
                    "hover:no-underline text-sm font-semibold text-gray-700"
                  }
                >
                  Other settings
                </AccordionTrigger>
                <AccordionContent className={"space-y-5"}>
                  <div className="space-y-2">
                    <Label htmlFor="requiredErrorText">
                      Required Error Text
                    </Label>
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
                    <Label htmlFor="fieldminLimit">Field Minimum length</Label>
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
                    <Label htmlFor="specialCharactor">
                      Is special Character?
                    </Label>
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
                </AccordionContent>
              </AccordionItem>

              {/* ====> MANUAL Field Configuration (tooltip, disclaimer, etc.) <==== */}
              <AccordionItem value="field-configuration">
                <AccordionTrigger className="hover:no-underline text-sm font-semibold text-gray-700">
                  Field Configuration
                </AccordionTrigger>
                <AccordionContent className="space-y-4">
                  <FieldArray name="fieldConfigration">
                    {({ push, remove }) => (
                      <div className="space-y-3">
                        {formik.values.fieldConfigration.map(
                          (config, index) => (
                            <div
                              key={index}
                              className="p-4 border rounded-lg space-y-3 bg-slate-50"
                            >
                              <div className="flex items-center justify-between">
                                <Label className="text-sm font-semibold">
                                  Configuration #{index + 1}
                                </Label>
                                <Button
                                  type="button"
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => remove(index)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>

                              <div className="space-y-2">
                                <Label
                                  htmlFor={`fieldConfigration[${index}].type`}
                                >
                                  Type
                                </Label>
                                <CustomCombobox
                                  name={`fieldConfigration[${index}].type`}
                                  value={config.type}
                                  onChange={(value) =>
                                    formik.setFieldValue(
                                      `fieldConfigration[${index}].type`,
                                      value
                                    )
                                  }
                                  onBlur={() =>
                                    formik.setFieldTouched(
                                      `fieldConfigration[${index}].type`,
                                      true
                                    )
                                  }
                                  valueKey="value"
                                  labelKey="title"
                                  options={configurationTypeOptions}
                                  placeholder="Select Type"
                                  id={`fieldConfigration[${index}].type`}
                                />
                                {formik.touched.fieldConfigration?.[index]
                                  ?.type &&
                                  formik.errors.fieldConfigration?.[index]
                                    ?.type && (
                                    <p className="text-sm text-red-500">
                                      {
                                        formik.errors.fieldConfigration[index]
                                          .type
                                      }
                                    </p>
                                  )}
                              </div>

                              <div className="space-y-2">
                                <Label
                                  htmlFor={`fieldConfigration[${index}].content`}
                                >
                                  Content
                                </Label>
                                <Textarea
                                  name={`fieldConfigration[${index}].content`}
                                  value={config.content}
                                  onChange={formik.handleChange}
                                  onBlur={formik.handleBlur}
                                  placeholder="Enter content..."
                                  rows={3}
                                  className="resize-none"
                                />
                                {formik.touched.fieldConfigration?.[index]
                                  ?.content &&
                                  formik.errors.fieldConfigration?.[index]
                                    ?.content && (
                                    <p className="text-sm text-red-500">
                                      {
                                        formik.errors.fieldConfigration[index]
                                          .content
                                      }
                                    </p>
                                  )}
                              </div>
                            </div>
                          )
                        )}

                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => push({ type: "", content: "" })}
                          className="w-full"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Configuration
                        </Button>
                      </div>
                    )}
                  </FieldArray>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="field-logic-config">
                <AccordionTrigger className="text-sm font-semibold text-gray-700 hover:no-underline">
                  Field Logic Configure
                </AccordionTrigger>
                <AccordionContent className="space-y-0">
                  <Accordion type="single" collapsible className="w-full">
                    {/* Field Visible If */}
                    <AccordionItem value="visible" className="border-b">
                      <AccordionTrigger className="text-sm font-normal text-gray-600 py-3 hover:no-underline">
                        Field Visible If?
                      </AccordionTrigger>
                      <AccordionContent className="pb-4">
                        <div className="space-y-2">
                          <div className="text-xs text-gray-400 space-y-1">
                            <div>Condition</div>
                            <div>
                              Ex- {"{openTime}"} &lt; {"{closeTime}"}
                            </div>
                            <div>Ex- {"{openTime}"} &gt; 08:00</div>
                          </div>
                          <Textarea
                            name="fieldVisibleIf"
                            value={formik.values.fieldVisibleIf}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            placeholder=""
                            rows={3}
                            className="w-full resize-none text-sm"
                          />
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    {/* Field Enable If */}
                    <AccordionItem value="enable" className="border-b">
                      <AccordionTrigger className="text-sm font-normal text-gray-600 py-3 hover:no-underline">
                        Field Enable If?
                      </AccordionTrigger>
                      <AccordionContent className="pb-4">
                        <div className="space-y-2">
                          <div className="text-xs text-gray-400 space-y-1">
                            <div>Condition</div>
                            <div>
                              Ex- {"{openTime}"} &lt; {"{closeTime}"}
                            </div>
                            <div>Ex- {"{openTime}"} &gt; 08:00</div>
                          </div>
                          <Textarea
                            name="fieldEnableIf"
                            value={formik.values.fieldEnableIf}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            placeholder=""
                            rows={3}
                            className="w-full resize-none text-sm"
                          />
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    {/* Field Required If */}
                    <AccordionItem value="required" className="border-b-0">
                      <AccordionTrigger className="text-sm font-normal text-gray-600 py-3 hover:no-underline">
                        Field Required If?
                      </AccordionTrigger>
                      <AccordionContent className="pb-4">
                        <div className="space-y-2">
                          <div className="text-xs text-gray-400 space-y-1">
                            <div>Condition</div>
                            <div>
                              Ex- {"{openTime}"} &lt; {"{closeTime}"}
                            </div>
                            <div>Ex- {"{openTime}"} &gt; 08:00</div>
                          </div>
                          <Textarea
                            name="fieldRequiredIf"
                            value={formik.values.fieldRequiredIf}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            placeholder=""
                            rows={3}
                            className="w-full resize-none text-sm"
                          />
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </AccordionContent>
              </AccordionItem>

              {["radio", "checkbox", "select"].includes(
                formik.values.fieldType
              ) && (
                <AccordionItem value="generalSettings-4">
                  <AccordionTrigger
                    className={
                      "hover:no-underline text-sm font-semibold text-gray-700"
                    }
                  >
                    Option Configuration
                  </AccordionTrigger>
                  <AccordionContent className={"space-y-5"}>
                    <div className="space-y-2">
                      <Label>Options</Label>

                      <div className="space-y-2">
                        {formik.values.fieldOptions?.map((opt, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <Input
                              type="text"
                              value={opt}
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
                            <Button
                              type="button"
                              variant="destructive"
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
                    </div>
                  </AccordionContent>
                </AccordionItem>
              )}

              {["select"].includes(formik.values.fieldType) && (
                <AccordionItem value="OptionRESETFul">
                  <AccordionTrigger
                    className={
                      "hover:no-underline text-sm font-semibold text-gray-700"
                    }
                  >
                    option Configure from RESTful service
                  </AccordionTrigger>
                  <AccordionContent className={"space-y-5"}>
                    <div className="flex flex-col gap-1">
                      <Label htmlFor="optionUrl">service Url</Label>
                      <Input
                        id="optionUrl"
                        name="optionUrl"
                        placeholder="Enter service Url"
                        value={formik.values.optionUrl}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        className="bg-white/50 backdrop-blur-sm border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200"
                      />
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
                    </div>
                    <div className="flex flex-col gap-1">
                      <Label htmlFor="optionPath">Path</Label>
                      <Input
                        id="optionPath"
                        name="optionPath"
                        placeholder="Enter Path"
                        value={formik.values.optionPath}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        className="bg-white/50 backdrop-blur-sm border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <Label htmlFor="optionValue">Value Name</Label>
                      <Input
                        id="optionValue"
                        name="optionValue"
                        placeholder="Enter Value Name"
                        value={formik.values.optionValue}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        className="bg-white/50 backdrop-blur-sm border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <Label htmlFor="optionName">Text Name</Label>
                      <Input
                        id="optionName"
                        name="optionName"
                        placeholder="Enter Text Name"
                        value={formik.values.optionName}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        className="bg-white/50 backdrop-blur-sm border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <Label htmlFor="optionDepending">Field Depending</Label>
                      <Input
                        id="optionDepending"
                        name="optionDepending"
                        placeholder="Enter Field Name Depending "
                        value={formik.values.optionDepending}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        className="bg-white/50 backdrop-blur-sm border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200"
                      />
                    </div>
                  </AccordionContent>
                </AccordionItem>
              )}

              {["file"].includes(formik.values.fieldType) && (
                <AccordionItem value="File_Validation">
                  <AccordionTrigger
                    className={
                      "hover:no-underline text-sm font-semibold text-gray-700"
                    }
                  >
                    File Validation
                  </AccordionTrigger>
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
                      <Input
                        id="fileSize"
                        name="fileSize"
                        placeholder="Enter File Minimum Size in MB"
                        value={formik.values.fileSize}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        className="bg-white/50 backdrop-blur-sm border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200"
                      />
                    </div>
                  </AccordionContent>
                </AccordionItem>
              )}
            </Accordion>

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editUser ? "Update Field" : "Add Field"}
              </Button>
            </div>
          </form>
        </FormikProvider>
      </SheetContent>
    </Sheet>
  );
}
