import React, { useEffect, useRef, useState } from "react";
import QrScanner from "qr-scanner";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { SwitchCameraIcon } from "lucide-react";

const Scanner = ({ allowScan = true, onQrDetails, onPrintChange, onError }) => {
  const videoRef = useRef(null);
  const qrScannerRef = useRef(null);
  const [qrResult, setQrResult] = useState(null);
  const [printChecked, setPrintChecked] = useState(false);
  const [clickButtonShow, setClickButtonShow] = useState(false);
  const [cameras, setCameras] = useState([]);
  const [currentCameraIndex, setCurrentCameraIndex] = useState(0);

  // Load available cameras on mount
  useEffect(() => {
    QrScanner.listCameras(true).then((devices) => {
      setCameras(devices);
    });
  }, []);

  useEffect(() => {
    if (allowScan) {
      initScanner();
    }
    return () => {
      qrScannerRef.current?.stop();
    };
  }, [allowScan, currentCameraIndex]);

  useEffect(() => {
    if (qrResult) {
      onQrDetails(qrResult);
    }
  }, [qrResult]);

  const initScanner = async () => {
    qrScannerRef.current = new QrScanner(
      videoRef.current,
      (result) => onScanSuccess(result),
      {
        returnDetailedScanResult: true,
        highlightScanRegion: false,
        maxScansPerSecond: 1,
        highlightCodeOutline: true,
      }
    );

    try {
      if (cameras.length > 0) {
        await qrScannerRef.current.start(cameras[currentCameraIndex]?.id);
      } else {
        await qrScannerRef.current.start();
      }
    } catch (err) {
      onError?.(err);
      console.error("Error starting QR scanner:", err);
    }
  };

  const onScanSuccess = (result) => {
    if (!allowScan) return;
    setQrResult(result.data);
  };

  const handleCheckboxChange = (e) => {
    const isChecked = e.target.checked;
    setPrintChecked(isChecked);
    setClickButtonShow(isChecked);
    if (onPrintChange) onPrintChange(isChecked);
  };

  const handleScanQR = () => {
    if (!qrScannerRef.current) {
      initScanner();
    } else {
      qrScannerRef.current.start();
    }
  };

  const toggleCamera = async () => {
    if (cameras.length > 1) {
      const nextIndex = (currentCameraIndex + 1) % cameras.length;
      setCurrentCameraIndex(nextIndex);
      await qrScannerRef.current?.stop();
      await qrScannerRef.current?.start(cameras[nextIndex].id);
    }
  };

  return (
    <>
      {/* Toggle Switch */}
      <div className="w-full flex flex-wrap items-center justify-end gap-3 h-auto absolute top-4 right-0 px-4">
        <span className="text-white text-sm 2xl:text-base">Auto</span>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            className="sr-only peer w-full h-full"
            checked={printChecked}
            onChange={handleCheckboxChange}
          />
          <div className="group peer bg-white rounded-full duration-300 w-12 h-6 ring-2 ring-primaryBlue after:duration-300 after:bg-primaryBlue peer-checked:after:bg-green-600 peer-checked:ring-green-600 after:rounded-full after:absolute after:h-5 after:w-5 after:top-1/2 after:-translate-y-1/2 after:left-[3px] after:flex after:justify-center after:items-center peer-checked:after:translate-x-[22px] peer-hover:after:scale-95" />
        </label>
        <span className="text-white text-sm 2xl:text-base">Manual</span>
      </div>

      {/* Video + Toggle Camera Button */}
      <div className="flex flex-col items-center gap-10">
        <div className="relative rounded-full overflow-hidden w-[200px] h-[300px] mx-auto border-8 border-solid border-white/30 text-center">
          <Button
            variant="gosht"
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
          ></video>
          <Image
            src="/assets/images/mask-image.svg"
            width={200}
            height={200}
            alt="mask img"
            className="!w-[75%] h-auto block m-auto absolute z-20 top-[100px] left-2/4 -translate-x-2/4 opacity-50"
          />
        </div>

        {/* Scan Button */}
        {clickButtonShow && (
          <Button
            onClick={handleScanQR}
            className="uppercase font-semibold block w-fit text-base h-10 px-10 text-indigo-600 hover:text-white rounded-full bg-white shadow-none border-4 border-solid border-indigo-600 duration-50"
          >
            Scan
          </Button>
        )}
      </div>
    </>
  );
};

export default Scanner;
