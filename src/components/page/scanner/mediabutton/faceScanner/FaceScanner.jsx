import React, { useEffect, useRef, useState, useCallback } from "react";
import * as faceapi from "face-api.js";
import { Button } from "@/components/ui/button";
import { SwitchCameraIcon, AlertCircle } from "lucide-react";
import { toast } from "sonner";

// Preload models once at module level
let modelsLoadedPromise = null;
const preloadModels = () => {
  if (!modelsLoadedPromise) {
    modelsLoadedPromise = Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri("/assets/models"),
      faceapi.nets.faceLandmark68Net.loadFromUri("/assets/models"),
      faceapi.nets.faceLandmark68TinyNet.loadFromUri("/assets/models"),
    ])
      .then(() => {
        return true;
      })
      .catch((error) => {
        console.error("❌ Error preloading face detection models:", error);
        toast.error("Failed to load face detection models");
        return false;
      });
  }
  return modelsLoadedPromise;
};

// Preload models when module is imported
preloadModels();

const FaceScanner = ({
  allowScan = true,
  onCameraError,
  onFaceDetected,
  faceNotmatch = false,
  onManualCapture,
  scannerType = 0,
}) => {
  const videoRef = useRef(null);
  const intervalIdRef = useRef(null);
  const streamRef = useRef(null);
  const [facingMode, setFacingMode] = useState("user");
  const [isLoading, setIsLoading] = useState(true);
  const [hasCamera, setHasCamera] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [debugInfo, setDebugInfo] = useState("");
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [videoReady, setVideoReady] = useState(false);

  // Custom usePrevious hook to track previous facingMode
  const usePrevious = (value) => {
    const ref = useRef();
    useEffect(() => {
      ref.current = value;
    }, [value]);
    return ref.current;
  };
  const previousFacingMode = usePrevious(facingMode);

  // Stop video stream
  const stopVideo = useCallback(() => {
    console.log("🛑 Stopping video stream");
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop();
        console.log("🛑 Camera track stopped:", track.kind);
      });
      streamRef.current = null;
    }
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject = null;
    }
    setVideoReady(false);
  }, []);

  // Start video stream
  const startVideo = useCallback(async () => {
    try {
      console.log("🎥 Starting video with facing mode:", facingMode);
      setDebugInfo("Requesting camera access...");

      stopVideo(); // Stop any existing stream

      const constraints = {
        video: {
          facingMode,
          width: { ideal: 480 }, // Reduced resolution for faster initialization
          height: { ideal: 360 },
        },
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);

      streamRef.current = stream;

      if (videoRef.current) {
        const video = videoRef.current;
        video.srcObject = stream;

        await new Promise((resolve, reject) => {
          const handleLoadedData = () => {
            setVideoReady(true);
            setHasCamera(true);
            setDebugInfo("Camera ready");
            video.removeEventListener("loadeddata", handleLoadedData);
            video.removeEventListener("error", handleError);
            resolve();
          };

          const handleError = (error) => {
            console.error("❌ Video error:", error);
            video.removeEventListener("loadeddata", handleLoadedData);
            video.removeEventListener("error", handleError);
            reject(error);
          };

          video.addEventListener("loadeddata", handleLoadedData);
          video.addEventListener("error", handleError);

          video.play().catch((e) => {
            console.log("⚠️ Video autoplay failed:", e.message);
          });
        });
      } else {
        console.error("Video element not available")
      }
    } catch (err) {
      console.error("❌ Camera access error:", err);
      setHasCamera(false);
      setVideoReady(false);
      setDebugInfo("Camera access failed");
      
      let errorMessage = "Camera access denied";
      if (err.name === "NotAllowedError") {
        errorMessage = "Please allow camera access and refresh the page";
      } else if (err.name === "NotFoundError") {
        errorMessage = "No camera found";
      } else if (err.name === "NotReadableError") {
        errorMessage = "Camera is being used by another application";
      }
      onCameraError(errorMessage);
    }
  }, [facingMode, stopVideo, onCameraError]);

  // Face detection function (for display purposes only)
  const detectFaces = useCallback(async () => {
    if (!videoRef.current || !videoReady || videoRef.current.readyState !== 4) {
      return;
    }

    try {
      const detections = await faceapi.detectAllFaces(
        videoRef.current,
        new faceapi.TinyFaceDetectorOptions({
          inputSize: 320,
          scoreThreshold: 0.4,
        })
      );

      if (detections.length > 0) {
        setFaceDetected(true);
        setDebugInfo(`Face detected - ready to capture`);
      } else {
        setFaceDetected(false);
        setDebugInfo("Position your face in the scanner");
      }
    } catch (error) {
      console.error("❌ Face detection error:", error);
      setDebugInfo("Face detection error");
    }
  }, [videoReady]);

  // Start face detection
  const startFaceDetection = useCallback(() => {
    if (intervalIdRef.current) {
      clearInterval(intervalIdRef.current);
    }

    if (!modelsLoaded || !videoReady) {
      console.log("⚠️ Cannot start face detection - models or video not ready");
      return;
    }
    setDebugInfo("Face detection active");
    intervalIdRef.current = setInterval(detectFaces, 300); // Reduced from 500ms to 300ms
  }, [modelsLoaded, videoReady, detectFaces]);

  // Capture image from video
  const captureImage = useCallback((video) => {
    try {
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      return canvas.toDataURL("image/jpeg", 0.7); // Reduced quality for smaller size
    } catch (error) {
      console.error("❌ Error capturing image:", error);
      return null;
    }
  }, []);

  // Initialize the scanner
  useEffect(() => {
    let isMounted = true;
    let safetyTimeout;

    const initializeScanner = async () => {
      if (!isMounted) return;
      setIsLoading(true);

      try {
        // Wait for preloaded models
        const modelsReady = await modelsLoadedPromise;
        if (!isMounted || !modelsReady) return;
        setModelsLoaded(true);

        // Start video stream
        await startVideo();
        if (!isMounted) return;

        setIsLoading(false);
      } catch (error) {
        console.error("❌ Scanner initialization failed:", error);
        if (isMounted) {
          setIsLoading(false);
          setHasCamera(false);
        }
      }
    };

    // Safety timeout reduced to 5 seconds
    safetyTimeout = setTimeout(() => {
      if (isMounted) {
        setIsLoading(false);
        setDebugInfo("Loading timeout - please refresh");
      }
    }, 5000);

    initializeScanner();

    return () => {
      isMounted = false;
      clearTimeout(safetyTimeout);
      clearInterval(intervalIdRef.current);
      stopVideo();
    };
  }, [startVideo]);

  // Effect to handle camera switching only when facingMode actually changes
  useEffect(() => {
    if (previousFacingMode !== undefined && previousFacingMode !== facingMode) {
      startVideo()
        .then(() => {
          if (modelsLoaded && videoReady) {
            startFaceDetection();
          }
        })
        .catch(console.error);
    }
  }, [facingMode, previousFacingMode, modelsLoaded, videoReady, startFaceDetection, startVideo]);

  // Effect to start face detection when both models and video are ready
  useEffect(() => {
    if (modelsLoaded && videoReady && !isLoading) {
      startFaceDetection();
    }
  }, [modelsLoaded, videoReady, isLoading, startFaceDetection]);

  const toggleCamera = useCallback(() => {
    setFacingMode((prev) => (prev === "user" ? "environment" : "user"));
  }, []);

  // Manual capture function
  const handleManualCapture = useCallback(() => {
    
    if (!videoRef.current || !videoReady) {
      toast.error("Camera not ready. Please wait.");
      return;
    }

    const image = captureImage(videoRef.current);
    
    if (image ) {
      onManualCapture({ image });
    } else {
      toast.error("Failed to capture image. Please try again.");
    }
  }, [videoReady, onManualCapture, captureImage, allowScan]);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative rounded-xl overflow-hidden w-[200px] h-[300px] mx-auto border-8 border-solid border-white/30 bg-gray-900">
        <video
          ref={(el) => {
            videoRef.current = el;
            if (el) {
              console.log("📹 Video element mounted successfully");
            }
          }}
          autoPlay
          playsInline
          muted
          className="w-full absolute top-0 left-0 h-full object-cover"
          style={{ transform: facingMode === "user" ? "scaleX(-1)" : "scaleX(1)" }}
        />

        {isLoading ? (
          <div className="absolute inset-0 z-30 flex items-center justify-center text-white bg-gray-900">
            <div>
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
              <p className="text-sm">Loading camera...</p>
            </div>
          </div>
        ) : !hasCamera ? (
          <div className="absolute inset-0 z-30 flex items-center justify-center text-red-600 bg-red-50 p-4">
            <div>
              <AlertCircle className="h-8 w-8 mx-auto mb-2" />
              <p className="text-sm font-medium mb-2">Camera Error</p>
              <p className="text-xs mb-3">Please allow camera access and refresh the page</p>
              <Button
                onClick={() => window.location.reload()}
                className="text-xs px-3 py-1 bg-red-600 text-white hover:bg-red-700"
              >
                Refresh Page
              </Button>
            </div>
          </div>
        ) : (
          <>
            <Button
              variant="ghost"
              onClick={toggleCamera}
              className="mb-2 px-4 py-2 bg-white/10 size-10 text-white rounded-full border-none mt-2 relative z-30 md:hidden"
            >
              <SwitchCameraIcon />
            </Button>

            {/* Face detection indicator */}
            <div
              className={`absolute top-2 right-2 w-3 h-3 rounded-full z-20 ${faceDetected ? "bg-green-500" : "bg-red-500"
                }`}
            ></div>

            {/* Video ready indicator */}
            {!videoReady && (
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20">
                <div className="text-white text-xs">Preparing camera...</div>
              </div>
            )}

            <img
              src="/assets/images/mask-image.svg"
              className="!w-[75%] h-auto block m-auto absolute z-20 top-[100px] left-2/4 -translate-x-2/4 opacity-50"
              alt="mask"
              loading="lazy" // Added to address LCP warning
            />

            {/* Face detection status */}
            <div className="absolute bottom-2 left-2 right-2 z-20">
              
              {faceNotmatch && (
                <p className="text-xs mt-1 px-2 py-1 bg-orange-500/80 text-white rounded">
                  Face not recognized - try again
                </p>
              )}
            </div>
          </>
        )}
      </div>

      {/* Check In Button */}
      {hasCamera && videoReady && (
        <Button
          onClick={handleManualCapture}
          disabled={!allowScan}
          className="bg-white text-black font-semibold py-3 px-8 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          Check {scannerType == 0 ? "In" : "Out"}
        </Button>
      )}
    </div>
  );
};

export default FaceScanner;