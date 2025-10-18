import React, { useEffect, useRef, useState } from "react";
import QRICard from "../userDetails/QrICard";
import Scanner from "../Scanner";

const SecondQrScanner = ({ onCameraError }) => {
  const [step, setStep] = useState(1);
  const [eventData, setEventData] = useState(null);
  const [printValue, setPrintValue] = useState(false);
  const scannerInputRef = useRef(null);
  const scannerTimeoutRef = useRef(null);

  useEffect(() => {
    setTimeout(() => {
      scannerInputRef.current?.focus();
    }, 500);
  }, []);

  const printPermissionHandler = (value) => {
    setPrintValue(value);
  };

  const handleCameraError = (value) => {
    if (value && onCameraError) {
      onCameraError(true);
    }
  };

  const redirectHandler = () => {
    setPrintValue(false);
    setStep(1);
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

  const qrScannerDataHandler = (data) => {
    try {
      const json = JSON.parse(data);
      const userData = {
        user_token: json?.user_token,
        event_slug: json?.event_slug,
      };

      if (userData?.event_slug) {
        setEventData(userData);
        setStep(2);
      } else {
        alert("Invalid QR Code");
      }
    } catch (e) {
      alert("Invalid QR Code");
    }
  };

  const handleInput = (event) => {
    event.preventDefault();
    const input = event.target;

    if (scannerTimeoutRef.current) {
      clearTimeout(scannerTimeoutRef.current);
    }

    scannerTimeoutRef.current = setTimeout(() => {
      const scannedData = input.value;
      qrScannerDataHandler(scannedData);
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
    <div className="flex md:flex-row flex-col md:flex-wrap gap-5 justify-center min-h-60 px-4">
      {step === 1 && (
        <div className="flex flex-col">
          <input
            ref={scannerInputRef}
            onInput={handleInput}
            onFocus={resetInput}
            onBlur={onBlur}
            className="bg-transparent appearance-none outline-none border-0 caret-transparent text-transparent"
            autoFocus
          />
          <Scanner onQrDetails={qrScannerDataHandler} onPrintChange={printPermissionHandler} onError={handleCameraError} />
        </div>
      )}

      {step === 2 && <QRICard data={eventData} printPermission={printValue} onRedirect={redirectHandler} />}
    </div>
  );
};

export default SecondQrScanner;
