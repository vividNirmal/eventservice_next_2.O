import React, { useEffect, useRef, useState } from "react";
import Details from "../userDetails/Details";
import Scanner from "../Scanner";
import { toast } from "sonner";
import { SacnnerPost } from "@/service/viewService";

const MobileWithLogin = ({ onCameraError }) => {
  const [step, setStep] = useState(1);
  const [showOtpField, setShowOtpField] = useState(false);
  const [form, setForm] = useState({ number: "", otp: "" });
  const [eventData, setEventData] = useState(null);
  const [userData, setUserData] = useState(null);
  const [printValue, setPrintValue] = useState(false);
  const scannerInputRef = useRef(null);
  const scannerTimeoutRef = useRef(null);

  useEffect(() => {
    if (scannerInputRef.current) {
      setTimeout(() => scannerInputRef.current.focus(), 500);
    }
  }, [step]);

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
      if (userObj.user_token && userObj.event_slug) {
        setEventData(userObj);
        setStep(3);
      } else {
        alert("Invalid QR Code");
      }
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

  const handleCameraErr = (value) => {
    if (value && onCameraError) onCameraError(true);
  };

  const handlePrintPermission = (value) => {
    setPrintValue(!!value);
  };

  const redirate = () => {
    setPrintValue(false);
    setStep(1);
    setTimeout(() => resetInput(), 500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    if (!showOtpField) {
      formData.append("email", form.number);
      const res = await SacnnerPost('send-otp',formData) ;

      if (res.data.status == 1) {
        toast.success("Success", { description: `Your OTP: ${res.data.otp}` });
        setShowOtpField(true);
      } else {
        toast.error("Error", { description: res.data.message });
      }
    } else {
      const urlParts = window.location.pathname.split("/");
      const eventSlug = urlParts[urlParts.length - 1];
      const type = JSON.parse(localStorage.getItem("scannerloginToken"))?.type;
      formData.append("contact", form.number);
      formData.append("otp", form.otp);
      formData.append("event_slug", eventSlug);
      formData.append("scanner_type", type);

      try {
        const res = await SacnnerPost('verify-otp',formData) 
        if (res.data.status == 1) {
          toast.success("Success", { description: res.data.message });
          setUserData(res.data);
          setStep(3);
        } else {
          toast.error("Error", { description: res.data.message });
        }
      } catch (err) {
        toast.error("Error", { description: err });
      }
    }
  };

  return (
    <div className="flex md:flex-row flex-col md:flex-wrap gap-5 justify-center min-h-60 px-4">
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
          <Scanner
            onQrDetails={handleQRData}
            onPrint={handlePrintPermission}
            onError={handleCameraErr}
          />
          <button
            onClick={() => setStep(2)}
            className="w-full text-white bg-[#2563eb] hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center mt-3"
          >
            Mobile wise Entry
          </button>
        </div>
      )}

      {step === 2 && (
        <form className="flex flex-col max-w-md w-full" onSubmit={handleSubmit}>
          <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto lg:py-0 w-full">
            <div className="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0">
              <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-900">
                    Mobile Number
                  </label>
                  <input
                    type="number"
                    placeholder="Mobile Number"
                    value={form.number}
                    onChange={(e) => setForm({ ...form, number: e.target.value })}
                    className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg block w-full p-2.5"
                  />
                </div>
                {showOtpField && (
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-900">OTP</label>
                    <input
                      type="number"
                      placeholder="OTP"
                      value={form.otp}
                      onChange={(e) => setForm({ ...form, otp: e.target.value })}
                      className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg block w-full p-2.5"
                    />
                  </div>
                )}
                <button
                  type="submit"
                  className="w-full text-white bg-[#2563eb] hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
                >
                  {!showOtpField ? "Send OTP" : "Next"}
                </button>
              </div>
            </div>
          </div>
        </form>
      )}

      {step === 3 && (
        <Details
          data={eventData}
          userData={userData}
          onRedirect={redirate}
          printPermission={printValue}
        />
      )}
    </div>
  );
};

export default MobileWithLogin;
