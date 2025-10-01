"use client";

import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useFormik } from "formik";
import * as Yup from "yup";
import { userPostRequest } from "@/service/viewService";
import { toast } from "sonner";
import { useState } from "react";

export function JobApplyModal({jobId}) {
  const schema = Yup.object({
    name: Yup.string().required("Name is required"),
    email: Yup.string().email("Invalid email").required("Email is required"),
    phone_number: Yup.string()
      .matches(/^\d{10}$/, "Phone must be 10 digits")
      .required("Phone number is required"),
  });

  const [open, setOpen] = useState(false);

  const formik = useFormik({
    initialValues: {
      name: "",
      email: "",
      phone_number: "",
    },
    validationSchema: schema,
    onSubmit: async (values, { setSubmitting }) => {
      const formData = new FormData();
      formData.append("name", values.name);
      formData.append("email", values.email);
      formData.append("phone_number", values.phone_number);
      formData.append("job_id", jobId);

      try {
        const response = await userPostRequest("apply-for-job", formData);
        if (response.status === 1) {
          toast.success(response.message || "Application submitted!");
          setOpen(false);
          formik.resetForm();
        } else {
          toast.error(response.message || "Submission failed");
        }
      } catch (error) {
        console.error("Error submitting form:", error);
        toast.error("Something went wrong");
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (!isOpen) {
          formik.resetForm(); // Reset form when dialog closes
        }
      }}
    >
      <DialogTrigger asChild>
        <Button variant="default">Register to apply</Button>
      </DialogTrigger>
      <DialogContent className="max-w-md bg-white rounded-2xl p-6">
        <DialogTitle className="text-lg font-semibold">
          Apply for Job
        </DialogTitle>

        <form onSubmit={formik.handleSubmit} className="space-y-4 mt-4">
          {/* Name */}
          <div className="space-y-1">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              name="name"
              placeholder="Enter your name"
              {...formik.getFieldProps("name")}
            />
            {formik.touched.name && formik.errors.name && (
              <p className="text-red-500 text-xs">{formik.errors.name}</p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-1">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="Enter your email"
              {...formik.getFieldProps("email")}
            />
            {formik.touched.email && formik.errors.email && (
              <p className="text-red-500 text-xs">{formik.errors.email}</p>
            )}
          </div>

          {/* Phone */}
          <div className="space-y-1">
            <Label htmlFor="phone_number">Phone Number</Label>
            <Input
              id="phone_number"
              name="phone_number"
              placeholder="Enter your phone number"
              {...formik.getFieldProps("phone_number")}
            />
            {formik.touched.phone && formik.errors.phone_number && (
              <p className="text-red-500 text-xs">{formik.errors.phone_number}</p>
            )}
          </div>

          {/* Submit */}
          <div className="text-right pt-2 border-t">
            <Button type="submit" disabled={formik.isSubmitting}>
              {formik.isSubmitting ? "Submitting..." : "Submit"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
