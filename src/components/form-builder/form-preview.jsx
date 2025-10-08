"use client";
import React, { useState, useMemo, useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Eye, X, ChevronLeft, ChevronRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import dynamic from "next/dynamic";
import { toast } from "sonner";
import { useParams, useRouter } from "next/navigation";
import { getRequest } from "@/service/viewService";
import { cn } from "@/lib/utils";
import { CustomCombobox } from "../common/customcombox";
const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

/**
 * Form Preview Component
 * Shows a preview of how the form will look to end users
 */
function FormPreview() {
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [form, setForm] = useState(null);
  const params = useParams();
  const router = useRouter();
  const formId = params.id;
  useEffect(() => {
    fetchForm();
  }, [formId]);

  const fetchForm = async () => {
    if (!formId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await getRequest(`/forms/${formId}`);
      if (response.status === 1 && response.data) {
        setForm(response.data.form);
      } else {
        console.log("❌ API Response error or no data:", response);
      }
    } catch (error) {
      console.error("🚨 Error fetching form:", error);
      toast.error("Failed to load form");
    } finally {
      setLoading(false);
    }
  };

  // Generate initial values and validation schema
  const { initialValues, validationSchemas } = useMemo(() => {
    const values = {};
    const schemas = {};

    form?.pages.forEach((page, pageIndex) => {
      const pageSchema = {};

      page.elements.forEach((element) => {
        const fieldName = element.fieldName;

        // Set initial values
        values[fieldName] = element.fieldType === "checkbox" ? false : "";

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
            fieldValidation = Yup.boolean();
            break;
          default:
            fieldValidation = Yup.string();
        }

        // Required validation
        if (element.isRequired) {
          if (element.fieldType === "checkbox") {
            fieldValidation = fieldValidation.oneOf(
              [true],
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

        pageSchema[fieldName] = fieldValidation;
      });

      schemas[pageIndex] = Yup.object().shape(pageSchema);
    });

    return { initialValues: values, validationSchemas: schemas };
  }, [form]);

  const formik = useFormik({
    initialValues,
    validationSchema: validationSchemas[currentStep],
    validateOnChange: true,
    validateOnBlur: true,
    onSubmit: async (values) => {
      if (currentStep < form.pages.length - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        console.log("Form submitted:", values);
        toast.success("Form submitted successfully!");
        formik.resetForm();
        setCurrentStep(0);
      }
    },
  });

  const currentPage = form?.pages[currentStep];
  const isLastStep = currentStep === form?.pages.length - 1;
  const isFirstStep = currentStep === 0;
  const progress = ((currentStep + 1) / form?.pages.length) * 100;

  const handleNext = async () => {
    const currentPageFields = currentPage.elements.map((el) => el.fieldName);
    const errors = await formik.validateForm();
    const currentPageErrors = Object.keys(errors).filter((key) =>
      currentPageFields.includes(key)
    );

    if (currentPageErrors.length === 0) {
      if (!isLastStep) {
        setCurrentStep(currentStep + 1);
        formik.setTouched({});
      }
    } else {
      currentPageErrors.forEach((field) => {
        formik.setFieldTouched(field, true);
      });
    }
  };

  const handlePrevious = () => {
    if (!isFirstStep) {
      setCurrentStep(currentStep - 1);
    }
  };

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
    } = element;
    const value = formik.values[fieldName];
    const error = formik.touched[fieldName] && formik.errors[fieldName];

    const renderInput = () => {
      switch (fieldType) {
        case "textarea":
          return (
            <Textarea
              id={fieldName}
              name={fieldName}
              value={value}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder={placeHolder}
              rows={4}
              className={error ? "border-red-500" : ""}
            />
          );

        case "select":
          const transformedOptions =
            fieldOptions?.map((option) => {
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

              return {
                value: optionValue,
                title: optionLabel,
              };
            }) || [];

          return (
            <CustomCombobox
              name={fieldName}
              id={fieldName}
              value={value}
              onChange={(val) => formik.setFieldValue(fieldName, val)}
              onBlur={() => formik.setFieldTouched(fieldName, true)}
              valueKey="value"
              labelKey="title"
              search={transformedOptions.length > 10 ? true : false}
              options={transformedOptions}
              placeholder={placeHolder || "Select an option"}
              className={error ? "border-red-500" : ""}
            />
          );

        case "radio":
          return (
            <RadioGroup
              className={"flex flex-wrap"}
              value={value}
              onValueChange={(val) => formik.setFieldValue(fieldName, val)}
            >
              {fieldOptions?.map((option, idx) => {
                // Parse if it's a JSON string
                let parsedOption = option;
                if (typeof option === "string") {
                  try {
                    parsedOption = JSON.parse(option);
                  } catch (e) {
                    parsedOption = option;
                  }
                }

                // Extract key-value pairs
                const optionValue =
                  parsedOption.value ||
                  Object.keys(parsedOption)[0] ||
                  parsedOption;
                const optionLabel =
                  parsedOption.label ||
                  Object.values(parsedOption)[0] ||
                  parsedOption;

                return (
                  <div key={idx} className="inline-flex items-center space-x-2">
                    <RadioGroupItem
                      className={
                        "data-[state=checked]:[&>span>svg]:fill-blue-500 data-[state=checked]:[&>span>svg]:text-blue-500"
                      }
                      value={optionValue}
                      id={`${fieldName}-${idx}`}
                    />
                    <Label
                      htmlFor={`${fieldName}-${idx}`}
                      className="font-normal cursor-pointer mb-0 "
                    >
                      {optionLabel}
                    </Label>
                  </div>
                );
              })}
            </RadioGroup>
          );

        case "checkbox":
          return (
            <div className={"flex flex-wrap"}>
              {fieldOptions?.map((option, idx) => {
                // Parse if it's a JSON string
                let parsedOption = option;
                if (typeof option === "string") {
                  try {
                    parsedOption = JSON.parse(option);
                  } catch (e) {
                    parsedOption = option;
                  }
                }

                // Extract key-value pairs
                const optionValue =
                  parsedOption.value ||
                  Object.keys(parsedOption)[0] ||
                  parsedOption;
                const optionLabel =
                  parsedOption.label ||
                  Object.values(parsedOption)[0] ||
                  parsedOption;

                // Handle array value for multiple checkboxes
                const isChecked = Array.isArray(value)
                  ? value.includes(optionValue)
                  : value === optionValue;

                return (
                  <div key={idx} className="inline-flex items-center gap-4">
                    <Checkbox
                      className={
                        "data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                      }
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
            <Input
              type="file"
              id={fieldName}
              onChange={(e) =>
                formik.setFieldValue(fieldName, e.target.files[0])
              }
              onBlur={formik.handleBlur}
              className={error ? "border-red-500" : ""}
            />
          );

        case "html":
          return (
            <>
              <ReactQuill
                value={value}
                onChange={(content) => formik.setFieldValue(fieldName, content)}
                onBlur={() => formik.setFieldTouched(fieldName, true)}
                placeholder={placeHolder}
                theme="snow"
                className= {error ? "border-red-500" : "w-full min-h-72 flex flex-col [&>.ql-container.ql-snow]:flex [&>.ql-container.ql-snow]:flex-col [&>.ql-container>.ql-editor]:grow [&>.ql-toolbar.ql-snow]:rounded-t-xl [&>.ql-container.ql-snow]:rounded-b-xl [&>.ql-container.ql-snow]:flex-grow"}
              />
            </>
          );

        case "hidden":
          return (
            <Input
              type="hidden"
              id={fieldName}
              name={fieldName}
              value={value}
              onChange={formik.handleChange}
            />
          );

        case "date":
          return (
            <Input
              type="date"
              id={fieldName}
              name={fieldName}
              value={value}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={error ? "border-red-500" : ""}
            />
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
              className={error ? "border-red-500" : ""}
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
              className={error ? "border-red-500" : ""}
            />
          );
      }
    };

    if (fieldType === "hidden") {
      return renderInput();
    }

    return (
      <div key={_id} className="flex flex-col gap-1.5">
        <div className="flex flex-wrap justify-between">
          <Label className={"mb-0"} htmlFor={fieldName}>
            {fieldTitle || fieldName}{" "}
            {isRequired && <sup className="text-red-500">*</sup>}
          </Label>
          {fieldDescription && (
            <p className="text-xs text-muted-foreground">{fieldDescription}</p>
          )}
        </div>
        <div className="relative pb-3.5">
          {renderInput()}
          {error && (
            <p className="capitalize text-xs text-red-500 absolute left-0 -bottom-1">
              {error}
            </p>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading form builder...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-zinc-50">
      <div className="max-w-6xl mx-auto py-9 ">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        {form.pages.length > 1 && (
          <div className="relative py-4">
            {/* Progress Bar */}
            <Progress
              value={progress}
              className="h-2 absolute top-8 bg-muted [&>div]:bg-blue-500"
            />

            {/* Step Indicators */}
            <ul className="flex items-center justify-between">
              {form.pages.map((page, index) => (
                <li
                  key={index}
                  className="flex flex-col items-center gap-2.5 basis-0 flex-1 text-center relative z-10"
                >
                  <div
                    className={cn(
                      "flex items-center justify-center size-9 2xl:size-10 rounded-full font-semibold border border-solid transition-all",
                      index < currentStep
                        ? "bg-green-500 text-white"
                        : index === currentStep
                        ? "border-blue-500 bg-white"
                        : "bg-muted border-muted text-muted-foreground"
                    )}
                  >
                    {index < currentStep ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      index + 1
                    )}
                  </div>
                  <div
                    className={cn(
                      "capitalize font-medium text-xs 2xl:text-sm",
                      index === currentStep
                        ? "text-foreground"
                        : "text-muted-foreground"
                    )}
                  >
                    {page.name}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Form Content */}
        <div className="flex-1 overflow-y-auto ">
          <Card>
            <CardHeader className={"!px-0"}>
              <CardTitle>{currentPage.name}</CardTitle>
              <CardDescription>{currentPage.description}</CardDescription>
            </CardHeader>
            <CardContent>
              {currentPage.elements.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Eye className="h-12 w-12 mx-auto mb-4 opacity-20" />
                  <p className="text-lg font-medium">No elements on this page</p>
                  <p className="text-sm">Add fields to see them here</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {currentPage.elements.map((element) => renderField(element))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={handlePrevious}
            disabled={isFirstStep}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>

          {isLastStep ? (
            <Button type="button" onClick={formik.handleSubmit}>
              <Check className="h-4 w-4 mr-2" />
              Submit Form
            </Button>
          ) : (
            <Button type="button" onClick={handleNext}>
              Next
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
        {/* </DialogContent>
        </Dialog> */}
      </div>
    </div>
  );
}

export default FormPreview;
