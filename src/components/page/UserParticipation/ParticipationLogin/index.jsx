"use client";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { userGetRequest, userPostRequest } from "@/service/viewService";
import { useFormik } from "formik";
import React, { useState } from "react";
import * as Yup from "yup";

const ParticipanLogin = ({
  eventData,
  loader = true,
  onRegisterEmail,
  ticketData,
}) => {
  const [errorMessage, setErrorMessage] = useState("");
  const [errorTitle, setErrorTitle] = useState("");
  const [showErrorDialog, setShowErrorDialog] = useState(false);

  const formik = useFormik({
    initialValues: {
      email: "",
    },
    validationSchema: Yup.object({
      email: Yup.string()
        .email("Invalid email address")
        .required("Email is required"),
    }),
    onSubmit: async (values) => {
      try {
        const formDate = new FormData();
        formDate.append("email", values.email);
        formDate.append("ticketId", ticketData?._id);

        const recponce = await userPostRequest(`resolve-email`, formDate);

        if (recponce.status == 1) {
          onRegisterEmail({ ...recponce, email: values.email });
        } else {
          console.log(recponce?.errorJson?.errorType);
          if(recponce?.errorJson?.errorType == "LIMIT_REACHED"){
            setErrorTitle("Limit Reached");
          }else{
            setErrorTitle("Registration Closed");
          }          
          setErrorMessage(recponce?.errorJson?.message);
          setShowErrorDialog(true);
        }
      } catch (err) {
        console.log(err);
        setErrorMessage(err?.message);
        setShowErrorDialog(true);
      }
    },
  });

  const StatusMessageDialog = ({
    type = "info",
    title,
    message,
    extraInfo,
  }) => {
    const typeConfig = {
      info: {
        iconBg: "bg-blue-100",
        iconColor: "text-blue-600",
        iconPath: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
      },
      error: {
        iconBg: "bg-red-100",
        iconColor: "text-red-600",
        iconPath: "M6 18L18 6M6 6l12 12",
      },
      success: {
        iconBg: "bg-green-100",
        iconColor: "text-green-600",
        iconPath: "M5 13l4 4L19 7",
      },
    };

    const { iconBg, iconColor, iconPath } = typeConfig[type] || typeConfig.info;

    return (
      <Dialog open={showErrorDialog} onOpenChange={setShowErrorDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex justify-center mb-4">
              <div
                className={`w-16 h-16 ${iconBg} rounded-full flex items-center justify-center`}
              >
                <svg
                  className={`w-8 h-8 ${iconColor}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d={iconPath}
                  />
                </svg>
              </div>
            </div>
            <DialogTitle className="text-center text-2xl">{title}</DialogTitle>
            <DialogDescription className="text-center text-base">
              {message}
            </DialogDescription>
          </DialogHeader>

          {extraInfo && (
            <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-800">
              {extraInfo}
            </div>
          )}

          <div className="flex justify-center mt-4">
            <Button
              onClick={() => {
                setShowErrorDialog(false);
                setErrorMessage("");
              }}
              className="w-full bg-gray-600 hover:bg-gray-700"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <>
      <section className="min-h-screen bg-white flex flex-col md:flex-row overflow-auto">
        {/* Left Image and Info */}
        <div className="w-full md:w-2/4 grow relative before:w-full before:h-full before:absolute before:top-0 before:left-0 before:bg-[linear-gradient(201.77deg,_rgba(0,0,0,0)_1.08%,_#000000_101.42%)]">
          <img
            src={ticketData?.loginBannerImageUrl || "/assets/images/login-img.webp"}
            className="w-full h-48 md:h-full object-cover object-center"
            alt="Plastics Recycling Show"
          />
          {/* <div className="absolute left-4 lg:left-12 bottom-4 lg:bottom-12 max-w-64 lg:max-w-80 xl:max-w-[362px] w-full">
            <img
              src={eventData?.event_image}
              className="max-w-[65%] lg:max-w-[240px] w-full block mb-8"
              alt="Plastics Recycling Show"
            />
            <h1 className="text-white font-light uppercase text-2xl md:text-3xl xl:text-5xl max-w-[90%] xl:max-w-full">
              {eventData?.eventName || eventData?.event_title}
            </h1>
          </div> */}
        </div>

        {/* Form Right Side */}
        <div className="w-full md:w-1/3 px-6 md:pl-0 md:py-14 xl:pt-24 xl:pb-20 md:pr-8 xl:pr-20 bg-no-repeat bg-right-top ln-plasticsRe-bg flex flex-col justify-center">
          <h2 className="pl-2 md:pl-6 lg:pl-8 mb-4 md:mb-6 font-semibold text-[18px] md:text-3xl xl:text-[40px] text-[#1E3238] capitalize">
            Login
          </h2>

          <div className="bg-[#F8F8F8] shadow-[0px_4px_6px_0px_#0000000D] mb-4 md:mb-8 lg:mb-12 py-4 md:py-6 px-2 md:px-6 lg:px-8 lg:rounded-r-3xl relative lg:before:absolute before:top-2/4 before:-translate-y-2/4 before:left-0 before:w-1.5 before:h-[calc(100%_-_48px)] before:block before:bg-[#005153] before:rounded-r-3xl">
            <p className="text-[#1E3238] font-normal text-sm lg:text-base capitalize">
              {eventData?.eventName || eventData?.event_title}
            </p>
          </div>

          {/* Email Form */}
          <div className="border border-solid bg-white ml-0 md:ml-6 lg:ml-8 rounded-3xl shadow-[0px_0px_0px_4px_rgba(0,81,83,0.14)] border-[#F3F3F3] p-5 md:p-6 lg:py-8 lg:px-6">
            <form onSubmit={formik.handleSubmit}>
              <div>
                <Input
                  type="text"
                  name="email"
                  className="mb-0 w-full bg-[#E7E5E0]"
                  placeholder="Enter your email"
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.email && formik.errors.email}
                  label={"Email"}
                />
              </div>

              <button
                type="submit"
                className="cursor-pointer w-full md:w-auto py-3 px-4 md:px-12 mt-6 text-sm lg:text-base font-medium rounded-3xl bg-[#005153] text-white border border-solid border-[#005153] hover:bg-white hover:text-[#005153] transition-all duration-300 ease-linear"
              >
                Continue
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Error Dialog */}
      {errorMessage && (
        <StatusMessageDialog
          type="error"
          title={errorTitle}
          message={errorMessage}
          extraInfo={
            <>
              <strong>Event ended on:</strong>{" "}
              {new Date("2025-10-11T18:00:00").toLocaleString()}
            </>
          }
        />
      )}
    </>
  );
};

export default ParticipanLogin;
