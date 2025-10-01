import React, { useEffect, useState } from "react";
import { userPostRequest } from "@/service/viewService";

const QRICard = ({ data, printPermission = false, onRedirect }) => {
  const [loader, setLoader] = useState(false);
  const [userNotFound, setUserNotFound] = useState(false);
  const [userDetails, setUserDetails] = useState([]);

  const qutionMark = "/assets/icon/quationMark.svg";
  const scannerToken = JSON.parse(localStorage.getItem("scannerloginToken") || "null");

  useEffect(() => {
    if (data) {
      fetchUserDetails();
    }
  }, [data]);

  const fetchUserDetails = async () => {
    setLoader(true);
    const formData = new FormData();
    formData.append("event_slug", data?.event_slug);
    formData.append("user_token", data?.user_token);
    formData.append("scanner_type", scannerToken ? scannerToken.type : 0);

    try {
      const response = await userPostRequest('get-scanner-data-details',formData)
      if (response.status == 1) {
        setUserDetails(response.data);
        generateEventTime(response.data[0]);
      }
    } catch (err) {
      console.error("Error fetching user details:", err);
    } finally {
      setLoader(false);
    }
  };

  const handleClose = () => {
    setTimeout(() => {
      onRedirect();
    }, 1000);
  };

  const getStatusColor = () => {
    const status = userDetails?.[3];
    switch (status?.color_status) {
      case "yellow":
        return "from-[#e2ec5c]";
      case "red":
        return "from-[#ff4f4f]";
      case "green":
      default:
        return "from-[#4caf50]";
    }
  };

  const getStatusIcon = () => {
    const status = userDetails?.[3];
    switch (status?.color_status) {
      case "yellow":
        return "/assets/icon/info.svg";
      case "red":
        return "/assets/icon/exclamation.svg";
      case "green":
      default:
        return "/assets/icon/check.svg";
    }
  };

  return (
    <>
      {loader && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30">
          <div className="w-10 h-10 mx-auto border-4 border-primaryBlue border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {!loader && userNotFound && (
        <div className="flex flex-col w-full bg-unknown-gradient">
          <div className="relative after:block after:w-full">
            <img
              src={qutionMark}
              className="mx-auto block max-w-[65%] sm:max-w-[326px] mb-6 invert"
              alt="QR img"
            />
          </div>
          <div className="px-4 pb-4 text-center">
            <div className="flex items-center justify-center gap-4 mb-2">
              <h4 className="text-left text-sm font-medium text-[#ff4f4f]">
                You haven't registered yet
              </h4>
            </div>
          </div>
        </div>
      )}

      {!loader && !userNotFound && userDetails.length > 0 && (
        <div className="flex flex-col w-full bg-white">
          <div className="relative after:block after:w-full">
            <img
              src={userDetails[1]?.qr_image}
              className="mx-auto block max-w-[65%] md:max-w-[326px] mb-6"
              alt="QR img"
            />
          </div>
          <div className={`px-4 pb-4 bg-linear-65 text-center ${getStatusColor()}`}>
            <div className="py-2 max-w-[80%] w-full mx-auto px-1.5 bg-amber-950 text-white text-base font-medium text-center rounded-bl-xl rounded-br-xl mb-4">
              {userDetails[0]?.event_title}
            </div>
            <h3 className="text-center text-xl font-semibold mb-4 capitalize">
              {userDetails[2]?.first_name} {userDetails[2]?.last_name}
            </h3>
            <div className="flex items-center justify-center gap-4 mb-2">
              <img src={getStatusIcon()} alt="status" className="h-6 w-6" />
              <h4 className="text-left text-base font-medium">{userDetails[3]?.scanning_msg}</h4>
            </div>
            <h6 className="font-bold text-center text-sm text-black">
              {userDetails[0]?.company_name}
            </h6>
          </div>
        </div>
      )}
    </>
  );
};

export default QRICard;
