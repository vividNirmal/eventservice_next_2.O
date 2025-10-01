"use client"

import React, { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { PhoneInputWithCountryCode } from "@/components/customComponents/customPhoneNumber/PhoneInputWithCountryCode";
import { CustomCombobox } from "@/components/common/customcombox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { visaRecommendations } from "@/lib/config";

const AddMemberSecond = ({ formik, values, setFieldValue, errors, touched, countries, formData, onSubmit }) => {
  const [profilePreview, setProfilePreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [buinesscardPreview, setBuinesscardPreview] = useState(null);
  const [PassportPreview, setPassportPreview] = useState(null);

  useEffect(() => {
    if (values) {
      // formik.setValues(values);

      // Profile
      if (values.profile_picture) {
        if (typeof values.profile_picture === "string") {
          setProfilePreview(values.profile_picture);
        } else if (values.profile_picture instanceof File) {
          const reader = new FileReader();
          reader.onloadend = () => setProfilePreview(reader.result);
          reader.readAsDataURL(values.profile_picture);
        }
      }

      // Business Card
      if (values.business_card) {
        console.log("Business Card:", values.business_card);
        if (typeof values.business_card === "string") {
          setBuinesscardPreview(values.business_card);
        } else if (values.business_card instanceof File) {
          const reader = new FileReader();
          reader.onloadend = () => setBuinesscardPreview(reader.result);
          reader.readAsDataURL(values.business_card);
        }
      }

      // Passport
      if (values.passport_image) {
        if (typeof values.passport_image === "string") {
          setPassportPreview(values.passport_image);
        } else if (values.passport_image instanceof File) {
          const reader = new FileReader();
          reader.onloadend = () => setPassportPreview(reader.result);
          reader.readAsDataURL(values.passport_image);
        }
      }
    }
  }, [values]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    const maxKB = 10240;
    if (file && file.size / 1024 > maxKB) {
      toast.error(`Image size should be less than ${maxKB}KB`);
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setProfilePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleImageChange = (event) => {
    const file = event.currentTarget.files[0];
    if (!file) return;

    // Validate file size
    const maxKB = 10240;
    if (file.size / 1024 > maxKB) {
      toast.error(`Image size should be less than ${maxKB}KB`);
      return;
    }

    // Validate file type
    if (!file.type.match("image.*")) {
      toast.error("Please select an image file");
      return;
    }

    setFieldValue("business_card", file); // Use setFieldValue prop instead of formik.setFieldValue
    const reader = new FileReader();
    reader.onloadend = () => {
      setBuinesscardPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handlePassportImageChange = (event) => {
    const file = event.currentTarget.files[0];
    if (!file) return;

    // Validate file size
    const maxKB = 10240;
    if (file.size / 1024 > maxKB) {
      toast.error(`Image size should be less than ${maxKB}KB`);
      return;
    }

    // Validate file type
    if (!file.type.match("image.*")) {
      toast.error("Please select an image file");
      return;
    }

    setFieldValue("passport_image", file); // Use setFieldValue prop instead of formik.setFieldValue
    const reader = new FileReader();
    reader.onloadend = () => {
      setPassportPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  return (
    <ScrollArea className="h-[calc(100svh_-_200px)] w-full rounded-md border p-4">
      <div className="space-y-6">
        <div className="grid gap-4">
          {/* Passport Number */}
          <div>
            <Label className="text-slate-600 pl-1 block mb-1 text-sm md:text-base">
              Passport Number
            </Label>
            <Input
              type="text"
              name="passport_no"
              placeholder="Enter Passport Number"
              className="text-gray-900 text-sm md:text-base font-normal block w-full border border-solid border-gray-300 px-3.5 p-2 rounded-full outline-none focus:shadow-[0_0_6px_rgba(0,0,0,0.12)] appearance-none transition-all duration-200 ease-linear"
              onChange={(e) => setFieldValue("passport_no", e.target.value)}
              value={values.passport_no || ""}
            />
            {touched.passport_no && errors.passport_no && (
              <div className="text-xs text-red-500 mt-1">{errors.passport_no}</div>
            )}
          </div>

          {/* Visa Recommendation */}
          <div>
            <Label className="pl-1 block mb-1 text-sm md:text-base capitalize text-slate-500">
              Visa Recommendation
            </Label>
            <CustomCombobox
              name="visa_recommendation"
              value={values.visa_recommendation || ""}
              onChange={(value) => setFieldValue("visa_recommendation", value)}
              valueKey="title"
              labelKey="title"
              options={visaRecommendations || []}
              placeholder="Select Visa Recommendation"
              className="ln-autocomplete"
            />
            {touched.visa_recommendation && errors.visa_recommendation && (
              <div className="text-xs text-red-500 mt-1">{errors.visa_recommendation}</div>
            )}
          </div>

          {/* Valid Up To */}
          <div>
            <Label className="text-slate-600 pl-1 block mb-1 text-sm md:text-base">
              Valid Up To
            </Label>
            <Input
              type="date"
              name="valid_upto"
              className="text-gray-900 text-sm md:text-base font-normal block w-full border border-solid border-gray-300 px-3.5 p-2 rounded-full outline-none focus:shadow-[0_0_6px_rgba(0,0,0,0.12)] appearance-none transition-all duration-200 ease-linear"
              onChange={(e) => setFieldValue("valid_upto", e.target.value)}
              value={values.valid_upto || ""}
            />
            {touched.valid_upto && errors.valid_upto && (
              <div className="text-xs text-red-500 mt-1">{errors.valid_upto}</div>
            )}
          </div>

          {/* Origin */}
          <div>
            <Label className="pl-1 block mb-1 text-sm md:text-base capitalize text-slate-500">
              Origin
            </Label>
            <CustomCombobox
              name="origin"
              value={values.origin || ""}
              onChange={(value) => setFieldValue("origin", value)}
              valueKey="name"
              labelKey="name"
              options={countries || []}
              placeholder="Select Origin"
              className="ln-autocomplete"
            />
            {touched.origin && errors.origin && (
              <div className="text-xs text-red-500 mt-1">{errors.origin}</div>
            )}
          </div>

          {/* Passport Image */}
          <div>
            <Label
              htmlFor="passport_image"
              className="text-slate-600 pl-1 block mb-1 text-sm md:text-base"
            >
              Passport Image
            </Label>

            <label
              htmlFor="passport_image"
              className="w-fit cursor-pointer flex items-center px-5 py-3 rounded-full bg-slate-100 hover:bg-blue-500 text-blue-500 hover:text-white transition duration-300"
            >
              <svg className="w-6 mr-2 fill-current" viewBox="0 0 32 32">
                <path d="M23.75 11.044a7.99 7.99 0 0 0-15.5-.009A8 8 0 0 0 9 27h3a1 1 0 0 0 0-2H9a6 6 0 0 1-.035-12 1.038 1.038 0 0 0 1.1-.854 5.991 5.991 0 0 1 11.862 0A1.08 1.08 0 0 0 23 13a6 6 0 0 1 0 12z" />
              </svg>
              Upload Passport Image
            </label>

            {PassportPreview && (
              <div className="mt-4">
                <img
                  src={PassportPreview}
                  alt="Passport Preview"
                  className="rounded-3xl !max-w-sm w-full block border-8 border-solid border-black/10"
                  style={{ maxWidth: "100%", height: "auto" }}
                />
              </div>
            )}

            <input
              id="passport_image"
              name="passport_image"
              type="file"
              accept="image/*"
              onChange={handlePassportImageChange}
              className="hidden"
            />

            {touched.passport_image && errors.passport_image && (
              <div className="text-xs text-red-500 mt-1">{errors.passport_image}</div>
            )}
          </div>

          {/* Business Card */}
          <div>
            <Label
              htmlFor="business_card"
              className="text-slate-600 pl-1 block mb-1 text-sm md:text-base"
            >
              Business Card
            </Label>
            <label
              htmlFor="business_card"
              className="w-fit cursor-pointer flex items-center px-5 py-3 rounded-full bg-slate-100 hover:bg-blue-500 text-blue-500 hover:text-white transition duration-300"
            >
              <svg className="w-6 mr-2 fill-current" viewBox="0 0 32 32">
                <path d="M23.75 11.044a7.99 7.99 0 0 0-15.5-.009A8 8 0 0 0 9 27h3a1 1 0 0 0 0-2H9a6 6 0 0 1-.035-12 1.038 1.038 0 0 0 1.1-.854 5.991 5.991 0 0 1 11.862 0A1.08 1.08 0 0 0 23 13a6 6 0 0 1 0 12z" />
              </svg>
              Upload Business Card
            </label>
            
            {buinesscardPreview && (
              <div className="mt-4">
                <img
                  src={buinesscardPreview}
                  alt="Business Card Preview"
                  className="rounded-3xl !max-w-sm w-full block border-8 border-solid border-black/10"
                  style={{ maxWidth: "100%", height: "auto" }}
                />
              </div>
            )}
            
            <input
              id="business_card"
              name="business_card"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
            
            {touched.business_card && errors.business_card && (
              <div className="text-xs text-red-500 mt-1">{errors.business_card}</div>
            )}
          </div>
        </div>
      </div>
    </ScrollArea>
  );
};

export default AddMemberSecond;