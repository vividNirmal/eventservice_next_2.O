"use client";

import { useCallback, useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2, UploadCloud, X } from "lucide-react";
import { getRequest, postRequest } from "@/service/viewService";
import { toast } from "sonner";

export default function AddCompany({ editCompany, isOpen, onClose, refetch }) {
  const [loading, setLoading] = useState(false);
  const [btnLoading, setBtnLoading] = useState(false);
  const [imagePreviews, setImagePreviews] = useState(null);
  const formik = useFormik({
    initialValues: {
      company_name: "",
      address: "",
      gst_number: "",
      owner_name: "",
      email_one: "",
      email_two: "",
      subdomain: "",
      logo: null,
    },
    validationSchema: Yup.object({
      company_name: Yup.string().required("Company name is required"),
      address: Yup.string().required("Address is required"),
      gst_number: Yup.string().required("GST Number is required"),
      owner_name: Yup.string().required("Owner/Handler is required"),
      email_one: Yup.string()
        .email("Invalid email")
        .required("First Email is required"),
      email_two: Yup.string().email("Invalid email").nullable(),
      subdomain: Yup.string().required("Sub Domain is required"),
      logo: Yup.mixed().required("Logo is required"),
    }),
    onSubmit: async (values) => {
      setBtnLoading(true);
      try {
        let formData = new FormData();
        Object.entries(values).forEach(([key, value]) => {
          if (key === "logo" && value && typeof value !== "string") {
            formData.append("logo", value);
          } else if (key !== "logo") {
            formData.append(key, value);
          }
        });
        let responce;
        if (editCompany ) {
          responce = await postRequest(
            `update-company-details/${editCompany}`,
            formData
          );
        } else {
          responce = await postRequest(`store-company`, formData);
        }
        if (responce.status === 1) {
          toast.success("Success", { description: `${responce.message}` });
          onClose();
          refetch(true);
          setBtnLoading(false);
        }
      } catch (error) {
        toast.error("Error", {
          description: error.message || "Failed to save company",
        });
      }
    },
    enableReinitialize: true,
  });

  async function getById() {
    setLoading(true);
    const responce = await getRequest(`get-company-details/${editCompany}`);
    if (responce.status == 1) {
      const Data = responce.data.company;
      formik.setValues({
        company_name: Data.company_name,
        address: Data.address,
        gst_number: Data.gst_number,
        owner_name: Data.owner_name,
        email_one: Data.email_one,
        email_two: Data.email_two,
        subdomain: Data.subdomain,
      });
      setImagePreviews({ src: Data.logo, isNew: false });
      formik.setFieldValue("logo", Data.logo)
      setLoading(false);
    }
  }

  const handleFiles = useCallback(
    (files) => {
      if (!files || files.length === 0) return;
      const file = files[0];
      setImagePreviews(null); // Clear existing preview
      formik.setFieldValue("logo", null); // Clear existing file from formik

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews({ src: reader.result, isNew: true, file });
        formik.setFieldValue("logo", file);
      };
      reader.readAsDataURL(file);
    },
    [formik]
  );

  const handleImageDrop = useCallback(
    (event) => {
      event.preventDefault();
      handleFiles(event.dataTransfer.files);
    },
    [handleFiles]
  );

  const handleRemoveImage = useCallback(() => {
    setImagePreviews(null); // Clear the preview
    formik.setFieldValue("logo", null); // Clear the file from formik values
  }, [formik]);

  const handleImageDragOver = useCallback((event) => {
    event.preventDefault();
  }, []);

  useEffect(() => {
    // setLoading(true)
    if (editCompany) {
      getById(editCompany);
    } else {
      formik.resetForm();
      setImagePreviews(null);
    }
  }, [editCompany]);
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-[400px] sm:w-[540px] px-4">
        <SheetHeader>
          <SheetTitle>
            {editCompany ? "Edit Company" : "Add New Company"}
          </SheetTitle>
          <SheetDescription>
            {editCompany ? "Update scanner" : "Create a new scanner "}
          </SheetDescription>
        </SheetHeader>
        {loading ? (
          <Loader2 className="m-auto  h-15 w-15 animate-spin" />
        ) : (
          <form
            onSubmit={formik.handleSubmit}
            className="space-y-4 w-full  custom-scroll overflow-auto max-h-full pb-2 px-2"
          >
            <div className="space-y-2">
              <Label htmlFor="company_name">Name</Label>
              <Input
                id="company_name"
                name="company_name"
                placeholder="Enter company name"
                value={formik.values.company_name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.company_name && formik.errors.company_name && (
                <p className="text-sm text-red-500">
                  {formik.errors.company_name}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                name="address"
                placeholder="Enter address"
                value={formik.values.address}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.address && formik.errors.address && (
                <p className="text-sm text-red-500">{formik.errors.address}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="gst_number">GST Number</Label>
              <Input
                id="gst_number"
                name="gst_number"
                placeholder="Enter GST number"
                value={formik.values.gst_number}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.gst_number && formik.errors.gst_number && (
                <p className="text-sm text-red-500">
                  {formik.errors.gst_number}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="owner_name">Owner/Handler</Label>
              <Input
                id="owner_name"
                name="owner_name"
                placeholder="Enter owner/handler name"
                value={formik.values.owner_name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.owner_name && formik.errors.owner_name && (
                <p className="text-sm text-red-500">
                  {formik.errors.owner_name}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email_one">Email One</Label>
              <Input
                id="email_one"
                name="email_one"
                placeholder="Enter first email"
                value={formik.values.email_one}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.email_one && formik.errors.email_one && (
                <p className="text-sm text-red-500">
                  {formik.errors.email_one}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email_two">Email Two</Label>
              <Input
                id="email_two"
                name="email_two"
                placeholder="Enter second email"
                value={formik.values.email_two}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.email_two && formik.errors.email_two && (
                <p className="text-sm text-red-500">
                  {formik.errors.email_two}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="subdomain">Subdomain</Label>
              <Input
                id="subdomain"
                name="subdomain"
                placeholder="Enter sub domain"
                value={formik.values.subdomain}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.subdomain && formik.errors.subdomain && (
                <p className="text-sm text-red-500">
                  {formik.errors.subdomain}
                </p>
              )}
            </div>
            <div className="w-full flex-grow">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs 2xl:text-base font-normal text-slate-500 w-full block mb-1">
                  Event Banner
                </span>
              </div>
              <label
                htmlFor="logo"
                className={`flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 ${
                  formik.touched.images && formik.errors.images
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
                onDrop={handleImageDrop}
                onDragOver={handleImageDragOver}
              >
                {imagePreviews ? (
                  <div className="relative group w-full h-full flex items-center justify-center p-2">
                    <img
                      src={imagePreviews.src || "/placeholder.svg"}
                      alt={`Banner Preview`}
                      className="max-w-full max-h-full object-contain border rounded-md"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-1 right-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={handleRemoveImage}
                    >
                      <X className="h-4 w-4" />
                      <span className="sr-only">Remove image</span>
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <UploadCloud className="w-8 h-8 mb-4 text-gray-500" />
                    <p className="mb-2 text-xs text-gray-500">
                      <span className="font-semibold">Click to upload</span> or
                      drag and drop
                    </p>
                    <p className="text-xs text-gray-500">
                      SVG, PNG, JPG or GIF (MAX. 800x400px)
                    </p>
                  </div>
                )}
                <input
                  id="logo"
                  type="file"
                  className="hidden"
                  onChange={(e) => handleFiles(e.target.files)}
                  onBlur={formik.handleBlur}
                  name="logo"
                />
              </label>
              {formik.touched.logo && formik.errors.logo && (
                <div className="text-red-500 text-xs mt-1">
                  {typeof formik.errors.logo === "string"
                    ? formik.errors.logo
                    : "Invalid image file."}
                </div>
              )}
            </div>
            <div className="flex justify-end space-x-2 pt-4 pb-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {btnLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editCompany ? "Update Company" : "Add Company"}
              </Button>
            </div>
          </form>
        )}
      </SheetContent>
    </Sheet>
  );
}
