"use client";

import { useFormik } from "formik";
import * as Yup from "yup";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useEffect, useState } from "react";
import EntryCard from "./EntryCard";
import { postRequest, userPostRequest } from "@/service/viewService";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const validationSchema = Yup.object().shape({
  name: Yup.string()
    .required("Name is required")
    .min(2, "Name must be at least 2 characters"),
  contact_no: Yup.string()
    .required("Contact number is required")
    .matches(/^[0-9]{10,}$/, "Contact number must be at least 10 digits"),
});

export function BasicForm({ eventData }) {
  const [scannerData, setScannerData] = useState(null);
  const [stepInner, setStepInner] = useState(1);
  const [entryData, setEntryData] = useState(null);

  useEffect(() => {
    setStepInner(1);
  }, []);
  const formik = useFormik({
    initialValues: {
      name: "",
      contact_no: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        const formData = new FormData();
        formData.append("name", values.name);
        formData.append("contact_no", values.contact_no);  
        formData.append("event_id", eventData?._id);    
        const response = await postRequest("instant-register-form", formData);
        if (response.status === 1 && response.data) {
          setStepInner(2);
          setEntryData(response.data);
        } else {
          toast.error(response.message || "Failed to submit the form. Please try again.");
        }
      } catch (error) {
        console.error("Error submitting form:", error);
        toast.error("Failed to submit the form. Please try again.");
      }
    },
  });

  useEffect(() => {    
    const scanner_data = JSON.parse(
      sessionStorage.getItem("scannerloginToken")
    );
    if (scanner_data) {
      setScannerData(scanner_data);
    }
  }, []);

  function handleBackEvent() {
    setStepInner(1);
    formik.resetForm();
  }

  return (
    <>
      {stepInner === 1 && (
        <div className="relative w-full max-w-md">
          <Card className="relative z-10 bg-white backdrop-blur shadow-[0_0_0_10px_rgba(255,255,255,0.25)]">
            <CardContent>
                <h2 className="text-center text-xl 2xl:text-2xl font-bold text-gray-900 mb-3">Welcome to {eventData?.eventName}</h2>
                <form onSubmit={formik.handleSubmit} className="flex flex-col gap-4">
                    {/* Name Field */}

                    <div className="flex flex-col gap-1">
                        <Label htmlFor="name" className={'mb-0'}>Name</Label>
                        <div className="relative pb-3.5">
                            <Input
                                id="name"
                                name="name"
                                type="tel"
                                value={formik.values.name}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                placeholder="Enter your name"
                                className={cn("bg-muted", formik.touched.name && formik.errors.name ? "border-red-500" : "")}
                            />
                            {formik.touched.name && formik.errors.name && (
                                <span className="text-red-500 text-xs absolute -bottom-1 left-0 mt-1">{formik.errors.name}</span>
                            )}
                        </div>
                    </div>

                    {/* Contact Number Field */}
                    <div className="flex flex-col gap-1">
                    <Label htmlFor="contact_no" className="text-gray-700 font-semibold">Contact Number</Label>
                        <div className="relative pb-3.5">
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">+91</span>
                                <Input id="contact_no" type="tel" placeholder="Enter your contact number" inputMode="numeric" {...formik.getFieldProps("contact_no")} className={`h-11 text-base pl-12 2xl:pl-12 ${formik.touched.contact_no && formik.errors.contact_no ? "border-red-500 focus-visible:ring-red-500" : "border-gray-300 focus-visible:ring-blue-500"}`} />
                            </div>
                            {formik.touched.contact_no && formik.errors.contact_no && (
                                <span className="text-red-500 text-xs font-medium absolute -bottom-1 left-0">{formik.errors.contact_no}</span>
                            )}
                        </div>
                    </div>

                    {/* Submit Button */}
                    <Button type="submit" disabled={formik.isSubmitting} className="mt-4 w-full h-12 text-base font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 !text-white rounded-lg transition-all duration-200">{formik.isSubmitting ? "Submitting..." : scannerData && scannerData.type == 0 ? "Check In" : "Check Out"}</Button>
                </form>
            </CardContent>
          </Card>
        </div>
      )}
      {stepInner === 2 && (
        <EntryCard entryData={entryData} eventData={eventData} onRedirect={handleBackEvent} />
      )}
    </>
  );
}
