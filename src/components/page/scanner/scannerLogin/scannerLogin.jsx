"user client";
import React, { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { userPostRequest } from "@/service/viewService";

function ScannerLogin({ scannerList, userLogin }) {
  const [isLoader, setIsLoader] = useState(false);
  const { domain } = useParams();
  const machineType = [
    {
      value: "0",
      name: "Entry",
    },
    {
      value: "1",
      name: "Exit",
    },
  ];
  const formik = useFormik({
    initialValues: {
      password: "",
      machine_id: "",
      type: "",
    },
    validationSchema: Yup.object({
      machine_id: Yup.string().required("Select scanner machine"),
      type: Yup.string().required("Select attendance"),
      password: Yup.string()
        .required("Password is required")
        .min(6, "Password must be at least 6 characters long"),
    }),
    onSubmit: async (values) => {
      setIsLoader(true);
      const formData = new FormData();
      formData.append("subdomain", domain);
      formData.append("machine_id", values.machine_id);
      formData.append("password", values.password);
      formData.append("type", values.type);
      try {
        const response = await userPostRequest('/scanner-page-login', formData);
        if (response.status == 1) {
          localStorage.setItem(
            "scannerloginToken",
            JSON.stringify({
              token: response?.data?.token,
              type: formik.values.type,
            })
          );
          userLogin(Number(2));
          toast.success(response.data.message);
          setIsLoader(false);
        }
      } catch (error) {
        setIsLoader(false);
      }
    },
  });

  return (
    <div className="grid min-h-[40svh] [@media(max-height:1080px)]:min-h-svh lg:grid-cols-2 p-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <a href="#" className="flex items-center gap-2 font-medium">
            <img
              src="/assets/images/Powerdby.png"
              className="max-w-28 md:max-w-32 2xl:max-w-48 h-auto block"
              alt="Logo"
            />
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <form
              className={cn("flex flex-col gap-6")}
              onSubmit={formik.handleSubmit}
            >
              <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-bold">Login to your account</h1>
              </div>
              <div className="grid gap-6">
                <div className="grid gap-2">
                  <label>Scanner Machine</label>
                  <Select
                    name="machine_id"
                    value={formik.values.machine_id}
                    onValueChange={(value) =>
                      formik.setFieldValue("machine_id", value)
                    }
                    onBlur={() => formik.setFieldTouched("machine_id", true)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a Scanner Machine" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Scanner Machine</SelectLabel>
                        {scannerList && scannerList?.length > 0 ? (
                          scannerList?.map((scanner, index) => (
                            <SelectItem key={index} value={scanner._id}>
                              {scanner.scanner_name || "Unnamed Scanner"}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem disabled>
                            No scanners available
                          </SelectItem>
                        )}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  {formik.touched.machine_id && formik.errors.machine_id && (
                    <p className="text-red-500 text-sm mt-1">
                      {formik.errors.machine_id}
                    </p>
                  )}
                </div>
                <div className="grid gap-2">
                  <label>Attendance</label>
                  <Select
                    name="type"
                    value={formik.values.type}
                    onValueChange={(value) =>
                      formik.setFieldValue("type", value)
                    }
                    onBlur={() => formik.setFieldTouched("type", true)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Attendance Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Attendance</SelectLabel>
                        {machineType?.length > 0 ? (
                          machineType?.map((type, index) => (
                            <SelectItem key={index} value={type.value}>
                              {type.name || "Unnamed Type"}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem disabled>
                            No attendance types available
                          </SelectItem>
                        )}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  {formik.touched.type && formik.errors.type && (
                    <p className="text-red-500 text-sm mt-1">
                      {formik.errors.type}
                    </p>
                  )}
                </div>
                <div className="grid gap-2">
                  <label htmlFor="">Password</label>
                  <Input
                    type="password"
                    name="password"
                    placeholder="Enter your password"
                    value={formik.values.password}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.password && formik.errors.password}
                  />
                </div>
                <Button type="submit" className="w-full">
                  Login
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
      <div className="bg-muted relative hidden lg:block rounded-2xl overflow-hidden">
        <img
          src="/assets/images/login-img.webp"
          alt="Image"
          className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
        />
        <div className="absolute inset-0 p-6 xl:p-10 content-end">
          <h2 className="text-2xl 2xl:text-3xl text-white font-medium border-l-4 border-solid border-gray-100 p-4 py-0">
            Welcome to Your All-in-One Event and{" "}
            <br className="xl:block hidden" /> IT Services Portal
          </h2>
        </div>
      </div>
    </div>
  );
}

export default ScannerLogin;
