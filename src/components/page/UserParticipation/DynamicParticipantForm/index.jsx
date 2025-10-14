"use client";
import React, { useState, useMemo, useEffect } from "react";

import { Button } from "@/components/ui/button";
import { FormRenderer } from "@/components/form-renderer/form-renderer";
import { toast } from "sonner";
import { User, CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { userGetRequest, userPostRequest } from "@/service/viewService";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Eye, ChevronLeft, ChevronRight, Check } from "lucide-react";
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
import { Progress } from "@/components/ui/progress";
import dynamic from "next/dynamic";
import { useParams, useRouter } from "next/navigation";
import { getRequest } from "@/service/viewService";
import { cn } from "@/lib/utils";
import { DynamicSelect } from "@/components/form-builder/dynamicSelected";
const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

const DynamicParticipantForm = ({
  userEmail,
  eventData,
  formData,
  faceScannerPermission,
  eventHasFacePermission,
  dynamicForm,
  formLoading = false,
  onFormSuccess,
  ticketData
}) => {
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [form, setForm] = useState(null);  

  useEffect(() => {        
    if (dynamicForm) {      
      fetchForm();
    }
  }, [dynamicForm]);

  const fetchForm = async () => {
    if (!dynamicForm) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await userGetRequest(`/forms/${dynamicForm}`);
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
  const { initialValues, validationSchemas } = useMemo(() => {
    const values = {};
    const schemas = {};

    form?.pages.forEach((page, pageIndex) => {
      const pageSchema = {};

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
                if (!value) return true; // Allow empty if not required
                if (!element.fileType || element.fileType.length === 0)
                  return true;

                const fileExtension = value.name.split(".").pop().toLowerCase();
                const allowedTypes = element.fileType.map((type) =>
                  type.toLowerCase()
                );

                if (!allowedTypes.includes(fileExtension)) {
                  return this.createError({
                    message: `Only ${element.fileType.join(
                      ", "
                    )} files are allowed`,
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
        onFormSuccess(values)
        toast.success("Form submitted successfully!");
        formik.resetForm();
        setCurrentStep(0);
      }
    },
  });

  // Clear dependent fields when parent field changes
  const prevValuesRef = React.useRef({});

  useEffect(() => {
    if (!currentPage) return;

    currentPage.elements.forEach((element) => {
      if (element.optionDepending) {
        const dependentFieldName = element.optionDepending;
        const currentValue = formik.values[dependentFieldName];
        const previousValue = prevValuesRef.current[dependentFieldName];

        // Reset field value only when dependent field value actually changes
        if (previousValue !== undefined && currentValue !== previousValue) {
          formik.setFieldValue(element.fieldName, "");
        }
      }
    });

    // Update previous values
    prevValuesRef.current = { ...formik.values };
  }, [formik.values, currentPage]);

  var currentPage = form?.pages[currentStep];
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

  // const handleNext = () => {
  //   if (!isLastStep) {
  //     setCurrentStep(currentStep + 1);
  //     formik.setTouched({});
  //   }
  // };

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
          <RadioGroup className={"flex flex-wrap"} value={value} onValueChange={(val) => formik.setFieldValue(fieldName, val)}>
            {fieldOptions?.map((option, idx) => {
              let parsedOption = option;
              if (typeof option === "string") {
                try {
                  parsedOption = JSON.parse(option);
                } catch (e) {
                  parsedOption = option;
                }
              }
              const optionValue = parsedOption.value || Object.keys(parsedOption)[0] || parsedOption;
              const optionLabel = parsedOption.label || Object.values(parsedOption)[0] || parsedOption;

              return (
                <div key={idx} className="inline-flex items-center space-x-2">
                  <RadioGroupItem className={"data-[state=checked]:[&>span>svg]:fill-blue-500 data-[state=checked]:[&>span>svg]:text-blue-500"} value={optionValue} id={`${fieldName}-${idx}`} />
                  <Label htmlFor={`${fieldName}-${idx}`} className="font-normal cursor-pointer mb-0 ">{optionLabel}</Label>
                </div>
              );
            })}
          </RadioGroup>
        );
        case "checkbox":
        return (
          <div className={"flex flex-wrap"}>
            {fieldOptions?.map((option, idx) => {
              let parsedOption = option;
              if (typeof option === "string") {
                try { parsedOption = JSON.parse(option); } catch (e) { parsedOption = option;}
              }

              const optionValue = parsedOption.value || Object.keys(parsedOption)[0] || parsedOption;
              const optionLabel = parsedOption.label || Object.values(parsedOption)[0] || parsedOption;
              const isChecked = Array.isArray(value) ? value.includes(optionValue) : value === optionValue;

              return (
                <div key={idx} className="inline-flex items-center gap-4">
                  <Checkbox className={"data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"} id={`${fieldName}-${idx}`} checked={isChecked}
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
                  <Label htmlFor={`${fieldName}-${idx}`} className="font-normal cursor-pointer mb-0">{optionLabel}</Label>
                </div>
              );
            })}
          </div>
        );
        case "file":
        return (
          <div>
            <Input type="file" id={fieldName} accept={fileType ? fileType.map((type) => `.${type}`).join(",") : undefined} onChange={(e) => {const file = e.target.files[0]; formik.setFieldValue(fieldName, file); formik.setFieldTouched(fieldName, true);}} onBlur={formik.handleBlur} className={cn("bg-white !py-1", error ? "border-red-500" : "")} />
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
          <>
            <ReactQuill value={value} onChange={(content) => formik.setFieldValue(fieldName, content)} onBlur={() => formik.setFieldTouched(fieldName, true)} placeholder={placeHolder} theme="snow" className={error ? "border-red-500" : "[&>div]:bg-white w-full min-h-52 flex flex-col [&>.ql-container.ql-snow]:flex [&>.ql-container.ql-snow]:flex-col [&>.ql-container>.ql-editor]:grow [&>.ql-toolbar.ql-snow]:rounded-t-xl [&>.ql-container.ql-snow]:rounded-b-xl [&>.ql-container.ql-snow]:flex-grow"} />
          </>
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
          <Input type="password" id={fieldName} name={fieldName} value={value} onChange={formik.handleChange} onBlur={formik.handleBlur} placeholder={placeHolder} className={cn("bg-white", error ? "border-red-500" : "")} />
        );
        default:
        return (
          <Input type={fieldType} id={fieldName} name={fieldName} value={value} onChange={formik.handleChange} onBlur={formik.handleBlur} placeholder={placeHolder} className={cn("bg-white", error ? "border-red-500" : "")} />
        );
      }
    };

    if (fieldType === "hidden") {
      return renderInput();
    }

    return (
      <div key={_id} className={cn("flex flex-col gap-1 grow", (fieldType === "textarea" || fieldType === "html") ? "w-full" : "w-full lg:w-5/12")}>
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
            <p className="capitalize text-xs text-red-500 absolute left-0 -bottom-1">{error}</p>
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
    <div className="h-svh flex flex-wrap gap-y-5 p-4 bg-[#f7f9fc]">
      <div className="w-1/3 relative rounded-2xl max-h-[calc(100svh_-_32px)] overflow-hidden hidden lg:block">
        <img src={ticketData?.desktopBannerImageUrl || "/assets/images/login-img.webp"} className="max-w-full w-full object-cover h-svh transition-all duration-100 ease-linear" alt="" />
        {
          eventData?.event_description && (
          <div className="absolute bottom-0 left-0 right-0 p-3 xl:p-4 m-4 rounded-lg bg-white/10 backdrop-blur-lg border border-solid border-white/15">
            <p className="z-1 text-white text-sm xl:text-base 2xl:text-lg font-normal leading-normal">{eventData?.event_description}</p>
          </div>
          )
        }
      </div>
      <div className="w-2/5 grow lg:px-5 2xl:px-9 max-h-svh flex flex-col">
        {form.pages.length > 1 && (
          <div className="relative py-4">
            <Progress value={progress} className="h-1 absolute top-9 bg-muted [&>div]:bg-[#3853ff]" />
            <ul className="flex items-center justify-between">
              {form.pages.map((page, index) => (
                <li key={index} className="flex flex-col items-center gap-1.5 md:gap-2.5 basis-0 w-fit md:flex-1 text-center relative z-10">
                  <div className={cn("flex items-center justify-center text-sm md:text-base size-8 md:size-9 2xl:size-10 rounded-lg md:rounded-xl font-semibold border border-solid shadow-[0_0_0_10px_#f7f9fc] transition-all", index < currentStep ? "bg-[#3853ff] text-white" : index === currentStep ? "bg-[#3853ff] border-[#3853ff] text-white" : "bg-muted border-zinc-200 text-muted-foreground")}>{index < currentStep ? (<Check className="h-5 w-5" />) : (index + 1)}</div>
                  <div className={cn("capitalize font-medium text-xs sm:text-sm 2xl:text-base whitespace-nowrap", index === currentStep ? "text-foreground" : "text-muted-foreground")}>{page.name}</div>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="overflow-auto h-96 grow pr-1">
          <Card className={"rouneded-none border-0 shadow-none !p-1 bg-transparent"}>
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
                <div className="flex flex-wrap gap-x-4 gap-y-2">{currentPage.elements.map((element) => renderField(element))}</div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="shrink-0 flex items-center justify-between pt-4">
          <Button type="button" variant="outline" onClick={handlePrevious} disabled={isFirstStep}>
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>

          {isLastStep ? (
            <Button type="button" onClick={formik.handleSubmit}>
              <Check className="h-4 w-4 mr-2" />
              Submit Form
            </Button>
          ) : (
            <Button type="button" onClick={handleNext} variant={"formBtn"}>
              Next
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DynamicParticipantForm;
