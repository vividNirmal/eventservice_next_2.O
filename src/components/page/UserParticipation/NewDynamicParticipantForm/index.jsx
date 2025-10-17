"use client";
import React, { useState, useMemo, useEffect } from "react";

import { Button } from "@/components/ui/button";
import { FormRenderer } from "@/components/form-renderer/form-renderer";
import { toast } from "sonner";
import { Camera, CheckCircle2, UploadIcon, Loader2 } from "lucide-react";
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
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import dynamic from "next/dynamic";
import { cn } from "@/lib/utils";
import { DynamicSelect } from "@/components/form-builder/dynamicSelected";
import { SafeImage } from "@/components/common/SafeImage";
import FaceScanner from "../../scanner/mediabutton/faceScanner/FaceScanner";

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

const NewDynamicParticipantForm = ({
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
  const [form, setForm] = useState(null);
  
  // Face scanner states
  const [stopScanner, setStopScanner] = useState(true);
  const [capturedImage, setCapturedImage] = useState(null);
  const [faceImage, setFaceImage] = useState(null);
  const [faceScannerPopup, setFaceScannerPopup] = useState(false);
  const [face, setFace] = useState(null);
  const [submitting, setSubmitting] = useState(false);

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

  // Generate initial values and validation schema for ALL pages combined
  const { initialValues, validationSchema } = useMemo(() => {
    const values = {};
    const schemaFields = {};

    if (!form?.pages) return { initialValues: {}, validationSchema: Yup.object() };

    // Combine all pages' elements
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

        schemaFields[fieldName] = fieldValidation;
      });
    });

    return {
      initialValues: values,
      validationSchema: Yup.object().shape(schemaFields)
    };
  }, [form]);

  const formik = useFormik({
    initialValues,
    validationSchema,
    validateOnChange: true,
    validateOnBlur: true,
    onSubmit: async (values) => {
      // Check if face scanner is required
      if (eventData?.with_face_scanner == 1 && !face) {
        toast.error("Please capture or upload your face image");
        return;
      }

      setSubmitting(true);
      try {
        // Include face data with form values
        const submissionData = { ...values };
        if (face) {
          submissionData.faceScan = face;
        }
        
        await onFormSuccess(submissionData);
        
        formik.resetForm();
        setCapturedImage(null);
        setFace(null);
        setFaceImage(null);
      } catch (error) {
        console.error("Submission error:", error);
        toast.error("Failed to submit form");
      } finally {
        setSubmitting(false);
      }
    },
  });

  // Face Scanner Functions
  function onCameraError(Data) {
    toast.error(Data);
  }

  const onEventImageSelected = (event) => {
    const inputElement = event.target;
    const allowedExtensions = ["image/png", "image/jpeg", "image/jpg"];

    if (inputElement.files && inputElement.files.length > 0) {
      const file = inputElement.files[0];

      if (!allowedExtensions.includes(file.type)) {
        toast.error("Only PNG and JPG files are allowed.");
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setCapturedImage(e.target.result);
        setFace(file);
        setFaceImage(file);
      };
      reader.readAsDataURL(file);
    }
  };

  const faceScannerData = async (event) => {
    try {
      const image = event?.image;
      if (!image) {
        return;
      }

      setFaceImage(image);
      await handleScanFace(image);
    } catch (error) {
      console.error("Error processing image:", error);
    }
  };

  const handleScanFace = async (imageData = null) => {
    const imageToProcess = imageData || faceImage;

    if (!imageToProcess) {
      toast.error("Please position your face in the camera to capture an image");
      return;
    }

    let faceImageFile;
    try {
      if (imageToProcess.startsWith("blob:") || imageToProcess.startsWith("http")) {
        const resp = await fetch(imageToProcess);
        const blob = await resp.blob();
        faceImageFile = new File([blob], "faceImage.png", {
          type: blob.type || "image/png",
        });
      } else if (imageToProcess.startsWith("data:")) {
        try {
          const resp = await fetch(imageToProcess);
          const blob = await resp.blob();
          faceImageFile = new File([blob], "faceImage.png", {
            type: blob.type || "image/png",
          });
        } catch (fetchErr) {
          const match = imageToProcess.match(/^data:(.+);base64,(.*)$/);
          if (!match) throw fetchErr;
          const mime = match[1];
          const base64 = match[2].replace(/\s/g, "");
          const binary = atob(base64);
          const u8 = new Uint8Array(binary.length);
          for (let i = 0; i < binary.length; i++) u8[i] = binary.charCodeAt(i);
          const blob = new Blob([u8], { type: mime });
          faceImageFile = new File([blob], "faceImage.png", { type: mime });
        }
      } else {
        const resp = await fetch("data:image/png;base64," + imageToProcess);
        const blob = await resp.blob();
        faceImageFile = new File([blob], "faceImage.png", { type: "image/png" });
      }
    } catch (error) {
      console.error("Error converting image:", error);
      toast.error("Failed to process image. Please try again.");
      return;
    }

    if (faceImageFile) {
      const url = URL.createObjectURL(faceImageFile);
      setCapturedImage(url);
      setFaceScannerPopup(false);
      setStopScanner(true);
      setFace(faceImageFile);
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
            <Textarea
              id={fieldName}
              name={fieldName}
              value={value}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder={placeHolder}
              rows={4}
              className={cn("bg-white", error ? "border-red-500" : "")}
            />
          );
        case "select":
          return (
            <DynamicSelect
              element={element}
              value={value}
              onChange={(val) => formik.setFieldValue(fieldName, val)}
              onBlur={() => formik.setFieldTouched(fieldName, true)}
              error={error}
              formValues={formik.values}
            />
          );
        case "radio":
          return (
            <RadioGroup
              className={"flex flex-col mt-2"}
              value={value}
              onValueChange={(val) => formik.setFieldValue(fieldName, val)}
            >
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
                    <RadioGroupItem
                      className={"data-[state=checked]:[&>span>svg]:fill-blue-500 data-[state=checked]:[&>span>svg]:text-blue-500"}
                      value={optionValue}
                      id={`${fieldName}-${idx}`}
                    />
                    <Label htmlFor={`${fieldName}-${idx}`} className="font-normal cursor-pointer mb-0">
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
                const isChecked = Array.isArray(value) ? value.includes(optionValue) : value === optionValue;

                return (
                  <div key={idx} className="inline-flex items-center gap-4">
                    <Checkbox
                      className={"data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"}
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
                    <Label htmlFor={`${fieldName}-${idx}`} className="font-normal cursor-pointer mb-0">
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
                accept={fileType ? fileType.map((type) => `.${type}`).join(",") : undefined}
                onChange={(e) => {
                  const file = e.target.files[0];
                  formik.setFieldValue(fieldName, file);
                  formik.setFieldTouched(fieldName, true);
                }}
                onBlur={formik.handleBlur}
                className={cn("bg-white !py-1", error ? "border-red-500" : "")}
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
              className={error ? "border-red-500" : "[&>div]:bg-white w-full min-h-52 flex flex-col [&>.ql-container.ql-snow]:flex [&>.ql-container.ql-snow]:flex-col [&>.ql-container>.ql-editor]:grow [&>.ql-toolbar.ql-snow]:rounded-t-xl [&>.ql-container.ql-snow]:rounded-b-xl [&>.ql-container.ql-snow]:flex-grow"}
            />
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
              className={cn("bg-white", error ? "border-red-500" : "")}
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
      return renderInput();
    }

    return (
      <div
        key={_id}
        className={cn(
          "flex flex-col gap-1 grow",
          (fieldType === "textarea" || fieldType === "html" || fieldType === "radio" || fieldType === "checkbox")
            ? "w-full"
            : "w-full lg:w-5/12"
        )}
      >
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
          <p className="text-gray-600">Loading form...</p>
        </div>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="h-screen flex items-center justify-center">
        <p className="text-gray-600">No form available</p>
      </div>
    );
  }

  return (
    <div className="h-svh flex flex-wrap gap-5 p-4 bg-[#f7f9fc]">
      <div className="w-1/3 relative rounded-2xl max-h-[calc(100svh_-_32px)] overflow-hidden hidden lg:block">
        <SafeImage src={ticketData?.desktopBannerImageUrl} mobileSrc={ticketData?.mobileBannerImageUrl} placeholderSrc="/assets/images/login-img.webp" alt="Event" width={1200} height={600} className="max-w-full w-full h-full object-cover object-center absolute top-0 left-0" />
        {eventData?.event_description && (
          <div className="absolute bottom-0 left-0 right-0 p-3 xl:p-4 m-4 rounded-lg bg-white/10 backdrop-blur-lg border border-solid border-white/15">
            <h2 className="text-white text-xl 2xl:text-2xl mb-3 font-bold">{eventData?.eventName}</h2>
            <span className="h-px w-full block bg-linear-to-r from-white to-white/0 my-3"></span>
            <p className="z-1 text-white text-sm 2xl:text-lg font-normal leading-normal">{eventData?.event_description}</p>
          </div>
        )}
      </div>

      <div className="w-2/5 grow flex flex-col p-1 pr-3 border border-solid border-zinc-200 shadow-[0_0_6px_0_rgba(0,55,255,25%)] rounded-xl bg-white">
        <div className="h-96 grow overflow-auto custom-scroll">
          <Card className={"rounded-none border-0 shadow-none !pb-0"}>
            <CardHeader className={"px-0 2xl:px-0 border-b"}>
              <CardTitle>Registration Form</CardTitle>
              <CardDescription>Please fill in all required fields</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Render all form pages in sections */}
              {form.pages.map((page, pageIndex) => (
                <div key={pageIndex} className="space-y-4 bg-white">
                  {form.pages.length > 1 && (
                    <div>
                      <h3 className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-danger bg-clip-text text-transparent">{page.name}</h3>
                      {page.description && (
                        <span className="text-sm text-muted-foreground">{page.description}</span>
                      )}
                    </div>
                  )}
                  <div className="flex flex-wrap gap-x-4 gap-y-2">
                    {page.elements.map((element) => renderField(element))}
                  </div>
                </div>
              ))}

              {/* Face Scanner Section - Only show if required */}
              {eventData?.with_face_scanner == 1 && (
                <div className="space-y-4 border border-solid border-zinc-200 border-b-0 rounded-t-xl p-6 ">
                  <h3 className="text-lg font-semibold flex items-center justify-center">
                    <Camera className="size-5 mr-2 text-blue-500" />
                    Face Verification
                    <sup className="text-red-500">*</sup>
                  </h3>
                  <div className={cn("size-40 mx-auto flex items-center justify-center border-2 border-dashed overflow-hidden rounded-full text-gray-400", capturedImage ? "border-blue-600" : "border-gray-300")}>
                    {
                      capturedImage ? (
                        <img src={capturedImage} alt="Captured" className="object-cover size-full block" />
                      ) : "No image"
                    }
                  </div>
                  <div className="flex flex-wrap items-center justify-center gap-4">
                    <Button type="button" onClick={() => setFaceScannerPopup(true)} className="flex items-center gap-2" variant="outline">
                      <Camera className="size-4" />
                      Capture Face
                    </Button>
                    
                    <Label htmlFor="face_image" className="cursor-pointer flex items-center gap-2 px-4 py-2 border rounded-md hover:bg-gray-50 transition-colors">
                      <UploadIcon className="size-4" />
                      Upload Image
                      <input type="file" id="face_image" className="hidden" accept=".jpg, .jpeg, .png" onChange={onEventImageSelected} />
                    </Label>
                  </div>

                  {capturedImage && (
                    <p className="text-sm font-medium text-green-600 flex items-center justify-center gap-2">
                      <CheckCircle2 className="size-4" />
                      Image captured successfully
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
          <div className="shrink-0 flex items-center justify-center py-4 px-4 border-t">
            <Button
              type="button"
              onClick={formik.handleSubmit}
              disabled={submitting}
              variant="formBtn"
              className="w-full rounded-full max-w-fit"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Check className="size-4" />
                  Submit Registration
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Face Scanner Popup */}
      <Dialog open={faceScannerPopup} onOpenChange={() => setFaceScannerPopup(false)}>
        <DialogTitle className={'sr-only'}>Face Scanner</DialogTitle>
        <DialogContent className="sm:max-w-[425px] p-0 flex-col">
          <FaceScanner allowScan={stopScanner} onCameraError={onCameraError} onManualCapture={faceScannerData} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NewDynamicParticipantForm;
