import Image from "next/image";
import React, { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

const QRScannerDetails = ({ qrData, onRedirect }) => {
  const [userImg, setUserImg] = useState("/assets/images/user-img.jpg");
  const [userNotFound, setUserNotFound] = useState(false);
  const [imageLoadError, setImageLoadError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [fieldMap , setFieldMap] = useState(null)

  useEffect(() => {
    if (qrData) {      
      const isErrorResponse = qrData?.length === 1 && qrData[0]?.color_status === "red";      
            
      if(qrData?.[1].map_array){
        
        setFieldMap(qrData?.[1].map_array)
      }

      if (isErrorResponse) {        
        setUserImg(null);
        setImageLoading(false);
        setUserNotFound(true);
        handleAudioBasedOnStatus();
      } else {       
        let userImage = null;
        if (qrData[1]?.faceImageUrl) {
          userImage = qrData[1].faceImageUrl;
        }else if(qrData[1]?.qrImage){
          userImage = qrData[1].qrImage;
        }
        setImageLoading(true);

        if (userImage && userImage !== "" && !userImage.includes("undefined") && !userImage.includes("null")) {
          setUserImg(userImage);
          setImageLoadError(false);
        } else {
          setUserImg("/assets/images/user-img.jpg");
          setImageLoading(false);
        }
        setUserNotFound(false);
        handleAudioBasedOnStatus();
      }
    } else {
      setUserNotFound(true);
    }

    // Remove automatic redirect - user will manually click "Scan Again"
  }, [qrData]);

  // Handle image load error
  const handleImageError = () => {    
    setImageLoadError(true);
    setUserImg("/assets/images/user-img.jpg");
    setImageLoading(false);
  };

  // Handle image load success
  const handleImageLoad = () => {    
    setImageLoading(false);
    setImageLoadError(false);
  };

  // Check if participant is blocked
  const isParticipantBlocked = () => {
    // Check if the participant data has isBlocked field
    const participantData = qrData?.[2];
    return participantData?.isBlocked || participantData?.dynamic_fields?.isBlocked || false;
  };

  // Get user name from dynamic form data
  const getUserName = () => {
  // Check if this is an error response
  const isErrorResponse = qrData?.length === 1 && qrData[0]?.color_status === "red";

  if (isErrorResponse) {
    return "Unregistered User";
  }

  const userData = qrData?.[1];
  
  if (userData?.formData && userData?.map_array) {
    const { formData, map_array } = userData;
    
    // Get the mapped field names from map_array
    const firstNameField = map_array['first_name'];
    const lastNameField = map_array['last_name'];
    
    // Get the actual values from formData
    const firstName = formData[firstNameField] || "";
    const lastName = formData[lastNameField] || "";
    
    // Return combined name if either exists
    if (firstName || lastName) {
      return `${firstName} ${lastName}`.trim();
    }
  }
  
  return "Guest User";
};

  function speakThankYou() {
    const utterance = new SpeechSynthesisUtterance("Thank you");
    utterance.lang = "en-US";
    speechSynthesis.speak(utterance);
  }

  function playErrorAudio() {
    try {
      const audio = new Audio("/assets/audio/error-sound.mp3");
      audio.volume = 0.7; // Adjust volume as needed (0.0 to 1.0)
      audio.play().catch((error) => {
        console.log("Error playing audio:", error);
      });
    } catch (error) {
      console.log("Audio not supported or failed:", error);
    }
  }

  function handleAudioBasedOnStatus() {
    // Check if this is an error response
    const isErrorResponse = qrData?.length === 1 && qrData[0]?.color_status === "red";

    if (isErrorResponse) {
      // Play error audio for unregistered users
      playErrorAudio();
      return;
    }

    // Check the main status color
    const status = qrData?.[2];
    const colorStatus = status?.color_status;

    if (colorStatus === "green") {
      // Play thank you speech for successful check-ins
      speakThankYou();
    } else if (colorStatus === "red" || colorStatus === "yellow") {
      // Play error audio for blocked/warned users
      playErrorAudio();
    } else {
      // Default to thank you for unknown statuses
      speakThankYou();
    }
  }

  if (userNotFound) {
    return (
      <div
        onClick={() => {
          console.log("🔄 FaceScannerDetails userNotFound clicked, calling onRedirect");
          onRedirect();
        }}
        className="max-w-96 mx-auto flex flex-col justify-center gap-4 w-full rounded-sm bg-gradient-to-t bg-[#ff4f4f] from-white p-4 min-h-80 cursor-pointer hover:scale-105 active:scale-95 transition-transform duration-200"
      >
        <div className="relative">
          <svg
            width="81"
            height="81"
            viewBox="0 0 81 81"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="size-40 sm:size-60 block mx-auto"
          >
            <rect x="0.333313" y="0.333496" width="80" height="80" rx="40" fill="#FF4F4F" />
            <path
              d="M40.1333 64.3335C41.5333 64.3335 42.7166 63.8502 43.6833 62.8835C44.65 61.9168 45.1333 60.7335 45.1333 59.3335C45.1333 57.9335 44.65 56.7502 43.6833 55.7835C42.7166 54.8168 41.5333 54.3335 40.1333 54.3335C38.7333 54.3335 37.55 54.8168 36.5833 55.7835C35.6166 56.7502 35.1333 57.9335 35.1333 59.3335C35.1333 60.7335 35.6166 61.9168 36.5833 62.8835C37.55 63.8502 38.7333 64.3335 40.1333 64.3335ZM40.3333 80.3335C34.8 80.3335 29.6 79.2835 24.7333 77.1835C19.8666 75.0835 15.6333 72.2335 12.0333 68.6335C8.43331 65.0335 5.58331 60.8002 3.48331 55.9335C1.38331 51.0668 0.333313 45.8668 0.333313 40.3335C0.333313 34.8002 1.38331 29.6002 3.48331 24.7335C5.58331 19.8668 8.43331 15.6335 12.0333 12.0335C15.6333 8.4335 19.8666 5.5835 24.7333 3.4835C29.6 1.3835 34.8 0.333496 40.3333 0.333496C45.8666 0.333496 51.0667 1.3835 55.9333 3.4835C60.8 5.5835 65.0333 8.4335 68.6333 12.0335C72.2333 15.6335 75.0833 19.8668 77.1833 24.7335C79.2833 29.6002 80.3333 34.8002 80.3333 40.3335C80.3333 45.8668 79.2833 51.0668 77.1833 55.9335C75.0833 60.8002 72.2333 65.0335 68.6333 68.6335C65.0333 72.2335 60.8 75.0835 55.9333 77.1835C51.0667 79.2835 45.8666 80.3335 40.3333 80.3335ZM40.7333 23.1335C42.4 23.1335 43.85 23.6668 45.0833 24.7335C46.3166 25.8002 46.9333 27.1335 46.9333 28.7335C46.9333 30.2002 46.4833 31.5002 45.5833 32.6335C44.6833 33.7668 43.6666 34.8335 42.5333 35.8335C41 37.1668 39.65 38.6335 38.4833 40.2335C37.3166 41.8335 36.7333 43.6335 36.7333 45.6335C36.7333 46.5668 37.0833 47.3502 37.7833 47.9835C38.4833 48.6168 39.3 48.9335 40.2333 48.9335C41.2333 48.9335 42.0833 48.6002 42.7833 47.9335C43.4833 47.2668 43.9333 46.4335 44.1333 45.4335C44.4 44.0335 45 42.7835 45.9333 41.6835C46.8666 40.5835 47.8666 39.5335 48.9333 38.5335C50.4666 37.0668 51.7833 35.4668 52.8833 33.7335C53.9833 32.0002 54.5333 30.0668 54.5333 27.9335C54.5333 24.5335 53.15 21.7502 50.3833 19.5835C47.6166 17.4168 44.4 16.3335 40.7333 16.3335C38.2 16.3335 35.7833 16.8668 33.4833 17.9335C31.1833 19.0002 29.4333 20.6335 28.2333 22.8335C27.7666 23.6335 27.6166 24.4835 27.7833 25.3835C27.95 26.2835 28.4 26.9668 29.1333 27.4335C30.0666 27.9668 31.0333 28.1335 32.0333 27.9335C33.0333 27.7335 33.8666 27.1668 34.5333 26.2335C35.2666 25.2335 36.1833 24.4668 37.2833 23.9335C38.3833 23.4002 39.5333 23.1335 40.7333 23.1335Z"
              fill="white"
            />
          </svg>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-4 mb-2">
            <h4 className="text-left text-base font-medium">User Not Registered</h4>
          </div>
        </div>
      </div>
    );
  }

  // Get gradient background color based on status
  const getBackgroundColor = () => {
    const status = qrData?.[2];
    switch (status?.color_status) {
      case "yellow":
        return "bg-gradient-to-r from-yellow-400 to-yellow-600";
      case "red":
        return "bg-gradient-to-r from-red-400 to-red-600";
      case "green":
        return "bg-gradient-to-r from-green-400 to-green-600";
      default:
        return "bg-gradient-to-r from-green-400 to-green-600";
    }
  };

  // Get status message
  const getStatusMessage = () => {
    // Check if this is an error response
    const isErrorResponse = qrData?.length === 1 && qrData[0]?.color_status === "red";

    if (isErrorResponse) {
      return qrData[0]?.scanning_msg || "You have not registered yet";
    }

    return qrData?.[2]?.scanning_msg || "We Welcome You!";
  };

  // Check if this is an error response
  const isErrorResponse = qrData?.length === 1 && qrData[0]?.color_status === "red";

  return (
    <div
      onClick={() => {
        console.log("🔄 FaceScannerDetails clicked, calling onRedirect");
        onRedirect();
      }}
      className={`flex flex-col w-full max-w-md mx-auto bg-white rounded-2xl overflow-hidden shadow-xl transition-transform duration-200 ${
        isErrorResponse ? "cursor-pointer hover:scale-105 active:scale-95" : ""
      }`}
    >
      {/* User Image Section - Full width rectangular */}
      <div className="relative w-full h-80 bg-gray-100">
        {isErrorResponse ? (
          // Show question mark icon for error responses
          <div className="w-full h-full flex items-center justify-center bg-gray-200">
            <svg
              className="w-32 h-32 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        ) : (
          <>
            {imageLoading && (
              <div className="w-full h-full flex items-center justify-center absolute inset-0 bg-gray-200">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            )}
            <Image
              width={400}
              height={200}
              src={imageLoadError ? "/assets/images/user-img.jpg" : userImg}
              className={`w-full h-full object-contain transition-opacity duration-300 ${
                imageLoading ? "opacity-0" : "opacity-100"
              } ${isParticipantBlocked() ? "grayscale" : ""}`}
              alt="User Profile"
              onError={handleImageError}
              onLoad={handleImageLoad}
              unoptimized={true}
              priority={false}
              loader={({ src }) => {
                // Custom loader to handle external URLs
                console.log("Image loader called with src:", src);
                return src;
              }}
            />
          </>
        )}
      </div>

      {/* Status Background Section */}
      <div className={`${getBackgroundColor()} px-6 pt-0 pb-8`}>
        <div className="bg-amber-900 text-black px-4 py-2 mx-2 mb-2  text-center">
          <p className="text-base font-semibold">
            {isErrorResponse ? "Scanner System" : qrData?.[0]?.event_title || "Event Name"}
          </p>
        </div>
        {/* User Name */}
        <h1 className="text-center text-2xl font-bold mb-4 text-black capitalize">{getUserName()}</h1>

        {/* Status Message with Icon */}
        <div className="flex items-center justify-center gap-3 mb-6 text-black">
          {isErrorResponse ? (
            // Show X icon for error responses
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          ) : (
            // Show check icon for success responses
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          )}
          <span className="text-lg font-medium text-black">{getStatusMessage()}</span>
        </div>
      </div>
    </div>
  );
};

export default QRScannerDetails;
