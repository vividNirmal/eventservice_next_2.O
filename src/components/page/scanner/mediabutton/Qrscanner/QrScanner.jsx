import React, { useEffect, useRef, useState } from "react";
import Details from "../userDetails/Details";
import Scanner from "../Scanner";

const QrScanner = ({ onCameraError }) => {
  const [step, setStep] = useState(1);
  const [printPermission, setPrintPermission] = useState(false);
  const [eventData, setEventData] = useState(null);
  const inputRef = useRef(null);
  const timeoutRef = useRef(null);

  useEffect(() => {
    setTimeout(() => {
      inputRef.current?.focus();
    }, 500);
  }, []);

  const handlePrintPermission = (value) => {
    setPrintPermission(value);
  };

  const handleRedirect = () => {
    setPrintPermission(false);
    setStep(1);
    setTimeout(() => {
      handleBlur();
    }, 500);
  };

  const handleCameraError = (value) => {
    if (value && onCameraError) {
      onCameraError(value);
    }
  };

  const handleBlur = () => {
    if (inputRef.current) {
      inputRef.current.focus();
      inputRef.current.value = "";
    }
  };

  const resetInput = () => {
    if (inputRef.current) {
      inputRef.current.value = "";
      inputRef.current.focus();
    }
  };

  const handleInput = (event) => {
    event.preventDefault();

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      const scannedData = event.target.value;
      processQRData(scannedData);
      resetInput();
    }, 1000);
  };

  const processQRData = (data) => {
    try {
      const json = JSON.parse(data);
      const user = {
        event_slug: json?.event_slug,
      };

      if (user.event_slug) {
        setEventData(user);
        setStep(2);
      }
    } catch (e) {
      // ToastService.showError("Invalid QR Code");
    }
  };

  return (
    <div className="flex md:flex-row flex-col md:flex-wrap gap-5 justify-center min-h-60 px-4">
      {step === 1 && (
        <div className="flex flex-col">
          <input
            ref={inputRef}
            onInput={handleInput}
            onFocus={resetInput}
            onBlur={handleBlur}
            autoFocus
            className="bg-transparent appearance-none outline-none border-0 caret-transparent text-transparent"
          />
          <Scanner
            onQrDetails={processQRData}
            onPrint={handlePrintPermission}
            onError={handleCameraError}
          />
        </div>
      )}
      {step === 2 && (
        <Details
          data={eventData}
          onRedirect={handleRedirect}
          printPermission={printPermission}
        />
      )}
    </div>
  );
};

export default QrScanner;
