import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import QrPage from "@/components/page/UserParticipation/ParticipationQrcode";
import { userPostRequest } from "@/service/viewService";
import { Input } from "@/components/ui/input";
import OnlyScanner from "../Qrscanner/SecondQrScanner";

const MobileWithLogin = ({ onCameraError }) => {
  const [step, setStep] = useState(1);
  const [showOtpField, setShowOtpField] = useState(false);
  const [form, setForm] = useState({ number: "", otp: "" });
  const [eventData, setEventData] = useState(null);
  const [userData, setUserData] = useState(null);  
  const scannerInputRef = useRef(null);
  const scannerTimeoutRef = useRef(null);
  const [faceError, setFaceError] = useState(false);
  
  const [scanCompleted, setScanCompleted] = useState(false);

  useEffect(() => {
    if (scannerInputRef.current) {
      setTimeout(() => scannerInputRef.current.focus(), 500);
    }
  }, [step]);

  useEffect(() => {
    if (faceError) {
      const timer = setTimeout(() => {
        setFaceError(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [faceError]);

  const handleInput = (e) => {
    e.preventDefault();
    if (scannerTimeoutRef.current) {
      clearTimeout(scannerTimeoutRef.current);
    }
    scannerTimeoutRef.current = setTimeout(() => {
      const scannedData = e.target.value;
      handleQRData(scannedData);
      resetInput();
    }, 1000);
  };

  const handleQRData = (data) => {
    try {
      const json = JSON.parse(data);
      const userObj = {
        user_token: json?.user_token,
        event_slug: json?.event_slug,
      };
      // if (userObj.user_token && userObj.event_slug) {
      //   setEventData(userObj);
      //   setStep(3);
      // } else {
      //   alert("Invalid QR Code");
      // }
    } catch {
      alert("Invalid QR Code");
    }
  };

  const resetInput = () => {
    if (scannerInputRef.current) {
      scannerInputRef.current.value = "";
      scannerInputRef.current.focus();
    }
  };

  const getUserName = () => {
    if (userData?.formData && userData?.map_array) {
      const { formData, map_array } = userData;

      // Get the mapped field names from map_array
      const firstNameField = map_array["first_name"];
      const lastNameField = map_array["last_name"];

      // Get the actual values from formData
      const firstName = formData[firstNameField] || "";
      const lastName = formData[lastNameField] || "";

      // Return combined name if either exists
      if (firstName || lastName) {
        return `${firstName} ${lastName}`.trim();
      }
    }

    return "Guest User";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    const urlParts = window.location.pathname.split("/");
    const eventSlug = urlParts[urlParts.length - 1];
    const type = JSON.parse(sessionStorage.getItem("scannerloginToken"))?.type;
    formData.append("contact", form.number);
    formData.append("event_slug", eventSlug);
    formData.append("scanner_type", type);

    try {
      const res = await userPostRequest("verify-otp", formData);

      if (res.status == 1) {
        setEventData(res.data[0]);
        setUserData(res.data[1]);
        setStep(3);
        toast.success(res.data.message);
      } else {
        setForm({ number: "", otp: "" });
        setShowOtpField(false);
        resetInput();
        toast.error(res.error);
        setStep(1);
      }
    } catch (err) {
      console.log(err);

      // toast.error(  err );
    }
    // }
  };
  const handleQrScanner = (data) => {
    if (data) {
      setEventData(data[0]);
      setUserData(data[1]);
      setStep(3);
    }
  };

  return (
    <div className="flex md:flex-row flex-col md:flex-wrap gap-5 justify-center min-h-60 px-4 max-w-3xl w-full">
      {step === 1 && (
        <div className="flex flex-col">
          <input
            ref={scannerInputRef}
            onInput={handleInput}
            onFocus={resetInput}
            onBlur={resetInput}
            autoFocus
            className="bg-transparent appearance-none outline-none border-0 caret-transparent text-transparent"
          />
          <OnlyScanner EventData={handleQrScanner} />
          {faceError && (
            <div className="mt-4 p-4 bg-red-50 rounded-lg border border-red-200">
              <div className="flex items-center justify-center mb-2">
                <svg
                  className="h-6 w-6 text-red-500 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.99-.833-2.76 0L3.054 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
                <p className="text-red-700 font-medium">Face not recognized!</p>
              </div>
              <p className="text-red-600 text-center text-sm">
                Please position your face clearly in the camera. The scanner
                will automatically retry in a few seconds...
              </p>
            </div>
          )}

          {scanCompleted && stepInner === 1 && (
            <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center justify-center">
                <svg
                  className="h-6 w-6 text-green-500 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <p className="text-green-700 font-medium">
                  Scan completed successfully! View details below.
                </p>
              </div>
            </div>
          )}
          <button
            onClick={() => setStep(2)}
            className="w-full text-white bg-[#2563eb] hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center mt-3"
          >
            Mobile wise Entry
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="min-h-screen   flex items-center justify-center p-4">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-20 left-10 w-72 h-72 bg-cyan-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
            <div className="absolute top-40 right-10 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
            <div className="absolute -bottom-8 left-20 w-72 h-72 bg-slate-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-4000"></div>
          </div>

          {/* Form Container */}
          <div className="relative z-10 w-full max-w-md">
            <div className="backdrop-blur-2xl bg-slate-800/40 border border-slate-700/50 rounded-3xl p-8 shadow-2xl">
              {/* Mobile Number Input with Button in one row */}
              <div className="flex gap-3 mb-6">
                <Input
                  type="tel"
                  placeholder="Enter mobile number"
                  value={form.number}
                  onChange={(e) => setForm({ ...form, number: e.target.value })}
                  className="flex-1 bg-slate-700/50 border-slate-600/50 text-slate-100 placeholder-slate-400 focus:border-cyan-400 focus:ring-cyan-400/20"
                />
                <Button
                  onClick={handleSubmit}
                  type="submit"
                  className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold rounded-xl border border-cyan-400/30 shadow-lg transition-all duration-200 transform hover:scale-105 active:scale-95 text-sm whitespace-nowrap"
                >
                  Next
                </Button>
              </div>

              {/* OTP Input */}
              {showOtpField && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
                  <div className="flex gap-3">
                    <Input
                      type="text"
                      placeholder="000000"
                      value={form.otp}
                      onChange={(e) =>
                        setForm({ ...form, otp: e.target.value })
                      }
                      className="flex-1 bg-slate-700/50 border-slate-600/50 text-slate-100 placeholder-slate-400 focus:border-blue-400 focus:ring-blue-400/20"
                    />
                    <Button className="px-6 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold rounded-xl border border-blue-400/30 shadow-lg transition-all duration-200 transform hover:scale-105 active:scale-95 text-sm whitespace-nowrap">
                      Verify
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Footer text */}
            <p className="text-center text-slate-400 text-sm mt-6">
              We'll send you a verification code
            </p>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="flex justify-center items-center w-full">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h3 className="text-gray-600 text-sm font-semibold mb-6">
              Your E-Tickets
            </h3>

            <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-6 flex items-center gap-4">
              {/* Profile Image */}
              <div className="flex-shrink-0">
                {userData?.faceImageUrl && (
                  <img
                    className="w-16 h-16 rounded-full border-4 border-white shadow-md object-cover"
                    src={userData?.faceImageUrl}
                    alt="Profile"
                  />
                )}
              </div>

              {/* Content */}
              <div className="flex-1">
                <h2 className="text-lg font-bold text-gray-800">
                  {getUserName() || "Demo User"}
                </h2>
                {/* <p className="text-sm text-gray-600 mb-3">Official Agency</p> */}
                <Button variant={"formBtn"} onClick={() => setStep(4)}>
                  View E-Ticket
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      {step === 4 && (
        <QrPage
          eventDetails={eventData}
          formData={userData}
          eventData={eventData}
          token={"After_Pass_Data"}
          eventQr={userData?.qrImage}
          registerFormDataId={userData._id}
          enteryDetails={true}
        />
      )}
    </div>
  );
};

export default MobileWithLogin;
