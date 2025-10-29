import React, { useEffect, useRef, useState } from "react";
import FaceScanner from "./FaceScanner";
import FaceScannerDetails from "./FaceScannerDetails";
import { postRequest, userPostRequest } from "@/service/viewService";
import { toast } from "sonner";

const FaceComponent = ({ eventData: initialEventData, onCameraError }) => {
  const [faceData, setFaceData] = useState(null);
  const [faceImage, setFaceImage] = useState(null);
  const [stopScanner, setStopScanner] = useState(false);
  const [stepInner, setStepInner] = useState(1);
  const [faceLoader, setFaceLoader] = useState(false);
  const [eventData, setEventData] = useState(initialEventData);
  const [loader, setLoader] = useState(false);
  const [faceError, setFaceError] = useState(false);
  const [scanCompleted, setScanCompleted] = useState(false);
  const [scannerType, setScannerType] = useState(null);
  const [captureMode, setCaptureMode] = useState(true); // NEW: capture mode state
  const scannerInputRef = useRef(null);

  useEffect(() => {
    setStepInner(1);
    setTimeout(() => {
      scannerInputRef.current?.focus();
    }, 500);
    const scanner_data = JSON.parse(sessionStorage.getItem("scannerloginToken"));
    if (scanner_data) {
      setScannerType(scanner_data?.type);
    }
  }, []);

  useEffect(() => {
    if (faceError) {
      const timer = setTimeout(() => {
        setFaceError(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [faceError]);

  const handleCameraError = (value) => {
    if (value && onCameraError) {
      onCameraError(true);
    }
  };

  const handleRedirate = () => {    
    setFaceData(null);
    setFaceImage(null);
    setScanCompleted(false);
    setStopScanner(false);
    setStepInner(1);
    setLoader(false);
    setFaceLoader(false);
    setFaceError(false);
    setTimeout(() => {
      onBlur();
    }, 500);
  };

  const onBlur = () => {
    if (scannerInputRef.current) {
      scannerInputRef.current.focus();
      scannerInputRef.current.value = "";
    }
  };

  const faceScannerData = async (event) => {
    try {

      const image = event?.image;
      if (!image) {        
        return;
      }      
      setFaceImage(image);      
      await handleScanFace(image);
    } catch (error) {
      console.error(
        "Error processing image:",
        error,
        event.image?.slice?.(0, 60) + "..."
      );
    }
  };

  const handleScanFace = async (imageData = null) => {
    const imageToProcess = imageData || faceImage;

    if (!imageToProcess) {
      setFaceError(true);
      toast.error("Please position your face in the camera to capture an image");
      return;
    }

    let faceImageFile;
    try {
      if (imageToProcess.startsWith("blob:") || imageToProcess.startsWith("http")) {
        const resp = await fetch(imageToProcess);
        const blob = await resp.blob();
        faceImageFile = new File([blob], "faceImage.png", {
          type: blob.type || "image/png",
        });
      } else if (imageToProcess.startsWith("data:")) {
        try {
          const resp = await fetch(imageToProcess);
          const blob = await resp.blob();
          faceImageFile = new File([blob], "faceImage.png", {
            type: blob.type || "image/png",
          });
        } catch (fetchErr) {
          const match = imageToProcess.match(/^data:(.+);base64,(.*)$/);
          if (!match) throw fetchErr;
          const mime = match[1];
          const base64 = match[2].replace(/\s/g, "");
          const binary = atob(base64);
          const u8 = new Uint8Array(binary.length);
          for (let i = 0; i < binary.length; i++) u8[i] = binary.charCodeAt(i);
          const blob = new Blob([u8], { type: mime });
          faceImageFile = new File([blob], "faceImage.png", { type: mime });
        }
      } else {
        const resp = await fetch("data:image/png;base64," + imageToProcess);
        const blob = await resp.blob();
        faceImageFile = new File([blob], "faceImage.png", { type: "image/png" });
      }
    } catch (error) {
      console.error("Error converting image:", error);
      toast.error("Failed to process image. Please try again.");
      return;
    }

    setLoader(true);
    setStopScanner(true);
    setFaceLoader(true);

    try {
      const formData = new FormData();
      formData.append("event_id", eventData._id);
      formData.append("file", faceImageFile);
      formData.append("scanner_type", scannerType);

      const response = await postRequest("scan-participant-face", formData);

      if (response.status === 1 && response.data) {
        setFaceData(response.data);
        setScanCompleted(true);
        setStopScanner(true);
        setStepInner(2);
      } else if (response.status === 0) {
        const errorData = response.data || [
          {
            color_status: response.data?.[0]?.color_status || "red",
            scanning_msg: response.message || "Face verification failed",
          },
        ];
        setFaceData(errorData);
        setScanCompleted(false);
        setStopScanner(false);
        setFaceError(false);
        setStepInner(2);
      } else {
        console.log("âŒ Face verification failed:", response.message);
        setFaceError(true);
      }
    } catch (error) {
      console.error("âŒ Face verification error:", error);
      setFaceError(true);
    } finally {
      setLoader(false);
      setFaceLoader(false);
    }
  };

  const qrScannerData = (data) => {
    try {
      const json = JSON.parse(data);
      const userObject = {
        user_token: json?.user_token,
        event_slug: json?.event_slug,
      };
      if (userObject) {
        setStepInner(2);
        setEventData(userObject);
      } else {
        alert("Invalid QR Code");
      }
    } catch (e) {
      alert("Invalid QR Code");
    }
  };

  let scannerInputTimeout = useRef(null);

  const onInput = (e) => {
    e.preventDefault();
    const input = e.target;

    if (scannerInputTimeout.current) {
      clearTimeout(scannerInputTimeout.current);
    }
    scannerInputTimeout.current = setTimeout(() => {
      const scannedData = input.value;
      qrScannerData(scannedData);
      resetInput();
    }, 1000);
  };

  const resetInput = () => {
    if (scannerInputRef.current) {
      scannerInputRef.current.value = "";
      scannerInputRef.current.focus();
    }
  };

  return (
    <>
      {stepInner === 1 && (
        <div className="w-full">          
          {/* <div className="mb-4 flex justify-center">
            <button
              onClick={() => setCaptureMode(captureMode === "manual" ? "auto" : "manual")}
              className={`relative inline-flex h-10 w-20 items-center rounded-full transition-colors duration-300 ${
                captureMode === "manual" ? "bg-red-500" : "bg-green-500"
              }`}
            >
              <span
                className={`inline-block h-8 w-8 transform rounded-full bg-white transition-transform duration-300 ${
                  captureMode === "manual" ? "translate-x-1" : "translate-x-11"
                }`}
              />
            </button>
          </div> */}

           <div className="w-full flex flex-wrap items-center justify-end gap-3 h-auto absolute top-5 right-12 px-4">
            <span className="text-white text-sm">Auto</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={captureMode}
                onChange={(e) => setCaptureMode(e.target.checked)}
              />
              <div className="group peer bg-white rounded-full duration-300 w-12 h-6 ring-2 ring-primaryBlue after:duration-300 after:bg-black peer-checked:after:bg-green-600 peer-checked:ring-green-600 after:rounded-full after:absolute after:h-5 after:w-5 after:top-1/2 after:-translate-y-1/2 after:left-[3px] after:flex after:justify-center after:items-center peer-checked:after:translate-x-[22px]" />
            </label>
            <span className="text-white text-sm">Manual</span>
          </div>

          <FaceScanner
            allowScan={!stopScanner && !faceLoader && !loader}
            onCameraError={handleCameraError}
            onFaceDetected={faceScannerData}
            onManualCapture={faceScannerData}
            faceNotmatch={faceError}
            scannerType={scannerType}
            captureMode={captureMode}
          />

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
        </div>
      )}

      {stepInner === 2 && (
        <>
          <FaceScannerDetails
            className="max-w-96 w-full"
            faceData={faceData}
            onRedirect={handleRedirate}
          />
        </>
      )}
    </>
  );
};

export default FaceComponent;