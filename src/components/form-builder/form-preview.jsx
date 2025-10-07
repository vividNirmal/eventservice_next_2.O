"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Eye, X, ChevronLeft, ChevronRight, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
const ReactQuill = dynamic(() => import("react-quill-new"), {
  ssr: false,
});

/**
 * Form Preview Component
 * Shows a preview of how the form will look to end users
 */
function FormPreview() {
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
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
          return (
            <Select
              value={value}
              onValueChange={(val) => formik.setFieldValue(fieldName, val)}
            >
              <SelectTrigger className={error ? "border-red-500" : ""}>
                <SelectValue placeholder="Select an option" />
              </SelectTrigger>
              <SelectContent>
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
                    <SelectItem key={idx} value={optionValue}>
                      {optionLabel}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          );

        case "radio":
          return (
            <RadioGroup
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
                  <div key={idx} className="flex items-center space-x-2">
                    <RadioGroupItem
                      value={optionValue}
                      id={`${fieldName}-${idx}`}
                    />
                    <Label
                      htmlFor={`${fieldName}-${idx}`}
                      className="font-normal cursor-pointer"
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
            <div className="flex items-center space-x-2">
              <Checkbox
                id={fieldName}
                checked={value}
                onCheckedChange={(checked) =>
                  formik.setFieldValue(fieldName, checked)
                }
              />
              <Label htmlFor={fieldName} className="font-normal cursor-pointer">
                {placeHolder || "Check this box"}
              </Label>
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
            <div className="border rounded-md">
              <ReactQuill
                value={value}
                onChange={(content) => formik.setFieldValue(fieldName, content)}
                onBlur={() => formik.setFieldTouched(fieldName, true)}
                placeholder={placeHolder}
                theme="snow"
              />
            </div>
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
      <div key={_id} className="space-y-2">
        <Label htmlFor={fieldName}>
          {fieldTitle || fieldName}
          {isRequired && <span className="text-red-500 ml-1">*</span>}
        </Label>
        {fieldDescription && (
          <p className="text-xs text-muted-foreground">{fieldDescription}</p>
        )}
        {renderInput()}
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading form builder...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Button type="button" variant="outline" onClick={() => router.back()}>
        <ChevronLeft className="h-4 w-4 mr-2" />
        Back
      </Button>      

      {/* <Dialog open={isOpen} onOpenChange={setIsOpen} className="w-full">
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle>{form.formName}</DialogTitle>
                <DialogDescription>
                  <Badge variant="secondary" className="mt-1">
                    {form.userType}
                  </Badge>
                </DialogDescription>
              </div>
            </div>
          </DialogHeader> */}

      {form.pages.length > 1 && (
        <>
          {/* Progress Bar */}
          <div className="space-y-2">
            {/* <Progress value={progress} className="h-2" /> */}
            <p className="text-sm text-muted-foreground text-center">
              Step {currentStep + 1} of {form.pages.length}
            </p>
          </div>
          {/* Step Indicators */}
          <div className="flex items-center justify-between py-4">
            {form.pages.map((page, index) => (
              <div key={index} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`flex items-center justify-center w-10 h-10 rounded-full font-semibold transition-all ${
                      index < currentStep
                        ? "bg-green-500 text-white"
                        : index === currentStep
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {index < currentStep ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      index + 1
                    )}
                  </div>
                  <div
                    className={`mt-2 text-xs font-medium text-center ${
                      index === currentStep
                        ? "text-primary"
                        : "text-muted-foreground"
                    }`}
                  >
                    {page.name}
                  </div>
                </div>
                {index < form.pages.length - 1 && (
                  <div
                    className={`h-1 flex-1 mx-2 rounded transition-all ${
                      index < currentStep ? "bg-green-500" : "bg-muted"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {/* Form Content */}
      <div className="flex-1 overflow-y-auto">
        <Card>
          <CardHeader>
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
              <div className="space-y-6">
                {currentPage.elements.map((element) => renderField(element))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t">
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
  );
}

export default FormPreview;
