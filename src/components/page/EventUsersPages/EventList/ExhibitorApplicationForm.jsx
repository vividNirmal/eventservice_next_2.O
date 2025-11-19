"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "sonner";
import {
  Loader2,
  CheckCircle2,
  ArrowLeft,
  Send,
} from "lucide-react";
import dynamic from "next/dynamic";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { DynamicSelect } from "@/components/form-builder/dynamicSelected";
import { getRequest, postRequest } from "@/service/viewService";

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

const ExhibitorApplicationForm = ({ formId }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

    // Get exhibitorFormId from URL parameters
  const exhibitorFormId = searchParams.get('exhibitorFormId');

  useEffect(() => {
    if (formId) {
      fetchForm();
    }
  }, [formId]);

  const fetchForm = async () => {
    try {
      setLoading(true);
      const response = await getRequest(`forms/${formId}`);
      if (response.status === 1 && response.data) {
        setForm(response.data.form);
      } else {
        toast.error(response.message || "Failed to load form");
      }
    } catch (error) {
      console.error("Error fetching form:", error);
      toast.error("Failed to load form");
    } finally {
      setLoading(false);
    }
  };

  // Helper function to parse file size string to bytes
  const parseFileSize = (sizeString) => {
    if (!sizeString) return Infinity;

    const match = sizeString.match(/^(\d+(?:\.\d+)?)\s*(KB|MB|GB)?$/i);
    if (!match) return Infinity;

    const value = parseFloat(match[1]);
    const unit = (match[2] || "MB").toUpperCase();

    const multipliers = {
      KB: 1024,
      MB: 1024 * 1024,
      GB: 1024 * 1024 * 1024,
    };

    return value * (multipliers[unit] || multipliers["MB"]);
  };

  // Generate initial values and validation schema
  const { initialValues, validationSchema } = useMemo(() => {
    const values = {};
    const schemaFields = {};

    if (!form?.pages)
      return { initialValues: {}, validationSchema: Yup.object() };

    form.pages.forEach((page) => {
      page.elements.forEach((element) => {
        const fieldName = element.fieldName;

        // Set initial values
        if (
          element.fieldType === "checkbox" &&
          element.fieldOptions?.length > 1
        ) {
          values[fieldName] = [];
        } else if (element.fieldType === "checkbox") {
          values[fieldName] = false;
        } else {
          values[fieldName] = "";
        }

        // Build validation schema
        let fieldValidation;

        switch (element.fieldType) {
          case "email":
            fieldValidation = Yup.string().email("Invalid email format");
            break;
          case "number":
            fieldValidation = Yup.number().typeError("Must be a number");
            break;
          case "url":
            fieldValidation = Yup.string().url("Invalid URL format");
            break;
          case "tel":
            fieldValidation = Yup.string().matches(
              /^[0-9+\-\s()]*$/,
              "Invalid phone number"
            );
            break;
          case "checkbox":
            if (element.fieldOptions?.length > 1) {
              fieldValidation = Yup.array();
            } else {
              fieldValidation = Yup.boolean();
            }
            break;
          case "file":
            fieldValidation = Yup.mixed()
              .test("fileType", "Invalid file type", function (value) {
                if (!value) return true;
                if (!element.fileType || element.fileType.length === 0)
                  return true;

                const fileExtension = value.name.split(".").pop().toLowerCase();
                const allowedTypes = element.fileType.map((type) =>
                  type.toLowerCase()
                );

                if (!allowedTypes.includes(fileExtension)) {
                  return this.createError({
                    message: `Only ${element.fileType.join(", ")} files are allowed`,
                  });
                }
                return true;
              })
              .test("fileSize", "File too large", function (value) {
                if (!value) return true;
                if (!element.fileSize) return true;

                const maxSize = parseFileSize(element.fileSize);
                if (value.size > maxSize) {
                  return this.createError({
                    message: `File size must be less than ${element.fileSize}`,
                  });
                }
                return true;
              });
            break;
          default:
            fieldValidation = Yup.string();
        }

        // Required validation
        if (element.isRequired) {
          if (element.fieldType === "checkbox") {
            if (element.fieldOptions?.length > 1) {
              fieldValidation = fieldValidation.min(
                1,
                element.requiredErrorText || "This field is required"
              );
            } else {
              fieldValidation = fieldValidation.oneOf(
                [true],
                element.requiredErrorText || "This field is required"
              );
            }
          } else if (element.fieldType === "file") {
            fieldValidation = fieldValidation.required(
              element.requiredErrorText || "This field is required"
            );
          } else {
            fieldValidation = fieldValidation.required(
              element.requiredErrorText || "This field is required"
            );
          }
        }

        // Min/Max length validation
        if (element.fieldminLimit && element.fieldType !== "number") {
          fieldValidation = fieldValidation.min(
            parseInt(element.fieldminLimit),
            `Minimum ${element.fieldminLimit} characters required`
          );
        }
        if (element.fieldmaxLimit && element.fieldType !== "number") {
          fieldValidation = fieldValidation.max(
            parseInt(element.fieldmaxLimit),
            `Maximum ${element.fieldmaxLimit} characters allowed`
          );
        }

        // Custom regex validation
        if (element.validators && element.validators.length > 0) {
          element.validators.forEach((validator) => {
            if (validator.type === "custom" && validator.regex) {
              try {
                const regex = new RegExp(validator.regex);
                fieldValidation = fieldValidation.matches(
                  regex,
                  validator.text || "Invalid format"
                );
              } catch (e) {
                console.error("Invalid regex:", validator.regex);
              }
            }
          });
        }

        schemaFields[fieldName] = fieldValidation;
      });
    });

    return {
      initialValues: values,
      validationSchema: Yup.object().shape(schemaFields),
    };
  }, [form]);

  const formik = useFormik({
    initialValues,
    validationSchema,
    validateOnChange: true,
    validateOnBlur: true,
    enableReinitialize: true,
    onSubmit: async (values) => {
      setSubmitting(true);
      try {
        const formData = new FormData();
        // formData.append("formId", formId);

        // Add exhibitorFormId to the form data
        if (exhibitorFormId) {
          formData.append("exhibitorFormId", exhibitorFormId);
        } else {
          toast.error("Exhibitor form ID is missing");
          setSubmitting(false);
          return;
        }

        // Convert form values to FormData
        Object.entries(values).forEach(([key, value]) => {
          if (value instanceof File) {
            formData.append(key, value);
          } else if (Array.isArray(value)) {
            value.forEach((item, index) => {
              if (typeof item === "object" && !(item instanceof File)) {
                Object.entries(item).forEach(([subKey, subVal]) => {
                  formData.append(`${key}[${index}][${subKey}]`, subVal);
                });
              } else {
                formData.append(`${key}[${index}]`, item);
              }
            });
          } else if (typeof value === "object" && value !== null) {
            Object.entries(value).forEach(([subKey, subVal]) => {
              formData.append(`${key}[${subKey}]`, subVal);
            });
          } else if (value !== undefined && value !== null) {
            formData.append(key, value);
          }
        });

        const response = await postRequest("store-exhibitor-form", formData);

        if (response.status === 1) {
          setSubmitSuccess(true);
          toast.success(response.message || "Form submitted successfully!");
          formik.resetForm();
          
          // Redirect after 2 seconds
          setTimeout(() => {
            router.push("/dashboard/eventuser/eventlist");
          }, 2000);
        } else {
          throw new Error(
            response?.message || response?.error || "Failed to submit form"
          );
        }
      } catch (error) {
        console.error("Form submission error:", error);
        toast.error(error.message || "Failed to submit form");
      } finally {
        setSubmitting(false);
      }
    },
  });

  const renderField = (element) => {
    const {
      _id,
      fieldName,
      fieldType,
      fieldTitle,
      placeHolder,
      fieldDescription,
      fieldOptions,
      isRequired,
      fileType,
      fileSize,
    } = element;

    const value = formik.values[fieldName];
    const error = formik.touched[fieldName] && formik.errors[fieldName];

    const renderInput = () => {
      switch (fieldType) {
        case "textarea":
          return (
            <Textarea id={fieldName} name={fieldName} value={value} onChange={formik.handleChange} onBlur={formik.handleBlur} placeholder={placeHolder} rows={4} className={cn("bg-white", error ? "border-red-500" : "")} />
          );

        case "select":
          return (
            <DynamicSelect element={element} value={value} onChange={(val) => formik.setFieldValue(fieldName, val)} onBlur={() => formik.setFieldTouched(fieldName, true)} error={error} formValues={formik.values} />
          );

        case "radio":
          return (
            <RadioGroup className="flex flex-col mt-2 space-y-2" value={value} onValueChange={(val) => formik.setFieldValue(fieldName, val)}>
              {fieldOptions?.map((option, idx) => {
                let parsedOption = option;
                if (typeof option === "string") {
                  try {
                    parsedOption = JSON.parse(option);
                  } catch (e) {
                    parsedOption = option;
                  }
                }
                const optionValue =
                  parsedOption.value ||
                  Object.keys(parsedOption)[0] ||
                  parsedOption;
                const optionLabel =
                  parsedOption.label ||
                  Object.values(parsedOption)[0] ||
                  parsedOption;

                return (
                  <div key={idx} className="flex items-center space-x-2">
                    <RadioGroupItem value={optionValue} id={`${fieldName}-${idx}`} />
                    <Label htmlFor={`${fieldName}-${idx}`} className="font-normal cursor-pointer mb-0">{optionLabel}</Label>
                  </div>
                );
              })}
            </RadioGroup>
          );

        case "checkbox":
          return (
            <div className="flex flex-col space-y-2 mt-2">
              {fieldOptions?.map((option, idx) => {
                let parsedOption = option;
                if (typeof option === "string") {
                  try {
                    parsedOption = JSON.parse(option);
                  } catch (e) {
                    parsedOption = option;
                  }
                }

                const optionValue =
                  parsedOption.value ||
                  Object.keys(parsedOption)[0] ||
                  parsedOption;
                const optionLabel =
                  parsedOption.label ||
                  Object.values(parsedOption)[0] ||
                  parsedOption;

                const isChecked = Array.isArray(value)
                  ? value.includes(optionValue)
                  : value === optionValue;

                return (
                  <div key={idx} className="flex items-center gap-2">
                    <Checkbox
                      id={`${fieldName}-${idx}`}
                      checked={isChecked}
                      onCheckedChange={(checked) => {
                        let newValue;
                        if (Array.isArray(value)) {
                          newValue = checked
                            ? [...value, optionValue]
                            : value.filter((v) => v !== optionValue);
                        } else {
                          newValue = checked ? [optionValue] : [];
                        }
                        formik.setFieldValue(fieldName, newValue);
                      }}
                    />
                    <Label
                      htmlFor={`${fieldName}-${idx}`}
                      className="font-normal cursor-pointer mb-0"
                    >
                      {optionLabel}
                    </Label>
                  </div>
                );
              })}
            </div>
          );

        case "file":
          return (
            <div>
              <Input
                type="file"
                id={fieldName}
                accept={
                  fileType
                    ? fileType.map((type) => `.${type}`).join(",")
                    : undefined
                }
                onChange={(e) => {
                  const file = e.target.files[0];
                  formik.setFieldValue(fieldName, file);
                  formik.setFieldTouched(fieldName, true);
                }}
                onBlur={formik.handleBlur}
                className={cn("bg-white", error ? "border-red-500" : "")}
              />
              {(fileType || fileSize) && (
                <p className="text-xs text-muted-foreground mt-1">
                  {fileType && `Allowed: ${fileType.join(", ")}`}
                  {fileType && fileSize && " | "}
                  {fileSize && `Max size: ${fileSize}`}
                </p>
              )}
            </div>
          );

        case "html":
          return (
            <ReactQuill
              value={value}
              onChange={(content) => formik.setFieldValue(fieldName, content)}
              onBlur={() => formik.setFieldTouched(fieldName, true)}
              placeholder={placeHolder}
              theme="snow"
              className="bg-white min-h-[200px]"
            />
          );

        case "hidden":
          return (
            <Input type="hidden" id={fieldName} name={fieldName} value={value} onChange={formik.handleChange} />
          );

        case "date":
          return (
            <Input type="date" id={fieldName} name={fieldName} value={value} onChange={formik.handleChange} onBlur={formik.handleBlur} className={cn("bg-white", error ? "border-red-500" : "")} />
          );

        case "password":
          return (
            <Input
              type="password"
              id={fieldName}
              name={fieldName}
              value={value}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder={placeHolder}
              className={cn("bg-white", error ? "border-red-500" : "")}
            />
          );

        default:
          return (
            <Input
              type={fieldType}
              id={fieldName}
              name={fieldName}
              value={value}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder={placeHolder}
              className={cn("bg-white", error ? "border-red-500" : "")}
            />
          );
      }
    };

    if (fieldType === "hidden") {
      return <div key={_id}>{renderInput()}</div>;
    }

    return (
      <div
        key={_id}
        className={cn(
          "flex flex-col gap-2",
          fieldType === "textarea" ||
            fieldType === "html" ||
            fieldType === "radio" ||
            fieldType === "checkbox"
            ? "col-span-full"
            : "col-span-full md:col-span-1"
        )}
      >
        <Label htmlFor={fieldName} className="font-medium">
          {fieldTitle || fieldName}
          {isRequired && <span className="text-red-500 ml-1">*</span>}
        </Label>
        {fieldDescription && (
          <p className="text-xs text-muted-foreground -mt-1">
            {fieldDescription}
          </p>
        )}
        <div className="relative">
          {renderInput()}
          {error && (
            <p className="text-xs text-red-500 mt-1 absolute -bottom-5">
              {error}
            </p>
          )}
        </div>
      </div>
    );
  };

  // Loading State
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading form...</p>
        </div>
      </div>
    );
  }

    // Add a check for exhibitorFormId
  if (!exhibitorFormId) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-gray-600 mb-4">Invalid form configuration</p>
            <Button onClick={() => router.back()} variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // No Form Found
  if (!form) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-gray-600 mb-4">No form found</p>
            <Button onClick={() => router.back()} variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Success State
  if (submitSuccess) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Success!
            </h2>
            <p className="text-gray-600 mb-4">
              Your form has been submitted successfully.
            </p>
            <p className="text-sm text-muted-foreground">
              Redirecting you back...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Main Form
  return (
    <div className="w-full max-w-6xl mx-auto">
      <Card className="shadow-lg !p-0 overflow-hidden !gap-0">
        <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-indigo-50 flex items-center justify-center !p-4 relative">
          <Button onClick={() => router.back()} className="flex items-center gap-2 size-9 2xl:size-10 bg-white text-black absolute left-8 top-1/2 -translate-1/2">
            <ArrowLeft className="size-4 2xl:size-5" />
          </Button>
          <div>
            <CardTitle className="text-2xl">{form?.formName || "Form"}</CardTitle>
          </div>
        </CardHeader>

        <CardContent className="p-4">
          <form onSubmit={formik.handleSubmit} className="space-y-6">
            {form.pages.map((page, pageIndex) => (
              <div key={pageIndex} className="space-y-6">
                {form.pages.length > 1 && (
                  <div className="border-b pb-3">
                    <h3 className="text-lg font-semibold text-gray-900">{page.name}</h3>
                    {page.description && (
                      <p className="text-sm text-muted-foreground mt-1">{page.description}</p>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">{page.elements.map((element) => renderField(element))}</div>
              </div>
            ))}

            <div className="flex items-center justify-end gap-4 pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => router.back()} disabled={submitting}>Cancel</Button>
              <Button type="submit" disabled={submitting} className="min-w-[150px]">
                {submitting ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="size-4" />
                    Submit Form
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExhibitorApplicationForm;