import React, { useEffect, useRef, useState } from "react";
import FaceScanner from "./FaceScanner";
import FaceScannerDetails from "./FaceScannerDetails";
import { postRequest, userPostRequest } from "@/service/viewService";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

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
  const scannerInputRef = useRef(null);
  const scannerToken = JSON.parse(
    localStorage.getItem("scannerloginToken") || "{}"
  );

  useEffect(() => {
    console.log(eventData);
    setStepInner(1);
    setTimeout(() => {
      scannerInputRef.current?.focus();
    }, 500);
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
    console.log("🔄 Resetting scanner to step 1...");
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
      console.log("🎯 faceScannerData called with event:", event);
      const image = event?.image;
      if (!image) {
        console.log("❌ No image in event");
        return;
      }

      console.log("📸 Face captured, processing image...");
      setFaceImage(image);
      
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

  const verifyFaceAutomatically = async (faceImageFile) => {
    if (loader || faceLoader) {
      console.log("🔄 Verification already in progress, skipping...");
      return;
    }

    console.log("🚀 Starting automatic face verification...");
    setLoader(true);
    setStopScanner(true);
    setFaceLoader(true);

    try {
      console.log("🔄 Submitting face for verification...");
      console.log("📸 Face image size:", faceImageFile?.size || "Unknown");
      console.log("🎪 Event ID:", eventData._id);
      console.log("🔧 Scanner type:", scannerToken.type);

      const formData = new FormData();
      formData.append("event_id", eventData._id);
      formData.append("file", faceImageFile);
      formData.append("scanner_type", scannerToken.type);

      const response = await userPostRequest("scan-participant-face", formData);

      console.log("📡 [AUTO] Face verification response:", response);
      console.log("📡 [AUTO] Response status:", response.status);
      console.log("📡 [AUTO] Response data:", response.data);

      if (response.status === 1 && response.data) {
        console.log("✅ Face verification successful");
        setFaceData(response.data);
        setScanCompleted(true);
        setStopScanner(true);
        setStepInner(2);
      } else if (response.status === 0) {
        // Handle error responses like "You have not registered yet"
        console.log("❌ [AUTO] Face verification failed:", response.message);
        const errorData = response.data || [{ 
          color_status: response.data?.[0]?.color_status || "red",
          scanning_msg: response.message || "Face verification failed"
        }];
        console.log("📡 [AUTO] Setting error faceData:", errorData);
        setFaceData(errorData);
        setScanCompleted(false); // Keep scanner active for error responses
        setStopScanner(false); 
        setFaceError(false); // Clear any previous face errors
        console.log("📡 [AUTO] Switching to step 2 for error display");
        setStepInner(2);
      } else {
        console.log("❌ Face verification failed:", response.message);
        setFaceError(true);
        toast.error(response.message || "Face not recognized. Please try again.");
        setTimeout(() => {
          setStopScanner(false);
          setFaceError(false);
        }, 1000); // Reduced from 3000ms
      }
    } catch (error) {
      console.error("❌ Face verification error:", error);
      setFaceError(true);
      // toast.error("Face verification failed. Please try again.");
      setTimeout(() => {
        setStopScanner(false);
        setFaceError(false);
      }, 1000); // Reduced from 3000ms
    } finally {
      setLoader(false);
      setFaceLoader(false);
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
      // Convert image data to File object
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
      formData.append("scanner_type", scannerToken.type);

      const response = await postRequest("scan-participant-face", formData);

      if (response.status === 1 && response.data) {
        setFaceData(response.data);
        setScanCompleted(true);
        setStopScanner(true);
        setStepInner(2);
      } else if (response.status === 0) {
        const errorData = response.data || [{ 
          color_status: response.data?.[0]?.color_status || "red",
          scanning_msg: response.message || "Face verification failed"
        }];
        setFaceData(errorData);
        setScanCompleted(false); // Keep scanner active for error responses
        setStopScanner(false); 
        setFaceError(false);
        setStepInner(2);
      } else {
        console.log("❌ Face verification failed:", response.message);
        setFaceError(true);
      }
    } catch (error) {
      console.error("❌ Face verification error:", error);
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

  console.log("🔄 Render - stepInner:", stepInner, "faceData:", faceData);
  
  return (
    <>
      {stepInner === 1 && (
        <div className="w-full">
          <FaceScanner
            allowScan={!stopScanner && !faceLoader && !loader}
            onCameraError={handleCameraError}
            onFaceDetected={faceScannerData}
            onManualCapture={faceScannerData}
            faceNotmatch={faceError}
            scannerType={scannerToken.type}
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