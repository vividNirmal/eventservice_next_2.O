import React, { useEffect, useRef, useState, useCallback } from "react";
import QrScanner from "qr-scanner";
import { Button } from "@/components/ui/button";
import { SwitchCameraIcon } from "lucide-react";
import { toast } from "sonner";
import { postRequest } from "@/service/viewService";

const OnlyScanner = ({EventData}) => {
  const videoRef = useRef(null);
  const qrScannerRef = useRef(null);
  const [cameras, setCameras] = useState([]);
  const [currentCameraIndex, setCurrentCameraIndex] = useState(0);
  const [cameraReady, setCameraReady] = useState(false);
  const setupInProgressRef = useRef(false);
  const [scannerType, setScannerType] = useState(null);

  // ✅ Load cameras
  useEffect(() => {
    const scanner_data = JSON.parse(sessionStorage.getItem("scannerloginToken"));
    if (scanner_data) {
      setScannerType(scanner_data?.type);
    }
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

  // ✅ Handle QR scan result
  const handleQrScan = useCallback(async (result) => {
    if (result?.data) {
      try {
        const parsedData = JSON.parse(result.data);

        // Build form data from the scanned payload (use result.data directly to avoid undeclared vars)
        const formData = new FormData();
        formData.append("event_id", parsedData?.event_id );
        formData.append("scanner_type", scannerType);
        formData.append("qrValue", result.data);                
          await postRequest("scan-participant-qr", formData).then((res)=>{
            if(res.status == 1){
              EventData(res.data)
            }
          })               
      } catch (err) {
        console.log("QR Data (Plain Text):", result.data);
      }
    }
  }, []);

  // ✅ Setup scanner
  const setupScanner = useCallback(async () => {
    if (!videoRef.current || cameras.length === 0 || setupInProgressRef.current) {
      return;
    }

    setupInProgressRef.current = true;
    setCameraReady(false);

    try {
      // Stop existing scanner
      if (qrScannerRef.current) {
        try {
          await qrScannerRef.current.stop();
        } catch (err) {
          console.warn("[Scanner] Error stopping scanner:", err);
        }
        qrScannerRef.current.destroy();
        qrScannerRef.current = null;
      }

      await new Promise((resolve) => setTimeout(resolve, 150));

      // Create new scanner
      qrScannerRef.current = new QrScanner(
        videoRef.current,
        handleQrScan,
        {
          returnDetailedScanResult: true,
          highlightScanRegion: true,
          highlightCodeOutline: true,
          maxScansPerSecond: 1,
          preferredCamera: cameras[currentCameraIndex]?.id,
        }
      );

      // Start camera
      await qrScannerRef.current.start(cameras[currentCameraIndex]?.id);

      // Wait for video ready
      const video = videoRef.current;
      if (video) {
        let attempts = 0;
        const maxAttempts = 50;

        await new Promise((resolve, reject) => {
          const checkReady = () => {
            attempts++;
            if (video.readyState >= 2 && video.videoWidth > 0 && video.videoHeight > 0) {
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

      setCameraReady(true);
    } catch (err) {
      console.error("[Scanner] Failed to start camera:", err);
      toast.error("Unable to start camera");
      setCameraReady(false);
    } finally {
      setupInProgressRef.current = false;
    }
  }, [cameras, currentCameraIndex, handleQrScan]);

  // ✅ Initialize scanner
  useEffect(() => {
    if (cameras.length > 0) {
      setupScanner();
    }

    return () => {
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
  }, [cameras, currentCameraIndex, setupScanner]);

  // ✅ Handle tab visibility
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.hidden) {
        if (qrScannerRef.current) {
          try {
            await qrScannerRef.current.pause();
          } catch (err) {
            console.error("[Scanner] Error pausing:", err);
          }
        }
      } else {
        await new Promise((resolve) => setTimeout(resolve, 300));
        if (qrScannerRef.current) {
          try {
            await qrScannerRef.current.start();
            setCameraReady(true);
          } catch (err) {
            console.error("[Scanner] Failed to resume:", err);
            setupScanner();
          }
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [setupScanner]);

  // ✅ Toggle camera
  const toggleCamera = () => {
    if (cameras.length < 2) {
      toast.info("Only one camera available");
      return;
    }
    setCameraReady(false);
    setCurrentCameraIndex((prev) => (prev + 1) % cameras.length);
  };

  return (
    <div className="flex flex-col items-center gap-10">
      <div className="relative rounded-xl overflow-hidden w-3xs h-[300px] mx-auto border-8 border-solid border-white/30 bg-gray-900">
        {/* Camera Toggle Button */}
        <Button
          variant="ghost"
          onClick={toggleCamera}
          disabled={cameras.length < 2 || !cameraReady}
          className="!absolute !top-2 !left-2 px-4 py-2 bg-white/10 size-10 text-white rounded-full border-none z-30 md:hidden"
        >
          <SwitchCameraIcon />
        </Button>

        {/* Video Element */}
        <video
          ref={videoRef}
          className="w-full absolute h-full object-cover !border-0"
          autoPlay
          playsInline
          muted
        />

        {/* Loading Indicator */}
        {!cameraReady && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900/80 z-20">
            <div className="text-white text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-2" />
              <p className="text-sm">Initializing camera...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OnlyScanner;