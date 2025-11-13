"use client";

import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { loginRequest, postRequest } from "@/service/viewService"; // Import specific functions
import DynamicTitle from "@/components/DynamicTitle";
import { getDomainConfig } from "@/utils/domainBranding";
import { toast } from "sonner";
import { useDispatch } from "react-redux";
import { handleAdminuser } from "@/redux/userReducer/userRducer";
import { Label } from "@radix-ui/react-dropdown-menu";

export default function AdminLogin() {
  const [loading, setLoading] = useState(false);
  const [subdomain, setSubdomain] = useState("");
  const [domainConfig, setDomainConfig] = useState({
    brandName: "",
    appName: "Event Services",
  });
  const router = useRouter();
  const dispatch = useDispatch();
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      router.replace("/dashboard/event-host");
    }
  }, []);

  useEffect(() => {
    const host = window.location.hostname; // ngglobal.localhost
    const parts = host.split(".");

    if (parts.length > 1) {
      setSubdomain(parts[0]); // "ngglobal"
    }

    // Set domain config for branding
    const config = getDomainConfig();
    setDomainConfig(config);
  }, []);

  // Form state
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});

  // Simple validation function
  const validateForm = (data) => {
    const newErrors = {};

    if (!data.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(data.email)) {
      newErrors.email = "Invalid email address";
    }

    if (!data.password) {
      newErrors.password = "Password is required";
    } else if (data.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters long";
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Validate form
    const newErrors = validateForm(formData);
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setLoading(false);
      return;
    }

    try {
      const payload = {
        email: formData.email,
        password: formData.password,
      };
      if (subdomain) {
        payload.subdomain = subdomain;
      }

      const res = await loginRequest("login", payload);
      if (res.status == 1) {
        toast.success(res?.message);
        if (res.data?.user) {
          dispatch(handleAdminuser(res?.data?.user));
          localStorage.setItem("token", res?.data?.token);
          localStorage.setItem("loginuser", JSON.stringify(res?.data?.user));
          localStorage.setItem("companyId", res.data?.company_details?._id);
          if (res?.data?.user?.email === "demoadmin@gmail.com") {
            router.push("/dashboard/event-host");
          } else {
            router.push("/dashboard/event-host");
          }
        } else if (res.data?.registeruser) {
          dispatch(handleAdminuser(res?.data?.registeruser));
          localStorage.setItem("token", res?.data?.token);
          localStorage.setItem(
            "loginuser",
            JSON.stringify(res?.data?.registeruser)
          );
          localStorage.setItem("companyId", res.data?.company_details?._id);
          router.push('/dashboard/eventuser');
        }
      } else {
        toast.error(res?.message);
      }
    } catch (error) {
      setErrors({ email: error.message || "Something went wrong" });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const loginImg =
    "/login-side-banner.svg?height=300&width=300&text=Login+Image";

  return (
    <>
      <DynamicTitle pageTitle="Login" />
      <section className="max-h-screen h-screen overflow-auto bg-white">
        <div className="flex flex-wrap gap-3 lg:gap-4 h-[inherit] px-4">
          <div className="w-full block lg:w-2/5 lg:grow lg:h-svh content-center">
            <div className="flex justify-center items-center bg-white/20">
              <Image
                src={loginImg || "/login-side-banner.svg"}
                className="block object-cover h-auto 2xl:w-2/4"
                alt="login"
                width={600}
                height={600}
              />
            </div>
          </div>

          <div className="rounded-xl shadow-[0_0_6px_rgba(0,0,0,0.12)] my-4 p-4 lg:pr-10 w-full lg:w-1/3 xl:w-1/4 flex flex-col justify-center">
            <h1 className="text-center text-2xl lg:text-3xl xl:text-4xl font-semibold text-black mb-4">
              Welcome
              {domainConfig.brandName ? ` to ${domainConfig.brandName}` : ""}
            </h1>
            <span className="flex items-center gap-3 relative text-black font-normal whitespace-nowrap text-sm mb-10 before:w-1/3 before:grow before:h-0.5 before:bg-zinc-400 after:w-1/3 after:grow after:h-0.5 after:bg-zinc-400">
              Login Here
            </span>
            <form onSubmit={handleSubmit}>
              <div className="relative mb-3">
                <Label
                  htmlFor="email"
                  className="pl-1 block mb-1 text-sm md:text-base capitalize text-zinc-900"
                >
                  Email
                </Label>
                <div className="relative pb-4">
                  <Input
                    type="email"
                    name="email"
                    placeholder="Please enter your email address"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={loading}
                    className={
                      "text-gray-900 font-normal block w-full bg-white border border-solid border-gray-300 rounded-full outline-none text-sm md:text-base focus:shadow-[0_0_6px__rgba(0,0,0,0.12)] transition-all duration-200 ease-linear"
                    }
                  />
                  {errors.email && (
                    <p className="text-red-500 text-xs absolute -bottom-1 left-4">
                      {errors.email}
                    </p>
                  )}
                </div>
              </div>

              <div className="relative mb-3">
                <Label
                  htmlFor="password"
                  className="pl-1 block mb-1 text-sm md:text-base capitalize text-zinc-900"
                >
                  Password
                </Label>
                <div className="relative pb-4">
                  <Input
                    type="password"
                    name="password"
                    placeholder="Please enter your password"
                    value={formData.password}
                    onChange={handleInputChange}
                    disabled={loading}
                    className={
                      "text-gray-900 font-normal block w-full bg-white border border-solid border-gray-300 rounded-full outline-none text-sm md:text-base focus:shadow-[0_0_6px__rgba(0,0,0,0.12)] transition-all duration-200 ease-linear"
                    }
                  />
                  {errors.password && (
                    <p className="text-red-500 text-xs absolute -bottom-1 left-4">
                      {errors.password}
                    </p>
                  )}
                </div>
              </div>
              <button
                type="submit"
                className={cn(
                  "block w-full font-bold text-base mx-auto py-2 px-3 rounded-full text-white hover:text-[#EB3BB3] hover:bg-white border border-solid border-[#EB3BB3] transition-all duration-200 ease-linear",
                  loading ? "bg-gray-500" : "bg-[#EB3BB3]"
                )}
                disabled={loading}
              >
                {loading ? "Logging in..." : "Login"}
              </button>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}
