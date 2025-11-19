import Image from "next/image";
import React, { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

const EntryCard = ({ entryData, onRedirect, eventData }) => {
  const [userImg, setUserImg] = useState("/assets/images/user-img.jpg");

  const [imageLoadError, setImageLoadError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  
  const [errormsg, setErrorMsg] = useState("User Not Registered");

  useEffect(() => {
    if (entryData) {
      setImageLoading(true);
      if (entryData?.faceImageUrl) {
        setUserImg(entryData.faceImageUrl);
      } else if (entryData?.userData?.qrImageUrl) {
        setUserImg(entryData.userData.qrImageUrl);
      } else {
        setUserImg("/assets/images/user-img.jpg");
      }
    }
  }, [entryData]);
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

 

  return (
    <>
      <div
        onClick={() => {
          onRedirect();
        }}
        className={`flex flex-col w-full max-w-md mx-auto bg-white rounded-2xl overflow-hidden shadow-xl transition-transform duration-200 `}
      >
        {/* User Image Section - Full width rectangular */}
        <div className="relative w-full h-80 bg-gray-100">
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
              className={`w-full h-full object-cover transition-opacity duration-300 ${
                imageLoading ? "opacity-0" : "opacity-100"
              } `}
              alt="User Profile"
              onError={handleImageError}
              onLoad={handleImageLoad}
              unoptimized={true}
              priority={false}
              loader={({ src }) => {
                return src;
              }}
            />
          </>
        </div>

        <div
          className={`${entryData?.scannerData?.color_status == "green" && 'bg-gradient-to-r from-green-400 to-green-600'} px-6 pt-0 pb-8`}
        >
          <div className="bg-amber-900 text-black px-4 py-2 mx-2 mb-2  text-center">
            <p className="text-base font-semibold">
              {eventData?.eventName || "Event Name"}
            </p>
          </div>
          <h1 className="text-center text-2xl font-bold mb-4 text-black capitalize">
            {entryData?.userData?.name || "Participant Name"}
          </h1>

          <div className="flex items-center justify-center gap-3 mb-6 text-black">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>

            <span className="text-lg font-medium text-black">
              {entryData?.scannerData?.scanning_msg || "Status Message"}
            </span>
          </div>
        </div>
      </div>
    </>
  );
};

export default EntryCard;
