"use client";
import React, { useEffect, useState } from "react";
import { useFormik } from "formik";

import { Button } from "@/components/ui/button";
import * as Yup from "yup";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  ArrowUpRight,
  Building2,
  Camera,
  FileText,
  Globe,
  Loader2,
  MapPin,
  Phone,
  ScanFace,
  UploadIcon,
  User,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Download, Printer, PrinterCheck } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  pdfgenrate,
  userGetRequest,
  userPostRequest,
} from "@/service/viewService";
import { CustomCombobox } from "@/components/common/customcombox";
import FaceScanner from "../../scanner/mediabutton/faceScanner/FaceScanner";
import { DialogTitle } from "@radix-ui/react-dialog";
import { toast } from "sonner";
import { FormRenderer } from "@/components/form-renderer/form-renderer";

const ParticipantForm = ({
  userEmail,
  eventData,
  formData,
  faceScannerPermission,
  eventHasFacePermission,
  visitReason,
  companyVisit,
  dynamicForm, // New prop for dynamic form
}) => {
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [capturedImage, setCapturedImage] = useState(null);
  const [faceImage, setFaceImage] = useState(null);
  const [faceScannerPopup, setFaceScannerPopup] = useState(false);
  const [stopScanner, setStopScanner] = useState(true);
  const [thankDilog, setThankDilog] = useState(false);
  const [loader, setLoader] = useState(false);
  const [prfLoader, setPdfLoader] = useState(false);
  const [printLoader, setPrintLoader] = useState(false);
  const [submitting, setSubmitting] = useState(false); // For dynamic form submission

  const referenceSources = [
    { _id: 1, name: "Google Search", value: "Google Search" },
    { _id: 2, name: "Social Media", value: "Social Media" },
    { _id: 3, name: "WhatsApp", value: "WhatsApp" },
    { _id: 4, name: "Facebook", value: "Facebook" },
    { _id: 5, name: "Instagram", value: "Instagram" },
    { _id: 6, name: "Twitter", value: "Twitter" },
    { _id: 7, name: "TikTok", value: "TikTok" },
    { _id: 8, name: "Word of Mouth", value: "Word of Mouth" },
    { _id: 9, name: "Advertisement", value: "Advertisement" },
    { _id: 10, name: "Email", value: "Email" },
    { _id: 11, name: "Other", value: "Other" },
  ];

  const formik = useFormik({
    initialValues: {
      first_name: "",
      last_name: "",
      designation: "",
      organization: "",
      contact: "",
      address: "",
      email: "",
      country: "",
      state: "",
      city: "",
      visit_reason: "",
      company_visit: "",
      reference_source: "",
      file: null,
    },
    validationSchema: Yup.object({
      first_name: Yup.string().required("First name is required"),
      last_name: Yup.string().required("Last name is required"),
      designation: Yup.string().required("Designation is required"),
      organization: Yup.string().required("Organization is required"),
      contact: Yup.string().required("Contact is required"),
      address: Yup.string().required("Address is required"),
      country: Yup.string().required("Country is required"),
      state: Yup.string().required("State is required"),
      city: Yup.string().required("City is required"),
      // visit_reason: Yup.string().required("Visit reason is required"),
      // company_visit: Yup.string().required("Company visit is required"),
      // reference_source: Yup.string().required("Reference source is required"),
    }),
    onSubmit: async (values) => {
      setLoader(true);
      const integrationdata = new FormData();
      const keys = [
        "first_name",
        "last_name",
        "designation",
        "organization",
        "contact",
        "address",
      ];
      keys.forEach((key) => {
        integrationdata.append(key, values[key]);
      });
      if (userEmail) {
        integrationdata.append("email", userEmail);
      }
      integrationdata.append("event_id", formData.event_id);
      integrationdata.append("user_token", formData.user_token);
      integrationdata.append("country", values.country);
      integrationdata.append("state", values.state);
      integrationdata.append("city", values.city);
      integrationdata.append("visit_reason", values.visit_reason);
      integrationdata.append("company_activity", values.company_visit);
      integrationdata.append("referral_source", values.reference_source);
      if (faceScannerPermission && faceImage) {
        integrationdata.append("file", faceImage);
      } else {
        integrationdata.delete("file");
      }
      try {
        const responce = await userPostRequest(
          "store-participant-details",
          integrationdata
        );

        if (responce.error) {
          toast.error(responce.error);
        } else {
          setThankDilog(true);
        }
        setLoader(false);
      } catch (error) {
        console.log(error);
      }

      // You can call `onRegisterInformation(values)` here if needed.
    },
  });

  // Handle dynamic form submission
  const handleDynamicFormSubmit = async (formSubmissionData) => {
    try {
      setSubmitting(true);
      
      // Prepare form data for submission including event details
      const submissionData = new FormData();
      
      // Add event context
      submissionData.append("event_id", formData.event_id);
      submissionData.append("user_token", formData.user_token);
      if (userEmail) {
        submissionData.append("email", userEmail);
      }
      
      // Add dynamic form data
      Object.keys(formSubmissionData).forEach(key => {
        if (formSubmissionData[key] !== null && formSubmissionData[key] !== undefined) {
          if (formSubmissionData[key] instanceof File) {
            submissionData.append(key, formSubmissionData[key]);
          } else if (Array.isArray(formSubmissionData[key])) {
            submissionData.append(key, JSON.stringify(formSubmissionData[key]));
          } else {
            submissionData.append(key, formSubmissionData[key]);
          }
        }
      });
      
      // Add face scanner data if available
      if (faceScannerPermission && faceImage) {
        submissionData.append("face_image", faceImage);
      }
      
      // Submit to backend - using existing endpoint with dynamic form data
      const response = await userPostRequest("store-participant-details", submissionData);
      
      if (response.error) {
        toast.error(response.error);
      } else {
        toast.success(dynamicForm.settings?.confirmationMessage || 'Form submitted successfully!');
        setThankDilog(true);
      }
    } catch (error) {
      console.error('Dynamic form submission error:', error);
      toast.error('Failed to submit form. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    fetchCountries();
  }, []);

  useEffect(() => {
    if (!countries.length) return;

    if (formData) {
      formik.setValues({
        first_name: formData.first_name || "",
        last_name: formData.last_name || "",
        designation: formData.designation || "",
        contact: formData.contact || "",
        address: formData.address || "",
        email: formData.email || "",
      });
      if (formData?.country && countries.length) {
        const matchedCountry = countries.find(
          (country) => country.name === formData.country
        );
        if (matchedCountry?.name) {
          formik.setFieldValue("country", matchedCountry.name);
          fetchStates(matchedCountry._id).then((states) => {
            const matchedState = states?.find(
              (state) => state.name === formData.state
            );
            if (matchedState?.name) {
              formik.setFieldValue("state", matchedState.name);
              fetchCities(matchedState._id).then((cities) => {
                const matchedCity = cities?.find(
                  (city) => city.name === formData.city
                );
                if (matchedCity?.name) {
                  formik.setFieldValue("city", matchedCity.name);
                }
              });
            }
          });
        }
      }
    }
    if (eventData) {
      formik.setFieldValue("organization", eventData?.organizer_name || " ");
    }
  }, [eventData, formData, countries]);

  const fetchCountries = async () => {
    try {
      const res = await userGetRequest("get-country");
      const data = await res.data;

      if (data?.country) setCountries(data.country);
    } catch (error) {
      console.error("Error fetching countries:", error);
    }
  };
  const fetchStates = async (courtyid) => {
    try {
      const res = await userGetRequest(`get-state/${courtyid}`);
      const data = await res.data;
      if (data?.state) {
        setStates(data.state);
        return data.state;
      }
    } catch (error) {
      console.error("Error fetching countries:", error);
    }
  };
  const fetchCities = async (stateid) => {
    try {
      const res = await userGetRequest(`get-city/${stateid}`);
      const data = await res.data;

      if (data?.city) {
        setCities(data.city);
        return data.city;
      }
    } catch (error) {
      console.error("Error fetching countries:", error);
    }
  };

  const handleFaceImage = (imageData) => {
    const base64 = imageData.image.replace(/^data:image\/\w+;base64,/, "");
    const binary = atob(base64);
    const array = new Uint8Array(binary.length).map((_, i) =>
      binary.charCodeAt(i)
    );
    const blob = new Blob([array], { type: "image/png" });
    const file = new File([blob], "faceImage.png", { type: "image/png" });

    setCapturedImage(imageData.image);
    setFaceImage(file);
  };
  function onCameraError(Data) {
    toast.error(Data);
  }

  const handleCountryChange = (value) => {
    formik.setFieldValue("country", value);
    const matchedCountry = countries.find((country) => country.name == value);
    fetchStates(matchedCountry._id);
  };
  const handleChangeStates = (value) => {
    formik.setFieldValue("state", value);
    const matchedState = states?.find((state) => state.name == value);
    fetchCities(matchedState._id);
  };

  const generatePdf = async () => {
    try {
      setPdfLoader(true);

      const Adddata = new FormData();
      Adddata.append("event_slug", eventData.event_slug);
      Adddata.append("user_token", formData.user_token);

      const response = await pdfgenrate("generate-event-pdf-scanner", Adddata);

      // Create a Blob URL for download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.download = `${eventData.event_slug}.pdf`;
      document.body.appendChild(link);
      link.click();

      // Cleanup
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("PDF Download Error:", error);
    } finally {
      setPdfLoader(false);
    }
  };

  const printPdf = async () => {
    setPrintLoader(true);
    try {
      const Adddata = new FormData();
      Adddata.append("event_slug", eventData.event_slug);
      Adddata.append("user_token", formData.user_token);
      const blob = await pdfgenrate("generate-event-pdf-scanner", Adddata);
      const url = URL.createObjectURL(blob);
      const iframe = document.createElement("iframe");
      iframe.style.display = "none";
      iframe.src = url;
      document.body.appendChild(iframe);
      iframe.onload = () => {
        iframe.contentWindow.focus();
        iframe.contentWindow.print();
        setPrintLoader(false);
      };
    } catch (e) {
      console.error(e);
      setPrintLoader(false);
    }
  };

  function handleFaseScane(params) {
    if (faceImage) {
      setFaceScannerPopup(false);
      setStopScanner(true);
    } else {
      toast.error("Try Again");
    }
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
        setFaceImage(file);
      };
      reader.readAsDataURL(file);
    }
  };

  // Helper function to get field status
  const getFieldStatus = (fieldName) => {
    const isTouched = formik.touched[fieldName];
    const hasError = formik.errors[fieldName];
    const hasValue = formik.values[fieldName];

    if (hasError && isTouched) return "error";
    if (hasValue && !hasError) return "success";
    return "default";
  };

  // Helper function to get input styling based on status
  const getInputStyles = (fieldName) => {
    const status = getFieldStatus(fieldName);
    // Remove border change on focus: no focus:border-* or focus:ring-*
    const baseStyles =
      "py-3 px-4 text-sm border-2 transition-all duration-300 bg-white/80 backdrop-blur-sm focus:outline-none";

    switch (status) {
      case "error":
        return `${baseStyles} border-red-300 text-red-900 placeholder-red-400`;
      case "success":
        return `${baseStyles} border-green-300 text-green-900`;
      default:
        return `${baseStyles} border-slate-200 text-slate-900`;
    }
  };

  // Helper function to render field status icon
  const renderFieldStatus = (fieldName) => {
    // Show checkmark if field is touched, has no error, and has a value
    console.log("fieldName", formik.values.country);
    if (
      formik.touched[fieldName] &&
      !formik.errors[fieldName] &&
      formik.values[fieldName]
    ) {
      return (
        <>
          {formik.values.country ||
          formik.values.state ||
          formik.values.city ? (
            ""
          ) : (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            </div>
          )}
        </>
      );
    }
    // Show error icon if field is touched and has error (optional, can uncomment AlertCircle)
    // if (formik.touched[fieldName] && formik.errors[fieldName]) {
    //   return (
    //     <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
    //       <AlertCircle className="h-5 w-5 text-red-500" />
    //     </div>
    //   );
    // }
    return null;
  };

  // Helper function to render error message
  const renderErrorMessage = (fieldName) => {
    if (
      (formik.touched[fieldName] || formik.submitCount > 0) &&
      formik.errors[fieldName]
    ) {
      return (
        <div className="flex items-center gap-2 mt-2 text-red-600 text-sm animate-in slide-in-from-top-2 duration-300">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span className="font-medium">{formik.errors[fieldName]}</span>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4 lg:p-6">
      <Card className="gap-3 w-full max-w-5xl shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
        <CardHeader className="text-center p-6 pb-4 2xl:pb-8 pt-0 2xl:pt-10 lg:px-10">
          <div className="mx-auto size-10 lg:size-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mb-2 2xl:mb-6">
            <User className="size-6 lg:size-8 text-white" />
          </div>
          <CardTitle className="text-[22px] lg:text-3xl font-bold text-slate-800">
            {dynamicForm ? dynamicForm.title : "Personal Information"}
          </CardTitle>
          <CardDescription className="text-slate-600 text-sm lg:text-base leading-relaxed lg:max-w-2xl mx-auto">
            {dynamicForm 
              ? dynamicForm.description || "Please fill out this form completely."
              : "Thank you for your patience. Your information is valuable to us and will be handled with the utmost care and confidentiality."
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="px-6 pb-4 lg:px-10 2xl:pb-10">
          {dynamicForm ? (
            // Render dynamic form
            <div className="space-y-6">
              <FormRenderer 
                form={dynamicForm} 
                onSubmit={handleDynamicFormSubmit}
                loading={submitting}
              />
              
              {/* Face Scanner Integration for Dynamic Form */}
              {eventHasFacePermission && faceScannerPermission && (
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4">Face Scanner</h3>
                  <div className="flex items-center gap-4">
                    <Button
                      type="button"
                      onClick={() => {
                        setFaceScannerPopup(true);
                        setStopScanner(true);
                      }}
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <ScanFace className="w-4 h-4" />
                      Capture Face
                    </Button>
                    {faceImage && (
                      <div className="flex items-center gap-2 text-green-600">
                        <CheckCircle2 className="w-4 h-4" />
                        <span className="text-sm">Face captured successfully</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            // Render static form (existing form)
            <form
              onSubmit={formik.handleSubmit}
              className="space-y-8 2xl:space-y-10 pb-3.5"
            >
            {/* Personal Details Section */}
            <div className="space-y-6 2xl:space-y-8">
              <div className="flex items-center gap-2 lg:gap-4 mb-4 2xl:mb-6">
                <div className="size-8 lg:size-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                  <User className="size-4 lg:size-5 text-white" />
                </div>
                <h3 className="text-[14px] lg:text-xl font-bold text-slate-800 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Personal Details
                </h3>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-8">
                <div className="space-y-2">
                  <Label
                    htmlFor="first_name"
                    className="text-sm font-semibold text-slate-700 flex items-center gap-2"
                  >
                    First Name <span className="text-red-500 text-lg">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      name="first_name"
                      placeholder="Enter your first name"
                      value={formik.values.first_name}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className={getInputStyles("first_name")}
                    />
                    {renderFieldStatus("first_name")}
                  </div>
                  {renderErrorMessage("first_name")}
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="last_name"
                    className="text-sm font-semibold text-slate-700 flex items-center gap-2"
                  >
                    Last Name <span className="text-red-500 text-lg">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      name="last_name"
                      placeholder="Enter your last name"
                      value={formik.values.last_name}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className={getInputStyles("last_name")}
                    />
                    {renderFieldStatus("last_name")}
                  </div>
                  {renderErrorMessage("last_name")}
                </div>
              </div>
            </div>

            {/* Professional Information Section */}
            <div className="space-y-6 2xl:space-y-8">
              <div className="flex items-center gap-3 lg:gap-4 mb-4 2xl:mb-6">
                <div className="size-8 lg:size-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Building2 className="size-4 lg:size-5 text-white" />
                </div>
                <h3 className="text-[14px] lg:text-xl font-bold text-slate-800 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Professional Information
                </h3>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-8">
                <div className="space-y-2">
                  <Label
                    htmlFor="designation"
                    className="text-sm font-semibold text-slate-700 flex items-center gap-2"
                  >
                    Designation <span className="text-red-500 text-lg">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      name="designation"
                      placeholder="e.g., Senior Manager, Director"
                      value={formik.values.designation}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className={getInputStyles("designation")}
                    />
                    {renderFieldStatus("designation")}
                  </div>
                  {renderErrorMessage("designation")}
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="organization"
                    className="text-sm font-semibold text-slate-700 flex items-center gap-2"
                  >
                    Organization <span className="text-red-500 text-lg">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      name="organization"
                      placeholder="Enter your organization name"
                      value={formik.values.organization}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className={getInputStyles("organization")}
                    />
                    {renderFieldStatus("organization")}
                  </div>
                  {renderErrorMessage("organization")}
                </div>
              </div>
            </div>

            {/* Contact Information Section */}
            <div className="space-y-6 2xl:space-y-8">
              <div className="flex items-center gap-3 lg:gap-4 mb-4 2xl:mb-6">
                <div className="size-8 lg:size-10 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Phone className="size-4 lg:size-5 text-white" />
                </div>
                <h3 className="text-[14px] lg:text-xl font-bold text-slate-800 bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  Contact Information
                </h3>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-8">
                <div className="space-y-2">
                  <Label
                    htmlFor="contact"
                    className="text-sm font-semibold text-slate-700 flex items-center gap-2"
                  >
                    Contact Number{" "}
                    <span className="text-red-500 text-lg">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      name="contact"
                      type="number"
                      placeholder="+91 999999999"
                      value={formik.values.contact}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className={getInputStyles("contact")}
                    />
                    {renderFieldStatus("contact")}
                  </div>
                  {renderErrorMessage("contact")}
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="country"
                    className="text-sm font-semibold text-slate-700 flex items-center gap-2"
                  >
                    Country <span className="text-red-500 text-lg">*</span>
                  </Label>
                  <div className="">
                    <CustomCombobox
                      name="country"
                      value={formik.values.country}
                      onChange={handleCountryChange}
                      onBlur={() => formik.setFieldTouched("country", true)}
                      valueKey="name"
                      labelKey="name"
                      options={countries}
                      placeholder="Select Country"
                      id="country"
                      className={getInputStyles("country")}
                    />
                    {renderFieldStatus("country")}
                  </div>
                  {renderErrorMessage("country")}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-8">
                <div className="space-y-2">
                  <Label
                    htmlFor="state"
                    className="text-sm font-semibold text-slate-700 flex items-center gap-2"
                  >
                    State/Province{" "}
                    <span className="text-red-500 text-lg">*</span>
                  </Label>
                  <div className="relative">
                    <CustomCombobox
                      name="state"
                      value={formik.values.state}
                      onChange={handleChangeStates}
                      onBlur={() => formik.setFieldTouched("state", true)}
                      valueKey="name"
                      labelKey="name"
                      options={states}
                      placeholder="Select State"
                      id="state"
                      className={getInputStyles("state")}
                    />
                    {renderFieldStatus("state")}
                  </div>
                  {renderErrorMessage("state")}
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="city"
                    className="text-sm font-semibold text-slate-700 flex items-center gap-2"
                  >
                    City <span className="text-red-500 text-lg">*</span>
                  </Label>
                  <div className="relative">
                    <CustomCombobox
                      name="city"
                      value={formik.values.city}
                      onChange={(value) => formik.setFieldValue("city", value)}
                      onBlur={() => formik.setFieldTouched("city", true)}
                      valueKey="name"
                      labelKey="name"
                      options={cities}
                      placeholder="Select City"
                      id="city"
                      className={getInputStyles("city")}
                    />
                    {renderFieldStatus("city")}
                  </div>
                  {renderErrorMessage("city")}
                </div>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="address"
                  className="text-sm font-semibold text-slate-700 flex items-center gap-2"
                >
                  <div className="size-8 lg:size-10 bg-gradient-to-r from-slate-500 to-gray-600 rounded-xl flex items-center justify-center shadow-lg">
                    <MapPin className="size-4 lg:size-5 text-white" />
                  </div>
                  Complete Address{" "}
                  <span className="text-red-500 text-lg">*</span>
                </Label>
                <div className="relative mt-4">
                  <Textarea
                    id="address"
                    name="address"
                    value={formik.values.address}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="Enter your complete address including street, city, postal code..."
                    className={`min-h-28 resize-none transition-all duration-300 bg-white/80 backdrop-blur-sm focus:outline-none ${
                      getFieldStatus("address") === "error"
                        ? "border-2 border-red-300 text-red-900 placeholder-red-400"
                        : getFieldStatus("address") === "success"
                        ? "border-2 border-green-300 text-green-900"
                        : "border-2 border-slate-200 text-slate-900"
                    }`}
                  />
                  {renderFieldStatus("address")}
                </div>
                {renderErrorMessage("address")}
              </div>
            </div>

            {/* Business Information Section */}
            <div className="space-y-6 lg:space-y-8">
              <div className="flex items-center gap-3 lg:gap-4 mb-4 2xl:mb-6">
                <div className="size-8 lg:size-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Globe className="size-4 lg:size-5 text-white" />
                </div>
                <h3 className="text-[14px] lg:text-xl font-bold text-slate-800 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Business Information
                </h3>
              </div>

              <div className="space-y-3 2xl:space-y-8">
                {/* First Row: Two fields side by side */}
                <div className="flex flex-col lg:flex-row gap-3 lg:gap-6">
                  <div className="flex-1 space-y-2">
                    <Label
                      htmlFor="companyActivity"
                      className="text-sm font-semibold text-slate-700 flex items-center gap-2"
                    >
                      Company's Main Activity{" "}
                      <span className="text-red-500 text-lg">*</span>
                    </Label>
                    <div className="relative">
                      <CustomCombobox
                        name="company_visit"
                        value={formik.values.company_visit}
                        onChange={(value) =>
                          formik.setFieldValue("company_visit", value)
                        }
                        onBlur={() =>
                          formik.setFieldTouched("company_visit", true)
                        }
                        valueKey="_id"
                        labelKey="company_activity"
                        options={companyVisit}
                        placeholder="Select company's main activity"
                        id="companyActivity"
                        className={getInputStyles("company_visit")}
                      />
                      {renderFieldStatus("company_visit")}
                    </div>
                    {renderErrorMessage("company_visit")}
                  </div>

                  <div className="flex-1 space-y-2">
                    <Label
                      htmlFor="visitingReasons"
                      className="text-sm font-semibold text-slate-700 flex items-center gap-2"
                    >
                      Reasons for Visiting{" "}
                      <span className="text-red-500 text-lg">*</span>
                    </Label>
                    <div className="relative">
                      <CustomCombobox
                        name="visit_reason"
                        value={formik.values.visit_reason}
                        onChange={(value) =>
                          formik.setFieldValue("visit_reason", value)
                        }
                        onBlur={() =>
                          formik.setFieldTouched("visit_reason", true)
                        }
                        options={visitReason}
                        valueKey="_id"
                        labelKey="reason"
                        placeholder="Select reasons for visiting"
                        id="visitingReasons"
                        className={getInputStyles("visit_reason")}
                      />
                      {renderFieldStatus("visit_reason")}
                    </div>
                    {renderErrorMessage("visit_reason")}
                  </div>
                </div>

                {/* Second Row: One field taking 50% width */}
                <div className="w-full lg:w-[48.5%] space-y-2">
                  <Label
                    htmlFor="hearAbout"
                    className="text-sm font-semibold text-slate-700 flex items-center gap-2"
                  >
                    How did you hear about us?{" "}
                    <span className="text-red-500 text-lg">*</span>
                  </Label>
                  <div className="relative">
                    <CustomCombobox
                      name="reference_source"
                      value={formik.values.reference_source}
                      onChange={(value) =>
                        formik.setFieldValue("reference_source", value)
                      }
                      onBlur={() =>
                        formik.setFieldTouched("reference_source", true)
                      }
                      valueKey="name"
                      labelKey="name"
                      options={referenceSources}
                      placeholder="Select how you heard about us"
                      id="hearAbout"
                      className={getInputStyles("reference_source")}
                    />
                    {renderFieldStatus("reference_source")}
                  </div>
                  {renderErrorMessage("reference_source")}
                </div>
              </div>

              {faceScannerPermission && eventHasFacePermission && (
                <div className="w-full mt-6 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200">
                  <h4 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                    <Camera className="size-5 text-blue-600" />
                    Face Verification
                  </h4>
                  <div className="flex flex-wrap items-center gap-4">
                    <Button
                      type="button"
                      onClick={() => setFaceScannerPopup(true)}
                      className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl h-auto shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                    >
                      <Camera className="size-5 mr-2" />
                      Capture Face
                    </Button>
                    <Label
                      htmlFor="event_image"
                      type="button"
                      className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl relative cursor-pointer shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                    >
                      <UploadIcon className="size-5" />
                      Upload Image
                      <input
                        type="file"
                        id="event_image"
                        className="opacity-0 absolute left-0 top-0 w-full h-full"
                        accept=".jpg, .jpeg, .png"
                        onChange={onEventImageSelected}
                      />
                    </Label>
                  </div>
                  {capturedImage && stopScanner && (
                    <div className="mt-4 p-4 bg-white rounded-xl border border-green-200">
                      <img
                        src={capturedImage}
                        alt="Captured"
                        className="max-w-48 rounded-lg shadow-lg"
                      />
                      <p className="text-sm text-green-600 mt-2 flex items-center gap-2">
                        <CheckCircle2 className="size-4" />
                        Image captured successfully
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Submit Button */}
              <div className="flex justify-center lg:pt-8 pt-2">
                <Button
                  type="submit"
                  disabled={loader}
                  className="px-[20px] bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-slate-400 disabled:to-slate-500 text-white lg:py-7 py-6 rounded-xl text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 disabled:transform-none disabled:cursor-not-allowed"
                >
                  {loader ? (
                    <div className="flex items-center gap-3">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Processing...
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      Continue
                      <ArrowUpRight className="size-6" />
                    </div>
                  )}
                </Button>
              </div>
            </div>
          </form>
          )}
        </CardContent>
      </Card>

      {/* Thank You Dialog */}
      <Dialog open={thankDilog} onOpenChange={() => setThankDilog(false)}>
        <DialogContent className="sm:max-w-xl p-0">
          <div className="flex flex-col w-full p-6 md:p-8 bg-white rounded-[32px]">
            {/* Custom SVG icon for the checkmark */}
            <svg
              width="56"
              height="56"
              viewBox="0 0 56 56"
              className="block mx-auto mb-[25px]"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g>
                <path
                  d="M56 28C56 24.206 54.334 20.6267 51.5083 18.3773C51.835 14.5927 50.4817 10.885 47.7983 8.19934C45.115 5.51834 41.4167 4.16734 37.8187 4.571C33.1193 -1.393 22.967 -1.505 18.3773 4.48934C14.588 4.15334 10.885 5.51367 8.20167 8.19934C5.52067 10.8827 4.16733 14.5927 4.57333 18.179C-1.39067 22.8783 -1.505 33.0307 4.49167 37.6227C4.165 41.4073 5.51833 45.115 8.20167 47.8007C10.885 50.4817 14.588 51.8373 18.1813 51.429C22.8807 57.393 33.033 57.505 37.6227 51.5107C41.4027 51.828 45.1127 50.4863 47.7983 47.8007C50.4793 45.1173 51.8327 41.4073 51.4267 37.821C54.334 35.3757 56 31.7963 56 28.0023V28ZM40.9267 24.654L29.869 35.3127C27.1553 38.0217 22.715 37.9983 20.0013 35.2823L14.7467 30.401C13.804 29.5237 13.748 28.0467 14.6253 27.104C15.505 26.159 16.9843 26.1077 17.9223 26.9827L23.2377 31.9223C24.213 32.8953 25.6877 32.893 26.5977 31.9807L37.6857 21.2917C38.6143 20.4003 40.0913 20.426 40.985 21.3523C41.881 22.2787 41.853 23.758 40.9267 24.6517V24.654Z"
                  fill="#EDBF0A"
                />
              </g>
            </svg>
            <h3 className="text-[#1E3238] font-semibold mb-2 md:mb-3 text-center text-2xl md:text-4xl xl:text-[40px]">
              Thank You!
            </h3>
            <p className="text-[#656565] font-normal text-center text-base md:text-xl mb-4 md:mb-6">
              You are now Registered!
            </p>
            <p className="text-[#656565] font-normal text-center text-sm md:text-base mb-4">
              Thank you for registering to attend the You will shortly receive
              your badge and registration code via email.
            </p>
            <p className="text-[#656565] font-normal text-center text-sm md:text-base mb-6 md:mb-8">
              Please present the code at the pre-registration counter on the day
              of the event along with your business card (mandatory) to collect
              your physical badge.
            </p>
            <div className="flex flex-wrap items-center gap-4 md:gap-10">
              <Button
                type="button"
                className="h-auto flex items-center justify-center gap-2 group flex-grow w-full md:w-2/5 py-3 px-12 text-sm lg:text-base font-medium rounded-3xl bg-[#005153] text-white border border-solid border-[#005153] hover:bg-white hover:text-[#005153] transition-all duration-300 ease-linear"
                onClick={generatePdf}
              >
                {prfLoader && (
                  <Loader2 className="h-10 w-10 mx-auto animate-spin" />
                )}
                Download PDF
                <Download className="w-5 h-5 group-hover:fill-[#005153] transition-all duration-300 ease-linear" />
              </Button>
              <Button
                type="button"
                className="h-auto flex items-center justify-center gap-2 group flex-grow w-full md:w-2/5 py-3 px-12 text-sm lg:text-base font-medium rounded-3xl bg-[#005153] text-white border border-solid border-[#005153] hover:bg-white hover:text-[#005153] transition-all duration-300 ease-linear"
                onClick={printPdf}
              >
                {printLoader && (
                  <Loader2 className="h-10 w-10 mx-auto animate-spin" />
                )}
                Print
                <PrinterCheck className="w-5 h-5 group-hover:fill-[#005153] transition-all duration-300 ease-linear" />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Face Scanner Modal */}
      {faceScannerPopup && (
        <Dialog
          open={faceScannerPopup}
          onOpenChange={() => setFaceScannerPopup(false)}
        >
          <DialogTitle>Face Scanner</DialogTitle>
          <DialogContent className="sm:max-w-[425px] p-0 flex-col">
            <FaceScanner
              allowScan={stopScanner}
              onCameraError={onCameraError}
              onFaceDetected={handleFaceImage}
            />

            <Button
              type="button"
              className="flex items-center justify-center gap-2 group  md:w-2/5 py-3 px-12 text-sm lg:text-base font-medium rounded-3xl bg-[#005153] text-white border border-solid border-[#005153] hover:bg-white hover:text-[#005153] transition-all duration-300 ease-linear"
              onClick={handleFaseScane}
            >
              Scan
              <ScanFace className="w-5 h-5 group-hover:fill-[#005153] transition-all duration-300 ease-linear" />
            </Button>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default ParticipantForm;
