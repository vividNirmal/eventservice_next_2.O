"use client";

import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { loginRequest, postRequest, userGetRequest } from "@/service/viewService"; // Import specific functions
import DynamicTitle from "@/components/DynamicTitle";
import { getDomainConfig } from "@/utils/domainBranding";
import { toast } from "sonner";
import { useDispatch } from "react-redux";
import { handleAdminuser } from "@/redux/userReducer/userRducer";
import { Label } from "@radix-ui/react-dropdown-menu";
import { SafeImage } from "@/components/common/SafeImage";

export default function AdminLogin() {
  const [loading, setLoading] = useState(false);
  const [subdomain, setSubdomain] = useState("");
  const [domainConfig, setDomainConfig] = useState({
    brandName: "",
    appName: "Event Services",
  });
  const [companyData, setCompanyData] = useState(null);
  const router = useRouter();
  const dispatch = useDispatch();
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      router.replace("/dashboard/event-host");
    }
  }, []);

useEffect(() => {
  const getSubdomainFromHost = (hostname) => {
    const parts = hostname.toLowerCase().split('.');
    const isLocalhost = hostname.includes('localhost') || hostname.includes('127.0.0.1');

    if (isLocalhost) {
      return parts.length > 1 && parts[0] !== 'www' ? parts[0] : null;
    }

    // Get root domain from environment or auto-detect
    const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN;
    
    if (rootDomain) {
      // Remove root domain from hostname to get subdomain
      const rootParts = rootDomain.split('.');
      const domainMatch = parts.slice(-rootParts.length).join('.') === rootDomain;
      
      if (domainMatch && parts.length > rootParts.length) {
        const sub = parts[0];
        return sub !== 'www' ? sub : null;
      }
    } else {
      // Auto-detect: assume last 2 parts are root domain (example.com)
      // or last 3 for ccTLDs (example.co.uk)
      if (parts.length > 2) {
        const sub = parts[0];
        return sub !== 'www' ? sub : null;
      }
    }

    return null;
  };

  const detectedSubdomain = getSubdomainFromHost(window.location.hostname);
  
  setSubdomain(detectedSubdomain);
  setDomainConfig(getDomainConfig(detectedSubdomain));
}, []);

  // Fetch all data when subdomain is available
  useEffect(() => {
    if (!subdomain) return;

    const fetchCompanyData = async () => {
      try {
        // Fetch company details by subdomain
        const companyResponse = await userGetRequest(`get-company-login-banner/${subdomain}`);
        if (companyResponse?.status === 1 && companyResponse?.data?.images) {
          setCompanyData(companyResponse.data.images);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchCompanyData();
  }, [subdomain]);

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

  // const loginImg =
  //   "/login-side-banner.svg?height=300&width=300&text=Login+Image";

  return (
    <>
      <DynamicTitle pageTitle="Login" />
      <section className="max-h-screen h-screen overflow-auto bg-white">
        <div className="flex flex-wrap gap-3 lg:gap-4 h-[inherit]">
          <div className="w-full block lg:w-2/5 lg:grow lg:h-svh content-center">
            <div className="h-full flex justify-center items-center bg-white/20 [&>picture]:size-full">
              <SafeImage src={companyData?.company_login_banner} placeholderSrc="/login-side-banner.svg" alt="login" className="block object-fill w-full h-full" width={600} height={600} />
            </div>
          </div>

          <div className="rounded-xl shadow-[0_0_6px_rgba(0,0,0,0.12)] my-4 mx-4 lg:mx-0 p-4 lg:pr-10 w-full lg:w-1/3 xl:w-1/4 flex flex-col justify-center">
            <h1 className="text-center text-2xl lg:text-3xl xl:text-4xl font-semibold text-black mb-4">
              Welcome
              {domainConfig.brandName ? ` to ${domainConfig.brandName}` : ""}</h1>
            <span className="flex items-center gap-3 relative text-black font-normal whitespace-nowrap text-sm mb-6 lg:mb-10 before:w-1/3 before:grow before:h-0.5 before:bg-zinc-400 after:w-1/3 after:grow after:h-0.5 after:bg-zinc-400">Login Here</span>
            <form onSubmit={handleSubmit}>
              <div className="relative mb-3">
                <Label htmlFor="email" className="pl-1 block mb-1 text-sm lg:text-base capitalize text-zinc-900">Email</Label>
                <div className="relative pb-3.5">
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
                    <p className="text-red-500 text-xs absolute -bottom-1 left-3.5">{errors.email}</p>
                  )}
                </div>
              </div>

              <div className="relative mb-3">
                <Label htmlFor="password" className="pl-1 block mb-1 text-sm lg:text-base capitalize text-zinc-900">Password</Label>
                <div className="relative pb-3.5">
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
                    <p className="text-red-500 text-xs absolute -bottom-1 left-3.5">{errors.password}</p>
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
