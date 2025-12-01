"use client";

import { useFormik } from "formik";
import * as Yup from "yup";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useCallback, useEffect, useState } from "react";
import EntryCard from "./EntryCard";
import { userPostRequest } from "@/service/viewService";
import FaceScanner from "../faceScanner/FaceScanner";
import { CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

const validationSchema = Yup.object().shape({
  name: Yup.string()
    .required("Name is required")
    .min(2, "Name must be at least 2 characters"),
  contact_no: Yup.string()
    .required("Contact number is required")
    .matches(/^[0-9]{10,}$/, "Contact number must be at least 10 digits"),
});

export function ContactForm({ eventData }) {
  const [scannerData, setScannerData] = useState(null);
  const [stepInner, setStepInner] = useState(1);
  const [entryData, setEntryData] = useState(null);
  const [stopScanner, setStopScanner] = useState(true);
  const [face, setFace] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);

  useEffect(() => {
    setStepInner(1);

    const scanner_data = JSON.parse(
      sessionStorage.getItem("scannerloginToken")
    );
    if (scanner_data) {
      setScannerData(scanner_data);
    }
  }, []);

  // Memoize callbacks to prevent FaceScanner remounting
  const onCameraError = useCallback((Data) => {
    toast.error(Data);
  }, []);

  const faceScannerData = useCallback(async (event) => {
    try {
      const image = event?.image;
      if (!image) {
        return;
      }      
      await handleScanFace(image);
    } catch (error) {
      console.error("Error processing image:", error);
    }
  }, []);

  const handleScanFace = async (imageData = null) => {
    const imageToProcess = imageData;

    if (!imageToProcess) {
      toast.error(
        "Please position your face in the camera to capture an image"
      );
      return;
    }

    let faceImageFile;
    try {
      if (
        imageToProcess.startsWith("blob:") ||
        imageToProcess.startsWith("http")
      ) {
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
        faceImageFile = new File([blob], "faceImage.png", {
          type: "image/png",
        });
      }
    } catch (error) {
      console.error("Error converting image:", error);
      toast.error("Failed to process image. Please try again.");
      return;
    }

    if (faceImageFile) {
      const url = URL.createObjectURL(faceImageFile); // create temporary preview URL
      setCapturedImage(url);
      setStopScanner(true);
      setFace(faceImageFile);
    }
  };

  const formik = useFormik({
    initialValues: {
      name: "",
      contact_no: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      // Validate face is captured before submission
      if (!face) {
        toast.error("Please capture your face before submitting");
        return;
      }

      try {
        const formData = new FormData();
        formData.append("name", values.name);
        formData.append("contact_no", values.contact_no);
        formData.append("event_id", eventData?._id);
        formData.append("faceScan", face);

        const response = await userPostRequest("instant-register-form", formData);
        if (response.status === 1 && response.data) {
          setStepInner(2);
          setEntryData(response.data);
        } else {
          toast.error(response?.message || response?.error || "Failed to submit the form. Please try again.");
        }           
      } catch (error) {                
        console.error("Error submitting form:", error);
        toast.error("Failed to submit the form. Please try again.");
      }
    },
  });

  function handleBackEvent() {
    setStepInner(1);
    formik.resetForm();
    setCapturedImage(null);
  }

  return (
    <>
      {stepInner === 1 && (
        <div className="relative w-full max-w-md">
          <Card className="relative z-10 bg-white backdrop-blur shadow-[0_0_0_10px_rgba(255,255,255,0.25)]">
            <CardContent>
                <h2 className="text-center text-xl 2xl:text-2xl font-bold text-gray-900 mb-3">Welcome to {eventData?.eventName}</h2>
                <form onSubmit={formik.handleSubmit} className="flex flex-col gap-3 2xl:gap-4">
                    <div className="grid 2xl:grid-cols-1 lg:grid-cols-2 gap-3 2xl:gap-4">
                        {/* Name Field */}
                        <div className="flex flex-col gap-1">
                            <Label htmlFor="name" className={'mb-0'}>Name</Label>
                            <div className="relative pb-3.5">
                                <Input
                                    id="name"
                                    name="name"
                                    type="text"
                                    value={formik.values.name}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    placeholder="Enter your name"
                                    className={
                                        formik.touched.name && formik.errors.name
                                        ? "border-red-500"
                                        : ""
                                    }
                                />
                                {formik.touched.name && formik.errors.name && (
                                    <p className="text-red-500 text-xs absolute -bottom-1 left-0">
                                        {formik.errors.name}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Contact Number Field */}
                        <div className="flex flex-col gap-1">
                            <Label htmlFor="contact_no" className="mb-0">Contact Number</Label>
                            <div className="relative pb-3.5">
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium text-sm">+91</span>
                                    <Input
                                        id="contact_no"
                                        name= "contact_no"
                                        type="tel"
                                        placeholder="Enter your contact number"
                                        inputMode="numeric"
                                        maxLength={10}
                                        value={formik.values.contact_no}
                                        onChange={formik.handleChange}
                                        className={`text-base pl-12 2xl:pl-12 ${
                                        formik.touched.contact_no && formik.errors.contact_no
                                            ? "border-red-500 focus-visible:ring-red-500"
                                            : "border-gray-300 focus-visible:ring-blue-500"
                                        }`}
                                    />
                                </div>
                                {formik.touched.contact_no && formik.errors.contact_no && (
                                    <p className="text-red-500 text-xs font-medium absolute -bottom-1 left-0">
                                        {formik.errors.contact_no}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {capturedImage ? (
                        <div className="pt-4">
                            <img src={capturedImage} alt="Captured" className="rounded-lg shadow-lg h-52 2xl:h-72 mx-auto" />
                            <p className="text-sm 2xl:text-base font-medium text-green-600 mt-4 flex items-center justify-center gap-2">
                                <CheckCircle2 className="size-5" />
                                Face captured successfully
                            </p>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setCapturedImage(null);
                                    setFace(null);
                                }}
                                className="w-full mt-3"
                            >
                                Recapture Face
                            </Button>
                        </div>
                    ):(
                        <FaceScanner
                            allowScan={stopScanner}
                            onCameraError={onCameraError}
                            onManualCapture={faceScannerData}
                            captureMode={false}
                            newCaptureMode={true}
                        />
                    )}

                    {/* Submit Button */}
                    <Button 
                        type="submit" 
                        disabled={formik.isSubmitting || !face} 
                        className="w-full h-12 text-base font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 !text-white rounded-lg transition-all duration-200 mt-2"
                    >
                        {formik.isSubmitting ? "Submitting..." : scannerData && scannerData.type == 0 ? "Check In" : "Check Out"}
                    </Button>
                </form>
            </CardContent>
          </Card>
        </div>
      )}
      {stepInner === 2 && (
        <EntryCard
          entryData={entryData}
          eventData={eventData}
          onRedirect={handleBackEvent}
        />
      )}
    </>
  );
}