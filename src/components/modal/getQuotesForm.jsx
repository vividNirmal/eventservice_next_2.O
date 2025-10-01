"use client";

import { use, useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import CategorySelector from "@/components/common/categorySelector";
import { userPostRequest } from "@/service/viewService";
import { toast } from "sonner";
import { useDispatch, useSelector } from "react-redux";
import { handleQoutation } from "@/redux/listinDynamicrouter/Listing";

const validationSchema = Yup.object({
  category_ids: Yup.array().min(1, "Select at least one category").required(),
  quotation_type: Yup.string().required("Type is required"),
  name: Yup.string().required("Name is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  quantity: Yup.string().required("Quantity is required"),
  phone_number: Yup.string()
    .matches(/^\d{10}$/, "Phone number must be 10 digits")
    .required("Phone is required"),
  location: Yup.string().required("Location is required"),
  message: Yup.string(),
});

export function GetQuotesForm() {
  const [open, setOpen] = useState(false); // modal control  
  const footerdate = useSelector((state) => state.setting.footerdata);
  const categories = footerdate?.category_list || []
  const quotationOnpen = useSelector((state) => state.listing.qoutationForm);
  const dispatch = useDispatch();
  useEffect(() => {
    if (quotationOnpen) {
      setOpen(true);
    }
  }, [quotationOnpen]);
  const formik = useFormik({
    initialValues: {
      category_ids: [],
      quotation_type: "Individual",
      name: "",
      email: "",
      quantity: "",
      phone_number: "",
      location: "",
      message: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      const formData = new FormData();
      values.category_ids.forEach((id) =>
        formData.append("category_ids[]", id)
      );
      formData.append("quotation_type", values.quotation_type);
      formData.append("name", values.name);
      formData.append("email", values.email);
      formData.append("quantity", values.quantity);
      formData.append("phone_number", values.phone_number);
      formData.append("location", values.location);
      formData.append("message", values.message);

      try {
        const response = await userPostRequest("store-quotation", formData);
        if (response.data && response.status === 1) {
          toast.success(response.message || "Quote saved successfully!");
          setOpen(false);
          dispatch(handleQoutation(false));
          formik.resetForm();
        }
      } catch (error) {
        console.error("Failed to save Quote:", error);
        toast.error("Failed to save Quote");
      }
    },
  });

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        dispatch(handleQoutation(isOpen));
        setOpen(isOpen);
        if (!isOpen) {
          formik.resetForm(); // Reset form when dialog closes
        }
      }}
    >
      <DialogTrigger asChild>
        <Button variant="default" className="hover:scale-103 active:scale-95 active:shadow-none">Quotation</Button>
      </DialogTrigger>

      <DialogContent className="w-full max-w-[90%] lg:max-w-4xl bg-white rounded-2xl pb-4">
        <DialogHeader>
          <DialogTitle className="text-xl hover:scale-103">Get Quotes</DialogTitle>
        </DialogHeader>

        <form
          onSubmit={formik.handleSubmit}
          className="w-full space-y-4 custom-scroll overflow-auto max-h-[75svh] pb-2 px-2"
        >
          {/* Categories */}
          <div className="w-full flex flex-col">
            <CategorySelector
              passUnique={true}
              categories={categories}
              selectedCategories={formik.values.category_ids}
              onSelectionChange={(selected) =>
                formik.setFieldValue("category_ids", selected)
              }
              categoryLabelClass="lg:min-w-full lg:w-w-full"
              categoryListClass="lg:w-full [&>ul]:max-h-56 sm:[&>ul]:max-h-full [&>ul]:overflow-auto sm:[&>ul]:overflow-normal"
              label="Categories"
            />
            {formik.touched.category_ids && formik.errors.category_ids && (
              <p className="text-red-500 text-xs">
                {formik.errors.category_ids}
              </p>
            )}
          </div>

          {/* Grid Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
            <div className="w-full flex flex-col">
              <Label htmlFor="quotation_type">Individual or Company</Label>
              <Select
                onValueChange={(val) =>
                  formik.setFieldValue("quotation_type", val)
                }
                defaultValue={formik.values.quotation_type}
              >
                <SelectTrigger className={"w-full"}>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Individual">Individual</SelectItem>
                  <SelectItem value="Company">Company</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="w-full flex flex-col">
              <Label htmlFor="name">Name</Label>
              <div className="relative pb-3.5 w-full">
                <Input
                  id="name"
                  placeholder="Name"
                  {...formik.getFieldProps("name")}
                />
                {formik.touched.name && formik.errors.name && (
                  <p className="text-red-500 text-xs absolute left-1 -bottom-1">
                    {formik.errors.name}
                  </p>
                )}
              </div>
            </div>

            <div className="w-full flex flex-col">
              <Label htmlFor="quantity">Quantity</Label>
              <div className="relative pb-3.5 w-full">
                <Input
                  id="quantity"
                  type="number"
                  placeholder="Quantity"
                  {...formik.getFieldProps("quantity")}
                />
                {formik.touched.quantity && formik.errors.quantity && (
                  <p className="text-red-500 text-xs absolute left-1 -bottom-1">
                    {formik.errors.quantity}
                  </p>
                )}
              </div>
            </div>

            <div className="w-full flex flex-col">
              <Label htmlFor="email">Email</Label>
              <div className="relative pb-3.5 w-full">
                <Input
                  id="email"
                  type="email"
                  placeholder="Email"
                  {...formik.getFieldProps("email")}
                />
                {formik.touched.email && formik.errors.email && (
                  <p className="text-red-500 text-xs absolute left-1 -bottom-1">
                    {formik.errors.email}
                  </p>
                )}
              </div>
            </div>

            <div className="w-full flex flex-col">
              <Label htmlFor="phone_number">Phone Number</Label>
              <div className="relative pb-3.5 w-full">
                <Input
                  id="phone_number"
                  type="tel"
                  placeholder="Phone Number"
                  {...formik.getFieldProps("phone_number")}
                />
                {formik.touched.phone_number && formik.errors.phone_number && (
                  <p className="text-red-500 text-xs absolute left-1 -bottom-1">
                    {formik.errors.phone_number}
                  </p>
                )}
              </div>
            </div>

            <div className="w-full flex flex-col">
              <Label htmlFor="location">Location</Label>
              <div className="relative pb-3.5 w-full">
                <Input
                  id="location"
                  placeholder="Location"
                  {...formik.getFieldProps("location")}
                />
                {formik.touched.location && formik.errors.location && (
                  <p className="text-red-500 text-xs absolute left-1 -bottom-1">
                    {formik.errors.location}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="w-full flex flex-col">
            <Label htmlFor="message">Message</Label>
            <div className="relative pb-3.5 w-full">
              <Textarea
                id="message"
                rows={3}
                placeholder="Message"
                {...formik.getFieldProps("message")}
              />
              {formik.touched.message && formik.errors.message && (
                <p className="text-red-500 text-xs absolute left-1 -bottom-1">
                  {formik.errors.message}
                </p>
              )}
            </div>
          </div>

          <DialogFooter
            className={"border-t border-solid border-zinc-200 pt-2.5"}
          >
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              type="submit"
              disabled={formik.isSubmitting || !formik.isValid}
            >
              {formik.isSubmitting ? "Submitting..." : "Submit"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
