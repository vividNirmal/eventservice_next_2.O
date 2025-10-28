import React, { useEffect, useRef, useState } from "react";
import QrScanner from "qr-scanner";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { SwitchCameraIcon } from "lucide-react";
import { toast } from "sonner";
import { postRequest } from "@/service/viewService";
import { json, set } from "zod";
import QRScannerDetails from "./ScannerDetails";

const Scanner = ({
  eventId,
  scannerType = 0,
  allowScan = true,
  onQrDetails,
  onPrintChange,
  onError,
}) => {
  const videoRef = useRef(null);
  const qrScannerRef = useRef(null);
  const [qrResult, setQrResult] = useState(null);
  const [printChecked, setPrintChecked] = useState(false);
  const [clickButtonShow, setClickButtonShow] = useState(false);
  const [cameras, setCameras] = useState([]);
  const [currentCameraIndex, setCurrentCameraIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [stepInner, setStepInner] = useState(1);
  const [scanCompleted, setScanCompleted] = useState(false);
const [qrError, setQrError] = useState(false);
const [qrData, setQrData] = useState(null);
  // ✅ Load cameras
  useEffect(() => {
    QrScanner.listCameras(true)
      .then((devices) => {
        if (!devices.length) {
          toast.error("No camera detected");
          return;
        }
        setCameras(devices);
      })
      .catch((err) => {
        console.error("[Scanner] Camera listing failed:", err);
        toast.error("Failed to access camera");
      });
  }, []);

  // ✅ Initialize Scanner when camera changes
  useEffect(() => {
    if (!videoRef.current || !allowScan) return;

    const setupScanner = async () => {
      try {
        qrScannerRef.current?.stop();
        qrScannerRef.current?.destroy();

        qrScannerRef.current = new QrScanner(
          videoRef.current,
          (result) => {
            if (printChecked) return; // Manual mode → skip auto detection
            if (result?.data) {
              console.log("[Scanner] Auto QR detected:", result.data);
              handleQrCheckin(result.data);
            }
          },
          {
            returnDetailedScanResult: true,
            highlightScanRegion: true,
            highlightCodeOutline: true,
            maxScansPerSecond: 1,
          }
        );

        await qrScannerRef.current.start(cameras[currentCameraIndex]?.id);
        console.log("[Scanner] Camera started:", cameras[currentCameraIndex]?.label);
      } catch (err) {
        console.error("[Scanner] Failed to start camera:", err);
        toast.error("Unable to start camera");
        onError?.(err);
      }
    };

    setupScanner();

    return () => {
      qrScannerRef.current?.stop();
      qrScannerRef.current?.destroy();
    };
  }, [allowScan, currentCameraIndex, cameras]);

  // ✅ API Call
  const handleQrCheckin = async (qrValue) => {
    if (!qrValue || loading) return;
    console.log("[Scanner] Sending QR to API:", qrValue);
    setLoading(true);
    try {
      const jsonData = JSON.parse(qrValue);
      const formData = new FormData();
            formData.append("event_id", jsonData.event_id);
            formData.append("scanner_type", scannerType);
      formData.append("qrValue", qrValue);

            const response = await postRequest("scan-participant-qr", formData);
      if(response?.status === 1){
        setQrData(response?.data);
        setScanCompleted(true);
        setQrError(false);
        setStepInner(2);
         console.log("[Scanner] API Response:", response);
    onQrDetails?.(response);

    const msg = response?.data?.[2]?.scanning_msg || "Scan complete!";
    const color = response?.data?.[2]?.color_status;

    if (color === "green") toast.success(msg);
    else if (color === "yellow") toast.warning(msg);
    else toast.error(msg);
      }else if (response.status === 0) {
        // Handle error responses like "You have not registered yet"
        console.log("❌ [AUTO] Face verification failed:", response.message);
        const errorData = response.data || [{ 
          color_status: response.data?.[0]?.color_status || "red",
          scanning_msg: response.message || "QR verification failed"
        }];
        console.log("📡 [AUTO] Setting error faceData:", errorData);
        setQrData(errorData);
        setScanCompleted(false); // Keep scanner active for error responses
        setQrError(false); // Clear any previous face errors
        console.log("📡 [AUTO] Switching to step 2 for error display");
        setStepInner(2);
      }else{
        setScanCompleted(true);
        setQrError(true);
        setStepInner(1);
      }
    } catch (err) {
      console.error("[Scanner] API error:", err);
      toast.error("Failed to process QR scan");
      onError?.(err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Manual Scan (Frame Capture)
const handleScanQR = async () => {
  console.log("[Scanner] Manual scan button clicked");

  const video = videoRef.current;
  if (!video || video.readyState < 2) {
    toast.warning("Camera not ready. Try again.");
    console.warn("[Scanner] Video not ready for capture");
    return;
  }

  // Create canvas same size as the video
  const canvas = document.createElement("canvas");
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  // Draw the current video frame onto the canvas
  const ctx = canvas.getContext("2d");
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  try {
    // Try scanning that frame for a QR code
    const result = await QrScanner.scanImage(canvas, {
      returnDetailedScanResult: true,
    });

    if (result?.data) {
      console.log("[Scanner] Manual scan result:", result.data);
      toast.success(`QR Detected: ${result.data}`);
      await handleQrCheckin(result.data);
    } else {
      toast.warning("No QR code detected. Try again.");
      console.warn("[Scanner] No QR data found in image");
    }
  } catch (err) {
    console.error("[Scanner] Manual scan failed:", err);
    toast.error("Unable to read QR code");
  }
};


  // ✅ Toggle camera
  const toggleCamera = async () => {
    if (cameras.length < 2) {
      toast.info("Only one camera available");
      return;
    }
    const nextIndex = (currentCameraIndex + 1) % cameras.length;
    setCurrentCameraIndex(nextIndex);
  };

  // ✅ Toggle Auto / Manual
  const handleCheckboxChange = (e) => {
    const isChecked = e.target.checked;
    setPrintChecked(isChecked);
    setClickButtonShow(isChecked);
    onPrintChange?.(isChecked);
  };

  const handleRedirate = () => {
    console.log("🔄 Resetting scanner to step 1...");
    setScanCompleted(false);
    setStepInner(1);
    setQrError(false);
    setTimeout(() => {
      onBlur();
    }, 500);
  };
  const onBlur = () => {
    
  };
  return (
    <>
    {stepInner === 1 && (
      <>
       <div className="w-full flex flex-wrap items-center justify-end gap-3 h-auto absolute top-4 right-0 px-4">
        <span className="text-white text-sm">Auto</span>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            className="sr-only peer"
            checked={printChecked}
            onChange={handleCheckboxChange}
          />
          <div className="group peer bg-white rounded-full duration-300 w-12 h-6 ring-2 ring-primaryBlue after:duration-300 after:bg-primaryBlue peer-checked:after:bg-green-600 peer-checked:ring-green-600 after:rounded-full after:absolute after:h-5 after:w-5 after:top-1/2 after:-translate-y-1/2 after:left-[3px] after:flex after:justify-center after:items-center peer-checked:after:translate-x-[22px]" />
        </label>
        <span className="text-white text-sm">Manual</span>
      </div>

      {/* Video & Controls */}
      <div className="flex flex-col items-center gap-10">
        <div className="relative rounded-full overflow-hidden w-[200px] h-[300px] mx-auto border-8 border-white/30 text-center">
          <Button
            variant="ghost"
            onClick={toggleCamera}
            disabled={cameras.length < 2}
            className="mb-2 px-4 py-2 bg-white/10 size-10 text-white rounded-full border-none mt-2 relative z-30 md:hidden"
          >
            <SwitchCameraIcon />
          </Button>

          <video
            ref={videoRef}
            className="w-full absolute h-full object-cover !border-0"
            autoPlay
            playsInline
            muted
          ></video>

          {/* <Image
            src="/assets/images/mask-image.svg"
            width={200}
            height={200}
            alt="mask img"
            className="!w-[75%] h-auto block m-auto absolute z-20 top-[100px] left-2/4 -translate-x-2/4 opacity-50"
          /> */}
        </div>

        {/* Manual Scan Button */}
        {clickButtonShow && (
          <Button
            onClick={handleScanQR}
            disabled={loading}
            className="uppercase font-semibold block w-fit text-base h-10 px-10 text-indigo-600 hover:text-white rounded-full bg-white border-4 border-indigo-600 duration-50"
          >
            {loading ? "Scanning..." : "Scan"}
          </Button>
        )}
      </div>

      {qrError && (
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
                <p className="text-red-700 font-medium">QR Code not scanned properly!</p>
              </div>
              <p className="text-red-600 text-center text-sm">
                Please position your qr code clearly in the camera. The scanner will
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
      </>
    )}
    {stepInner === 2 && (
        <>
          <QRScannerDetails
            className="max-w-96 w-full"
            qrData={qrData}
            onRedirect={handleRedirate}
          />
        </>
      )}
    </>
  );
};

export default Scanner;