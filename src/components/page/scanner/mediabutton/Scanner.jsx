import React, { useEffect, useRef, useState, useCallback } from "react";
import QrScanner from "qr-scanner";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { SwitchCameraIcon } from "lucide-react";
import { toast } from "sonner";
import { postRequest } from "@/service/viewService";
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
  const [cameraReady, setCameraReady] = useState(false);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const setupInProgressRef = useRef(false);
  const isProcessingRef = useRef(false);
  const currentModeRef = useRef(false); // Track current mode

  // ✅ Load cameras (runs once)
  useEffect(() => {
    QrScanner.listCameras(true)
      .then((devices) => {
        if (!devices.length) {
          toast.error("No camera detected");
          return;
        }
        console.log("[Scanner] Available cameras:", devices);
        setCameras(devices);
      })
      .catch((err) => {
        console.error("[Scanner] Camera listing failed:", err);
        toast.error("Failed to access camera");
      });
  }, []);

  // ✅ Handle video element ready state
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleVideoLoaded = () => {
      console.log("[Scanner] Video loaded and ready");
      setIsVideoLoaded(true);
      setCameraReady(true);
    };

    const handleVideoPlay = () => {
      console.log("[Scanner] Video playing");
      setCameraReady(true);
    };

    const handleVideoError = (e) => {
      console.error("[Scanner] Video error:", e);
      setCameraReady(false);
      setIsVideoLoaded(false);
    };

    video.addEventListener("loadeddata", handleVideoLoaded);
    video.addEventListener("playing", handleVideoPlay);
    video.addEventListener("error", handleVideoError);

    return () => {
      video.removeEventListener("loadeddata", handleVideoLoaded);
      video.removeEventListener("playing", handleVideoPlay);
      video.removeEventListener("error", handleVideoError);
    };
  }, []);

  // ✅ Handle tab visibility changes
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.hidden) {
        console.log("[Scanner] Tab hidden - pausing scanner");
        if (qrScannerRef.current) {
          try {
            await qrScannerRef.current.pause();
          } catch (err) {
            console.error("[Scanner] Error pausing:", err);
          }
        }
      } else {
        console.log("[Scanner] Tab visible - resuming scanner");
        await new Promise((resolve) => setTimeout(resolve, 300));
        
        if (qrScannerRef.current && videoRef.current) {
          try {
            await qrScannerRef.current.start();
            setCameraReady(true);
            console.log("[Scanner] Scanner resumed successfully");
          } catch (err) {
            console.error("[Scanner] Failed to resume:", err);
            // Try to restart completely
            setupScanner();
          }
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  // ✅ API Call
  const handleQrCheckin = useCallback(async (qrValue) => {
    if (!qrValue || isProcessingRef.current) {
      console.log("[Scanner] Skipping - already processing or no value");
      return;
    }
    
    isProcessingRef.current = true;
    setLoading(true);

    try {
      const jsonData = JSON.parse(qrValue);
      const formData = new FormData();
      formData.append("event_id", jsonData.event_id);
      formData.append("scanner_type", scannerType);
      formData.append("qrValue", qrValue);

      const response = await postRequest("scan-participant-qr", formData);
      if (response?.status === 1) {
        setQrData(response?.data);
        setScanCompleted(true);
        setQrError(false);
        setStepInner(2);
        onQrDetails?.(response);
        const msg = response?.data?.[2]?.scanning_msg || "Scan complete!";
        const color = response?.data?.[2]?.color_status;

        if (color === "green") toast.success(msg);
        else if (color === "yellow") toast.warning(msg);
        else toast.error(msg);
      } else if (response.status === 0) {
        console.log("❌ QR verification failed:", response.message);
        const errorData = response.data || [
          {
            color_status: response.data?.[0]?.color_status || "red",
            scanning_msg: response.message || "QR verification failed",
          },
        ];
        setQrData(errorData);
        setScanCompleted(false);
        setQrError(false);
        setStepInner(2);
      } else {
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
      // Reset processing flag after a delay to prevent rapid rescans
      setTimeout(() => {
        isProcessingRef.current = false;
      }, 2000);
    }
  }, [scannerType, onQrDetails, onError]);

  // ✅ Setup scanner function
  const setupScanner = useCallback(async () => {
    if (!videoRef.current || !allowScan || cameras.length === 0) {
      console.log("[Scanner] Cannot setup - missing requirements");
      return;
    }

    if (setupInProgressRef.current) {
      console.log("[Scanner] Setup already in progress");
      return;
    }

    setupInProgressRef.current = true;
    setCameraReady(false);

    try {
      // Stop and destroy existing scanner
      if (qrScannerRef.current) {
        console.log("[Scanner] Stopping existing scanner");
        try {
          await qrScannerRef.current.stop();
        } catch (err) {
          console.warn("[Scanner] Error stopping scanner:", err);
        }
        qrScannerRef.current.destroy();
        qrScannerRef.current = null;
      }

      // Small delay for cleanup
      await new Promise((resolve) => setTimeout(resolve, 150));

      console.log(
        "[Scanner] Creating new scanner - Mode:",
        currentModeRef.current ? "MANUAL" : "AUTO",
        "Camera:",
        cameras[currentCameraIndex]?.label
      );

      // Create new scanner instance
      qrScannerRef.current = new QrScanner(
        videoRef.current,
        (result) => {
          // Use ref to check current mode (always up to date)
          if (currentModeRef.current) {
            console.log("[Scanner] Manual mode - ignoring auto scan");
            return;
          }

          if (result?.data && !isProcessingRef.current) {
            console.log("[Scanner] Auto QR detected:", result.data);
            handleQrCheckin(result.data);
          }
        },
        {
          returnDetailedScanResult: true,
          highlightScanRegion: true,
          highlightCodeOutline: true,
          maxScansPerSecond: 1,
          preferredCamera: cameras[currentCameraIndex]?.id,
        }
      );

      // Start camera
      const cameraId = cameras[currentCameraIndex]?.id;
      console.log("[Scanner] Starting camera...");
      await qrScannerRef.current.start(cameraId);

      // Wait for video to be fully ready
      const video = videoRef.current;
      if (video) {
        let attempts = 0;
        const maxAttempts = 50;

        await new Promise((resolve, reject) => {
          const checkReady = () => {
            attempts++;
            if (video.readyState >= 2 && video.videoWidth > 0 && video.videoHeight > 0) {
              console.log("[Scanner] Video ready after", attempts, "attempts");
              resolve();
            } else if (attempts >= maxAttempts) {
              reject(new Error("Video ready timeout"));
            } else {
              setTimeout(checkReady, 100);
            }
          };
          checkReady();
        });
      }

      console.log("[Scanner] Camera started successfully");
      setCameraReady(true);
      setIsVideoLoaded(true);
    } catch (err) {
      console.error("[Scanner] Failed to start camera:", err);
      toast.error("Unable to start camera. Please check permissions.");
      onError?.(err);
      setCameraReady(false);
      setIsVideoLoaded(false);
    } finally {
      setupInProgressRef.current = false;
    }
  }, [allowScan, cameras, currentCameraIndex, handleQrCheckin, onError]);

  // ✅ Initialize scanner when camera changes
  useEffect(() => {
    if (cameras.length > 0 && allowScan) {
      setupScanner();
    }

    return () => {
      console.log("[Scanner] Cleanup - stopping scanner");
      if (qrScannerRef.current) {
        try {
          qrScannerRef.current.stop();
        } catch (err) {
          console.warn("[Scanner] Error during cleanup:", err);
        }
        qrScannerRef.current.destroy();
        qrScannerRef.current = null;
      }
      setupInProgressRef.current = false;
    };
  }, [cameras, currentCameraIndex, allowScan, setupScanner]);

  // ✅ Update mode ref when printChecked changes (no camera restart)
  useEffect(() => {
    currentModeRef.current = printChecked;
    console.log("[Scanner] Mode changed to:", printChecked ? "MANUAL" : "AUTO");
  }, [printChecked]);

  // ✅ Manual Scan
  const handleScanQR = async () => {
    console.log("[Scanner] Manual scan initiated");

    const video = videoRef.current;

    if (!video) {
      toast.warning("Camera not initialized");
      return;
    }

    if (!cameraReady || !isVideoLoaded) {
      toast.warning("Camera is initializing. Please wait...");
      return;
    }

    if (video.readyState < 2) {
      toast.warning("Camera not ready. Please wait...");
      console.warn("[Scanner] Video readyState:", video.readyState);
      return;
    }

    if (video.videoWidth === 0 || video.videoHeight === 0) {
      toast.warning("Camera stream not available");
      console.warn("[Scanner] Video dimensions:", video.videoWidth, video.videoHeight);
      return;
    }

    if (isProcessingRef.current) {
      toast.info("Already processing a scan...");
      return;
    }

    setLoading(true);

    try {
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) {
        toast.error("Unable to create canvas context");
        setLoading(false);
        return;
      }

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      console.log("[Scanner] Scanning frame:", canvas.width, "x", canvas.height);

      const result = await QrScanner.scanImage(canvas, {
        returnDetailedScanResult: true,
      });

      if (result?.data) {
        console.log("[Scanner] Manual scan result:", result.data);
        toast.success("QR Code detected!");
        await handleQrCheckin(result.data);
      } else {
        toast.warning("No QR code detected. Please try again.");
      }
    } catch (err) {
      console.error("[Scanner] Manual scan failed:", err);
      toast.error("Unable to read QR code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Toggle camera
  const toggleCamera = async () => {
    if (cameras.length < 2) {
      toast.info("Only one camera available");
      return;
    }

    const nextIndex = (currentCameraIndex + 1) % cameras.length;
    console.log("[Scanner] Switching to camera:", cameras[nextIndex]?.label);

    setCameraReady(false);
    setIsVideoLoaded(false);
    setCurrentCameraIndex(nextIndex);
  };

  // ✅ Toggle Auto / Manual
  const handleCheckboxChange = (e) => {
    const isChecked = e.target.checked;
    console.log("[Scanner] Mode switching to:", isChecked ? "MANUAL" : "AUTO");

    setPrintChecked(isChecked);
    setClickButtonShow(isChecked);
    onPrintChange?.(isChecked);
    
    // Reset processing flag when switching modes
    isProcessingRef.current = false;
  };

  const handleRedirate = () => {
    console.log("🔄 Resetting scanner to step 1...");
    setScanCompleted(false);
    setStepInner(1);
    setQrError(false);
    setQrData(null);
    isProcessingRef.current = false;
  };

  return (
    <>
      {stepInner === 1 && (
        <>
          <div className="w-full flex flex-wrap items-center justify-end gap-3 h-auto absolute top-5 right-12 px-4 z-10">
            <span className="text-white text-sm">Auto</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={printChecked}
                onChange={handleCheckboxChange}
                disabled={!cameraReady}
              />
              <div className="group peer bg-white rounded-full duration-300 w-12 h-6 ring-2 ring-primaryBlue after:duration-300 after:bg-primaryBlue peer-checked:after:bg-green-600 peer-checked:ring-green-600 after:rounded-full after:absolute after:h-5 after:w-5 after:top-1/2 after:-translate-y-1/2 after:left-[3px] after:flex after:justify-center after:items-center peer-checked:after:translate-x-[22px] peer-disabled:opacity-50" />
            </label>
            <span className="text-white text-sm">Manual</span>
          </div>

          {/* Video & Controls */}
          <div className="flex flex-col items-center gap-10">
            <div className="relative rounded-xl overflow-hidden w-[200px] h-[300px] mx-auto border-8 border-solid border-white/30 bg-gray-900">
              <Button
                variant="ghost"
                onClick={toggleCamera}
                disabled={cameras.length < 2 || !cameraReady}
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

              {/* Camera loading indicator */}
              {!cameraReady && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-900/80 z-20">
                  <div className="text-white text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-2"></div>
                    <p className="text-sm">Initializing camera...</p>
                  </div>
                </div>
              )}           
            </div>

            {/* Manual Scan Button */}
            {clickButtonShow && (
              <Button
                onClick={handleScanQR}
                disabled={loading || !cameraReady || !isVideoLoaded}
                className="uppercase font-semibold block w-fit text-base h-10 px-10 text-indigo-600 hover:text-white rounded-full bg-white border-4 border-indigo-600 duration-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading
                  ? "Scanning..."
                  : !cameraReady
                  ? "Camera Loading..."
                  : "Scan QR Code"}
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
                <p className="text-red-700 font-medium">
                  QR Code not scanned properly!
                </p>
              </div>
              <p className="text-red-600 text-center text-sm">
                Please position your QR code clearly in the camera.
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
                  Scan completed successfully!
                </p>
              </div>
            </div>
          )}
        </>
      )}
      {stepInner === 2 && (
        <QRScannerDetails
          className="max-w-96 w-full"
          qrData={qrData}
          onRedirect={handleRedirate}
        />
      )}
    </>
  );
};

export default Scanner;