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
import React, { useState, useMemo } from "react";
import * as Yup from "yup";
import { SafeImage } from "@/components/common/SafeImage";
import { Calendar, Check, Info, Mail } from "lucide-react";

const ParticipanLogin = ({
  eventData,
  loading,
  onRegisterEmail,
  ticketData,
}) => {
  const [errorMessage, setErrorMessage] = useState("");
  const [errorTitle, setErrorTitle] = useState("");
  const [showErrorDialog, setShowErrorDialog] = useState(false);

  // Check if event has ended
  const eventStatus = useMemo(() => {
    if (!eventData?.endDate || !eventData?.endTime) {
      return { hasEnded: false, endDateTime: null };
    }

    try {
      // Parse end date and time
      const [year, month, day] = eventData.endDate.split("-").map(Number);
      const [hours, minutes] = eventData.endTime.split(":").map(Number);

      // Create end date object
      const endDateTime = new Date(year, month - 1, day, hours, minutes);
      const now = new Date();

      return {
        hasEnded: now > endDateTime,
        endDateTime: endDateTime,
      };
    } catch (error) {
      console.error("Error parsing event date:", error);
      return { hasEnded: false, endDateTime: null };
    }
  }, [eventData?.endDate, eventData?.endTime]);

  // Format date for display
  const formatEventDate = (date) => {
    if (!date) return "";
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

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
          if (recponce?.errorJson?.errorType == "LIMIT_REACHED") {
            setErrorTitle("Limit Reached");
          } else {
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

  // Event Ended Component
  const EventEndedMessage = () => (
    <div className="border border-solid bg-white rounded-3xl shadow-[0px_0px_0px_4px_rgba(0,81,83,0.14)] border-[#F3F3F3] p-6 md:p-8 lg:py-10 lg:px-8">
      <div className="flex flex-col items-center text-center">
        {/* Icon */}
        <div className="w-20 h-20 bg-gradient-to-br from-[#005153] to-[#007a7c] rounded-full flex items-center justify-center mb-6 shadow-lg">
          <Check className="text-white" />
        </div>

        {/* Title */}
        <h3 className="text-2xl md:text-3xl font-bold text-[#1E3238] mb-3">
          Event Closed
        </h3>

        {/* Message */}
        <p className="text-gray-600 text-base md:text-lg mb-6 max-w-md">
          Thank you for your interest! This event has already concluded.
        </p>

        {/* Event Details Card */}
        <div className="w-full bg-gradient-to-r from-[#f0f9f9] to-[#e8f4f4] rounded-2xl p-5 mb-6">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Calendar className="w-5 h-5 text-[#005153]" />
            <span className="font-semibold text-[#005153]">Event Details</span>
          </div>

          <h4 className="font-semibold text-[#1E3238] text-lg mb-2">
            {eventData?.eventName}
          </h4>

          <div className="text-sm text-gray-600 space-y-1">
            <p>
              <span className="font-medium">Ended on:</span>{" "}
              {formatEventDate(eventStatus.endDateTime)}
            </p>
            {eventData?.location && (
              <p>
                <span className="font-medium">Location:</span>{" "}
                {eventData.location}
              </p>
            )}
          </div>
        </div>

        {/* Divider */}
        <div className="w-full border-t border-gray-200 my-4"></div>

        {/* Footer Message */}
        <div className="flex gap-2 text-gray-500 text-sm">
          <Info className="w-4 h-4 mt-0.5" />
          <span className="text-left">Stay tuned for our upcoming events!</span>
        </div>

        {/* Optional: Contact or Learn More Button */}
        {eventData?.organizer_email && (
          <a
            href={`mailto:${eventData.organizer_email}`}
            className="mt-6 inline-flex items-center gap-2 py-3 px-6 text-sm font-medium rounded-3xl bg-[#005153] text-white border border-solid border-[#005153] hover:bg-white hover:text-[#005153] transition-all duration-300 ease-linear"
          >
            <Mail className="w-4 h-4" />
            Contact Organizer
          </a>
        )}
      </div>
    </div>
  );

  return (
    <>
      <section className="min-h-svh flex flex-col xl:flex-row lg:items-center gap-5 xl:gap-10 bg-[#f7f9fc] overflow-auto lg:overflow-hidden">
        <div className="shrink-0 w-full xl:w-2/4 xl:grow relative flex flex-col justify-center [&>picture]:size-full min-h-96 lg:min-h-svh bg-white/20">
          {!loading ? (
            <SafeImage src={ticketData?.loginBannerImageUrl} mobileSrc={ticketData?.loginBannerImageUrl} placeholderSrc="/assets/images/login-img.webp" alt="Plastics Recycling Show" width={1200} height={600} className="block object-fill w-full h-96 xl:h-dvh" fade={true} outerload={true} />
          ) : (
            <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
              <p className="text-sm text-gray-500">Loading...</p>
            </div>
          )}
        </div>

        {/* Form Right Side */}
        <div className="grow xk:grow-0 shrink-0 lg:w-md 2xl:w-xl px-6 lg:pl-0 xl:pr-10 py-5 mx-4 lg:mx-0 bg-no-repeat bg-right-top ln-plasticsRe-bg flex flex-col">
          {/* Conditional Rendering based on event status */}
          {eventStatus.hasEnded ? (
            <>
              <EventEndedMessage />
            </>
          ) : (
            <>
              <h2 className="mb-4 md:mb-6 font-semibold text-[18px] md:text-3xl 2xl:text-[40px] text-[#1E3238] capitalize">
                Login
              </h2>

              {/* Email Form */}
              <div className="border border-solid bg-white rounded-3xl shadow-[0px_0px_0px_4px_rgba(0,81,83,0.14)] border-[#F3F3F3] p-5 md:p-6 lg:py-8 lg:px-6">
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
            </>
          )}
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
              {formatEventDate(eventStatus.endDateTime)}
            </>
          }
        />
      )}
    </>
  );
};

export default ParticipanLogin;