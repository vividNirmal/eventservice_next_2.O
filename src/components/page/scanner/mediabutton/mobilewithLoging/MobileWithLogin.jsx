import React, { useEffect, useRef, useState } from "react";
import Details from "../userDetails/Details";
import Scanner from "../Scanner";
import { SacnnerPost, userPostRequest } from "@/service/viewService";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import QrPage from "@/components/page/UserParticipation/ParticipationQrcode";
import FaceScanner from "../faceScanner/FaceScanner";

const MobileWithLogin = ({ onCameraError }) => {
  const [step, setStep] = useState(1);
  const [showOtpField, setShowOtpField] = useState(false);
  const [form, setForm] = useState({ number: "", otp: "" });
  const [eventData, setEventData] = useState(null);
  const [userData, setUserData] = useState(null);
  const [printValue, setPrintValue] = useState(false);
  const scannerInputRef = useRef(null);
  const scannerTimeoutRef = useRef(null);
  const [faceError, setFaceError] = useState(false);
  const [stopScanner, setStopScanner] = useState(false);
  const [faceLoader, setFaceLoader] = useState(false);
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
    // if (!showOtpField) {
    //   formData.append("email", form.number);
    //   const res = await SacnnerPost('send-otp',formData) ;

    //   if (res.data.status == 1) {
    //     toast.success("Success", { description: `Your OTP: ${res.data.otp}` });
    //     setShowOtpField(true);
    //   } else {
    //     toast.error("Error", { description: res.data.message });
    //   }
    // } else {
    const urlParts = window.location.pathname.split("/");
    const eventSlug = urlParts[urlParts.length - 1];
    const type = JSON.parse(sessionStorage.getItem("scannerloginToken"))?.type;
    formData.append("contact", form.number);
    // formData.append("otp", form.otp);
    formData.append("event_slug", eventSlug);
    formData.append("scanner_type", type);

    try {
      const res = await userPostRequest("verify-otp", formData);      
      
      if (res.status == 1) {
        setEventData(res.data[0])
        setUserData(res.data[1]);
        setStep(3);
        toast.success("Success", { description: res.data.message });
      } else {
        toast.error("Error", { description: res.data.message });
      }
    } catch (err) {
      toast.error("Error", { description: err });
    }
    // }
  };


   const handleCameraError = (value) => {
    if (value && onCameraError) {
      onCameraError(true);
    }
  };

  const faceScannerData = async (event) => {
    try {      
      const image = event?.image;
      if (!image) {        
        return;
      }
      setStep(4)            
      // Trigger face verification immediately when manually captured
      console.log("📸 Image captured, starting verification...");
      await handleScanFace(image);
      
    } catch (error) {
      console.error(
        "Error processing image:",
        error,
        event.image?.slice?.(0, 60) + "..."
      );
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
          <FaceScanner
            allowScan={!stopScanner && !faceLoader }
            onCameraError={handleCameraError}
            onFaceDetected={faceScannerData}
            onManualCapture={faceScannerData}
            faceNotmatch={faceError}            
          />

          {/* {faceLoader && (
            <div className="flex items-center justify-center mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <Loader2 className="h-6 w-6 animate-spin text-blue-500 mr-3" />
              <div className="text-center">
                <span className="text-blue-700 font-medium block">
                  Verifying face and marking attendance...
                </span>
                <span className="text-blue-600 text-sm">
                  Please wait while we process your scan
                </span>
              </div>
            </div>
          )} */}

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
                Please position your face clearly in the camera. The scanner will
                automatically retry in a few seconds...
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
                    onChange={(e) =>
                      setForm({ ...form, number: e.target.value })
                    }
                    className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg block w-full p-2.5"
                  />
                </div>
                {showOtpField && (
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-900">
                      OTP
                    </label>
                    <input
                      type="number"
                      placeholder="OTP"
                      value={form.otp}
                      onChange={(e) =>
                        setForm({ ...form, otp: e.target.value })
                      }
                      className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg block w-full p-2.5"
                    />
                  </div>
                )}
                <button
                  type="submit"
                  className="w-full text-white bg-[#2563eb] hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
                >
                  {!showOtpField ? "Continue" : "Next"}
                </button>
              </div>
            </div>
          </div>
        </form>
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
                {
                  userData?.faceImageUrl && (

                    <img
                      className="w-16 h-16 rounded-full border-4 border-white shadow-md object-cover"
                      src={userData?.faceImageUrl}
                      alt="Profile"
                    />
                  )
                }
              </div>

              {/* Content */}
              <div className="flex-1">
                <h2 className="text-lg font-bold text-gray-800">
                  {userData?.firsName || "Demo User"}
                </h2>
                {/* <p className="text-sm text-gray-600 mb-3">Official Agency</p> */}
                <Button variant={"formBtn"} onClick={()=> setStep(4)}>
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
          formData={userData?.formData}
          eventData={eventData}
          token={"After_Pass_Data"}
          eventQr={userData?.qrImage}
          registerFormDataId={userData._id}
        />
      )}
    </div>
  );
};

export default MobileWithLogin;
