"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Camera, Lightbulb, AlertCircle } from "lucide-react";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { postRequest, userPostRequest } from "@/service/viewService";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

export default function Attendence() {
  const [subdomain, setSubdomain] = useState("");
  const [isCheckingToken, setIsCheckingToken] = useState(true);
  const [isValidUrl, setIsValidUrl] = useState(true); // New state for URL validation
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Save the first landing URL
    if (!localStorage.getItem("scannerEntryUrl")) {
      localStorage.setItem("scannerEntryUrl", window.location.href);
    }

    const host = window.location.hostname;
    const parts = host.split(".");
    const currentSubdomain = parts.length > 1 ? parts[0] : "";
    
    let currentEventSlug = searchParams.get("event_slug");
    let key = searchParams.get("key");
    let isCleanUrl = false;

    // If URL parameters are missing, try to get them from localStorage (after logout or clean URL)
    if (!key || !currentEventSlug) {
      key = localStorage.getItem("tempAttendanceKey");
      currentEventSlug = localStorage.getItem("tempAttendanceEventSlug");
      isCleanUrl = true; // This indicates we're using a clean URL
    }

    // Set subdomain regardless of token status - this page should be publicly accessible
    if (currentSubdomain) {
      setSubdomain(currentSubdomain);
    }

    // For clean URLs without any parameters, show the page anyway
    // We'll handle the key entry through the form
    if (!key || !currentEventSlug) {
      // Don't set isValidUrl to false for clean URLs - let the page render
      console.log("Clean URL detected - no parameters found, proceeding with form entry");
      setIsCheckingToken(false);
      return;
    }

    // Only clean up temporary localStorage items if not using clean URL
    // For clean URLs, we keep the localStorage items for the session
    if (!isCleanUrl && localStorage.getItem("tempAttendanceKey")) {
      localStorage.removeItem("tempAttendanceKey");
      localStorage.removeItem("tempAttendanceEventSlug");
    }

    // Use sessionStorage instead of localStorage for scanner tokens
    // This automatically clears when tab is closed
    const storedTokenData = sessionStorage.getItem("scannerloginToken");
    if (storedTokenData) {
      try {
        const tokenData = JSON.parse(storedTokenData);
        
        // If user is already logged in with a valid token, redirect to scanner-attendee page
        if (tokenData.token && currentEventSlug) {
          router.push(`/scanner-attendee/${currentSubdomain}/${currentEventSlug}`);
          return; // Exit early if redirecting
        }
      } catch (e) {
        console.log("Invalid token data in sessionStorage", e);
        sessionStorage.removeItem("scannerloginToken");
      }
    }

    // Whether token exists or not, allow access to this page for device registration
    setIsCheckingToken(false);
  }, [router, searchParams]);


  console.log("window.location.href", window.location.href)

  const formik = useFormik({
    initialValues: {
      deviceKey: "",
    },
    validationSchema: Yup.object({
      deviceKey: Yup.string().trim().required("Device key is required"),
    }),
    onSubmit: async (values) => {
      try {
        const formData = new FormData();
        
        // Get key from URL params or localStorage
        const urlKey = searchParams.get("key");
        const storedKey = localStorage.getItem("tempAttendanceKey");
        const keyToUse = urlKey || storedKey;
        
        // Get event_slug from URL params or localStorage  
        const urlEventSlug = searchParams.get("event_slug");
        const storedEventSlug = localStorage.getItem("tempAttendanceEventSlug");
        const eventSlugToUse = urlEventSlug || storedEventSlug;
        
        // For clean URLs without parameters, we'll handle this differently
        if (!keyToUse) {
          // For now, show an error - we can implement key lookup later
          toast.error("Please access this page through a valid device URL");
          return;
        }
        
        formData.append("key", keyToUse);
        formData.append("deviceKey", values.deviceKey);
        
        const res = await userPostRequest("verify-device-and-login", formData);
        if (res?.data?.token) {
          // Save token + event info to sessionStorage (clears when tab closes)
          const tokenData = {
            token: res.data.token,
            type: res.data.type,
            scanner_unique_id: res.data.scanner_unique_id
          };
          sessionStorage.setItem("scannerloginToken", JSON.stringify(tokenData));

          // Clean up temporary items
          localStorage.removeItem("tempAttendanceKey");
          localStorage.removeItem("tempAttendanceEventSlug");

          // router.push(`/${subdomain}/attendee/${eventSlugToUse}`);
          router.push(`/scanner-attendee/${subdomain}/${eventSlugToUse}`);
        } else {
          toast.error(res?.error || "Invalid device key");
        }
      } catch (err) {
        toast.error("Login failed. Please try again.");
      }
    },
  });

  if (isCheckingToken) {
    return <div className="h-svh flex items-center justify-center">Loading...</div>;
  }

  // Show invalid URL message when key or event_slug is missing
  if (!isValidUrl) {
    return (
      <section className="h-svh content-center px-4 relative bg-cover bg-no-repeat bg-center bg-[url('/assets/images/scanner-bg.webp')]">
        <Card className="md:max-w-2xl w-full mx-auto lg:p-7 bg-white/5 backdrop-blur-lg border-white/15">
          <CardHeader className="sr-only">
            <CardTitle>Invalid URL</CardTitle>
            <CardDescription>URL validation error</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center text-white text-center py-12">
            <AlertCircle className="size-16 mb-4 text-red-400" />
            <h2 className="text-xl md:text-2xl font-semibold mb-2">
              Sorry, Invalid URL
            </h2>
            <p className="text-sm md:text-base text-white/80 mb-6">
              The URL you are trying to access is missing required parameters or is invalid.
            </p>
            <p className="text-xs md:text-sm text-white/60">
              Please check the URL and try again.
            </p>
          </CardContent>
        </Card>
      </section>
    );
  }

  return (
    <section className="md:h-svh py-4 content-center px-4 relative bg-cover bg-no-repeat bg-center bg-[url('/assets/images/scanner-bg.webp')]">
      <Card className="md:max-w-2xl w-full mx-auto lg:p-7 bg-white/5 backdrop-blur-lg border-white/15">
        <CardHeader className="sr-only">
          <CardTitle>Card Title</CardTitle>
          <CardDescription>Card Description</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap text-white">
          <div className="w-full md:w-1/3 md:grow">
            <Image
              src="/assets/new.webp"
              alt="Virtual registration"
              width={250}
              height={250}
              className="rounded-2xl max-w-full mx-auto md:mx-0 mb-5 md:mb-0"
            />
          </div>
          <div className="max-w-2xs mx-auto md:max-w-full w-full md:w-1/3 md:grow">
            <h2 className="text-[15px] md:text-[18px] xl:text-xl font-semibold text-white text-center">Registration</h2>
            <h2 className="text-[15px] md:text-[18px] xl:text-xl font-semibold text-white mb-5 text-center">Check-in / Check-Out Device</h2>
            {/* <h6 className="mb-2 text-[14px] md:text-lg font-medium text-white">
              Please note:
            </h6>
            <ul className="flex flex-col gap-1.5 mb-5">
              <li className="text-xs md:text-sm flex flex-wrap items-center gap-2.5">
                <Camera className="size-4" />
                <span>Look directly at the camera</span>
              </li>
              <li className="text-xs md:text-sm flex flex-wrap items-center gap-2.5">
                <Lightbulb className="size-4" />
                <span>Turn on lights if it's dark</span>
              </li>
            </ul> */}
            <form onSubmit={formik.handleSubmit}>
              <div className="flex flex-col gap-4">
                <div>
                  <Input
                    type="text"
                    name="deviceKey"
                    value={formik.values.deviceKey}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="h-9 text-white placeholder:text-white"
                    placeholder="Enter Device key"
                  />
                  {formik.touched.deviceKey && formik.errors.deviceKey && (
                    <p className="text-red-400 text-sm mt-1">
                      {formik.errors.deviceKey}
                    </p>
                  )}
                </div>
                <Button
                  type="submit"
                  className="border-black hover:border-white h-9"
                >
                  Get Started
                </Button>
              </div>
            </form>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
