"use client";

import React, { useEffect, useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PhoneInputWithCountryCode } from "@/components/customComponents/customPhoneNumber/PhoneInputWithCountryCode";
import { CustomCombobox } from "@/components/common/customcombox";
import { toast } from "sonner";
import Image from "next/image";
import { ScrollArea } from "@/components/ui/scroll-area";

const genderOptions = [
  { title: "Male" },
  { title: "Female" },
  { title: "Other" },
];

const ownershipOptions = ["Owner", "Employee", "Partner"];

const AddMemberFirst = ({ formik, values, setFieldValue, errors, setFieldTouched, touched, countries }) => {
  const [profilePreview, setProfilePreview] = useState(null);
  const profileInputRef = useRef(null);
  const reuploadRef = useRef(null);
  const imageSizeLimitKB = 10240; // 10MB

  // Initialize form values and profile preview
  useEffect(() => {
    if (values.profile_picture) {
      if (typeof values.profile_picture === "string") {
        setProfilePreview(values.profile_picture);
      } else if (values.profile_picture instanceof File) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setProfilePreview(reader.result);
        };
        reader.readAsDataURL(values.profile_picture);
      }
    }
  }, [values.profile_picture]);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size
    if (file.size / 1024 > imageSizeLimitKB) {
      toast.error(`Image size should be less than ${imageSizeLimitKB / 1024}MB`);
      return;
    }

    // Validate file type
    if (!file.type.match("image.*")) {
      toast.error("Please select an image file");
      return;
    }

    // Update formik value
    setFieldValue("profile_picture", file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setProfilePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  return (
    <ScrollArea className="h-[calc(100svh_-_200px)] w-full rounded-md border p-4">

    <form className="h-2/4 flex-grow pb-16">
      <div className="flex flex-wrap gap-6 mb-5">
        {/* Profile Picture */}
        <div className="w-full">
          <div className="w-fit relative">
            <Label className="text-slate-600 pl-1 block mb-1 text-sm md:text-base">
              Profile Picture
            </Label>
            
            {!profilePreview ? (
              <Label
                htmlFor="profile_pic"
                className="relative flex items-center justify-center rounded-full w-32 h-32 overflow-hidden border-4 border-solid border-blue-500/5 text-blue-500 bg-[rgba(12,22,65,0.35)] cursor-pointer"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="size-full -mb-2.5"
                >
                  <path
                    fillRule="evenodd"
                    d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-white absolute z-10 top-6">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="size-6"
                  >
                    <path d="M12 9a3.75 3.75 0 1 0 0 7.5A3.75 3.75 0 0 0 12 9Z" />
                    <path
                      fillRule="evenodd"
                      d="M9.344 3.071a49.52 49.52 0 0 1 5.312 0c.967.052 1.83.585 2.332 1.39l.821 1.317c.24.383.645.643 1.11.71.386.054.77.113 1.152.177 1.432.239 2.429 1.493 2.429 2.909V18a3 3 0 0 1-3 3h-15a3 3 0 0 1-3-3V9.574c0-1.416.997-2.67 2.429-2.909.382-.064.766-.123 1.151-.178a1.56 1.56 0 0 0 1.11-.71l.822-1.315a2.942 2.942 0 0 1 2.332-1.39ZM6.75 12.75a5.25 5.25 0 1 1 10.5 0 5.25 5.25 0 0 1-10.5 0Zm12-1.5a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z"
                      clipRule="evenodd"
                    />
                  </svg>
                </span>
                <span className="inline-block text-sm absolute bottom-5 left-0 right-0 z-10 text-white text-center">
                  upload Profile Picture
                </span>
                <input
                  type="file"
                  className="w-0 absolute"
                  id="profile_pic"
                  ref={profileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                />
              </Label>
            ) : (
              <div className="relative w-fit">
                <div className="rounded-full overflow-hidden w-32 h-32 bg-slate-100 text-center content-center flex-grow border-4 border-solid border-blue-500/5">
                  <Image
                    src={profilePreview}
                    alt="Profile picture preview"
                    width={128}
                    height={128}
                    className="w-full h-full object-cover"
                  />
                </div>
                <Label
                  htmlFor="reUpload_file"
                  className="w-8 h-8 border border-solid border-gray-500 rounded-full bg-white p-1 z-10 absolute bottom-4 right-0 cursor-pointer"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="size-full"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z"
                    />
                  </svg>
                  <input
                    type="file"
                    className="w-0 absolute"
                    id="reUpload_file"
                    ref={reuploadRef}
                    onChange={handleFileChange}
                    accept="image/*"
                  />
                </Label>
              </div>
            )}
            
            {touched.profile_picture && errors.profile_picture && (
              <div className="text-xs text-red-500 mt-1">
                {errors.profile_picture}
              </div>
            )}
          </div>
        </div>

        {/* First Name */}
        <div className="w-full">
          <Label className="text-slate-600 pl-1 block mb-1 text-sm md:text-base">
            First Name
          </Label>
          <Input
            type="text"
            name="first_name"
            placeholder="Enter First Name"
            className="text-gray-900 text-sm md:text-base font-normal block w-full border border-solid border-gray-300 px-3.5 p-2 rounded-full outline-none focus:shadow-[0_0_6px_rgba(0,0,0,0.12)] appearance-none transition-all duration-200 ease-linear"
            value={values.first_name || ""}
            onChange={(e) => setFieldValue("first_name", e.target.value)}
            onBlur={() => setFieldTouched("first_name", true)}
          />
          {touched.first_name && errors.first_name && (
            <div className="text-xs text-red-500 mt-1">{errors.first_name}</div>
          )}
        </div>

        {/* Last Name */}
        <div className="w-full">
          <Label className="text-slate-600 pl-1 block mb-1 text-sm md:text-base">
            Last Name
          </Label>
          <Input
            type="text"
            name="last_name"
            placeholder="Enter Last Name"
            className="text-gray-900 text-sm md:text-base font-normal block w-full border border-solid border-gray-300 px-3.5 p-2 rounded-full outline-none focus:shadow-[0_0_6px_rgba(0,0,0,0.12)] appearance-none transition-all duration-200 ease-linear"
            value={values.last_name || ""}
            onChange={(e) => setFieldValue("last_name", e.target.value)}
            onBlur={() => setFieldTouched("last_name", true)}
          />
          {touched.last_name && errors.last_name && (
            <div className="text-xs text-red-500 mt-1">{errors.last_name}</div>
          )}
        </div>

        {/* Email */}
        <div className="w-full">
          <Label className="text-slate-600 pl-1 block mb-1 text-sm md:text-base">
            Email
          </Label>
          <Input
            type="email"
            name="email"
            placeholder="Enter Email"
            className="text-gray-900 text-sm md:text-base font-normal block w-full border border-solid border-gray-300 px-3.5 p-2 rounded-full outline-none focus:shadow-[0_0_6px_rgba(0,0,0,0.12)] appearance-none transition-all duration-200 ease-linear"
            value={values.email || ""}
            onChange={(e) => setFieldValue("email", e.target.value)}
            onBlur={() => setFieldTouched("email", true)}
          />
          {touched.email && errors.email && (
            <div className="text-xs text-red-500 mt-1">{errors.email}</div>
          )}
        </div>

        {/* Contact Number */}
        <div className="w-full">
          <Label className="text-slate-600 pl-1 block mb-1 text-sm md:text-base">
            Contact Number
          </Label>
          <PhoneInputWithCountryCode
            name="contact_no"
            placeholder="Enter Company Contact"
            value={values.contact_no || ""}
            onChange={(value) => setFieldValue("contact_no", value)}
            className=""
            onBlur={() => setFieldTouched("contact_no", true)}
          />
          {touched.contact_no && errors.contact_no && (
            <div className="text-xs text-red-500 mt-1">{errors.contact_no}</div>
          )}
        </div>

        {/* Ownership */}
        <div className="w-full">
          <Label className="text-slate-600 pl-1 block mb-1 text-sm md:text-base">
            Ownership
          </Label>
          <div className="flex items-center gap-4 pl-1">
            {ownershipOptions.map((option) => (
              <Label
                key={option}
                htmlFor={`type_${option.toLowerCase()}`}
                className="relative flex flex-wrap items-center gap-2 w-fit cursor-pointer"
              >
                <input
                  type="radio"
                  className="absolute top-0 opacity-0 peer"
                  name="ownership"
                  value={option}
                  id={`type_${option.toLowerCase()}`}
                  checked={values.ownership === option}
                  onChange={() => setFieldValue("ownership", option)}
                  onBlur={() => setFieldTouched("ownership", true)}
                />
                <span
                  className={`rounded-full border border-solid w-5 h-5 block relative after:block after:w-2.5 after:h-2.5 after:rounded-full after:absolute after:top-2/4 after:left-2/4 after:-translate-x-2/4 after:-translate-y-2/4 transition-all duration-200 ease-linear ${
                    values.ownership === option
                      ? "border-blue-500 after:bg-blue-500"
                      : "border-gray-500"
                  }`}
                ></span>
                <span
                  className={`text-sm ${
                    values.ownership === option
                      ? "text-black"
                      : "text-gray-400"
                  }`}
                >
                  {option}
                </span>
              </Label>
            ))}
          </div>
          {touched.ownership && errors.ownership && (
            <div className="text-xs text-red-500 mt-1">{errors.ownership}</div>
          )}
        </div>

        {/* Date of Birth */}
        <div className="w-full">
          <Label className="text-slate-600 pl-1 block mb-1 text-sm md:text-base">
            Date of Birth
          </Label>
          <Input
            type="date"
            name="birth_date"
            className="text-gray-900 text-sm md:text-base font-normal block w-full border border-solid border-gray-300 px-3.5 p-2 rounded-full outline-none focus:shadow-[0_0_6px_rgba(0,0,0,0.12)] appearance-none transition-all duration-200 ease-linear"
            value={values.birth_date || ""}
            onChange={(e) => setFieldValue("birth_date", e.target.value)}
            onBlur={() => setFieldTouched("birth_date", true)}
          />
          {touched.birth_date && errors.birth_date && (
            <div className="text-xs text-red-500 mt-1">{errors.birth_date}</div>
          )}
        </div>

        {/* Gender */}
        <div className="w-full">
          <Label className="pl-1 block mb-1 text-sm md:text-base capitalize text-slate-500">
            Gender
          </Label>
          <CustomCombobox
            name="gender"
            value={values.gender || ""}
            onChange={(value) => setFieldValue("gender", value)}
            valueKey="title"
            labelKey="title"
            options={genderOptions}
            placeholder="Select Gender"
            className="ln-autocomplete"
            onBlur={() => setFieldTouched("gender", true)}
          />
          {touched.gender && errors.gender && (
            <div className="text-xs text-red-500 mt-1">{errors.gender}</div>
          )}
        </div>

        {/* Address One */}
        <div className="w-full">
          <Label className="text-slate-600 pl-1 block mb-1 text-sm md:text-base">
            Address One
          </Label>
          <Input
            type="text"
            name="address_one"
            placeholder="Please enter address"
            className="text-gray-900 text-sm md:text-base font-normal block w-full border border-solid border-gray-300 px-3.5 p-2 rounded-full outline-none focus:shadow-[0_0_6px_rgba(0,0,0,0.12)] appearance-none transition-all duration-200 ease-linear"
            value={values.address_one || ""}
            onChange={(e) => setFieldValue("address_one", e.target.value)}
            onBlur={() => setFieldTouched("address_one", true)}
          />
          {touched.address_one && errors.address_one && (
            <div className="text-xs text-red-500 mt-1">{errors.address_one}</div>
          )}
        </div>

        {/* Address Two */}
        <div className="w-full">
          <Label className="text-slate-600 pl-1 block mb-1 text-sm md:text-base">
            Address Two
          </Label>
          <Input
            type="text"
            name="address_two"
            placeholder="Please enter address"
            className="text-gray-900 text-sm md:text-base font-normal block w-full border border-solid border-gray-300 px-3.5 p-2 rounded-full outline-none focus:shadow-[0_0_6px_rgba(0,0,0,0.12)] appearance-none transition-all duration-200 ease-linear"
            value={values.address_two || ""}
            onChange={(e) => setFieldValue("address_two", e.target.value)}
            onBlur={() => setFieldTouched("address_two", true)}
          />
          {touched.address_two && errors.address_two && (
            <div className="text-xs text-red-500 mt-1">{errors.address_two}</div>
          )}
        </div>

        {/* Pin Code */}
        <div className="w-full">
          <Label className="text-slate-600 pl-1 block mb-1 text-sm md:text-base">
            Pin Code
          </Label>
          <Input
            type="number"
            name="pincode"
            placeholder="Please enter pincode"
            className="text-gray-900 text-sm md:text-base font-normal block w-full border border-solid border-gray-300 px-3.5 p-2 rounded-full outline-none focus:shadow-[0_0_6px_rgba(0,0,0,0.12)] appearance-none transition-all duration-200 ease-linear"
            value={values.pincode || ""}
            onChange={(e) => setFieldValue("pincode", e.target.value)}
            onBlur={() => setFieldTouched("pincode", true)}
          />
          {touched.pincode && errors.pincode && (
            <div className="text-xs text-red-500 mt-1">{errors.pincode}</div>
          )}
        </div>

        {/* Country */}
        <div className="w-full">
          <Label className="pl-1 block mb-1 text-sm md:text-base capitalize text-slate-500">
            Country
          </Label>
          <CustomCombobox
            name="country"
            value={values.country || ""}
            onChange={(value) => setFieldValue("country", value)}
            valueKey="name"
            labelKey="name"
            options={countries}
            placeholder="Select Country"
            className="ln-autocomplete"
            onBlur={() => setFieldTouched("country", true)}
          />
          {touched.country && errors.country && (
            <div className="text-xs text-red-500 mt-1">{errors.country}</div>
          )}
        </div>

        {/* City */}
        <div className="w-full">
          <Label className="text-slate-600 pl-1 block mb-1 text-sm md:text-base">
            City
          </Label>
          <Input
            type="text"
            name="city"
            placeholder="Enter city"
            className="text-gray-900 text-sm md:text-base font-normal block w-full border border-solid border-gray-300 px-3.5 p-2 rounded-full outline-none focus:shadow-[0_0_6px_rgba(0,0,0,0.12)] appearance-none transition-all duration-200 ease-linear"
            value={values.city || ""}
            onChange={(e) => setFieldValue("city", e.target.value)}
            onBlur={() => setFieldTouched("city", true)}
          />
          {touched.city && errors.city && (
            <div className="text-xs text-red-500 mt-1">{errors.city}</div>
          )}
        </div>
      </div>
    </form>
    </ScrollArea>

  );
};

export default AddMemberFirst;