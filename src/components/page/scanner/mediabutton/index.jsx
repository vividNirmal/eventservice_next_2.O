"use client";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import FaceComponent from "./faceScanner";
import MobileWithLogin from "./mobilewithLoging/MobileWithLogin";
import QrScanner from "./Qrscanner/QrScanner";
import Image from "next/image";
import { SacnnerGet } from "@/service/viewService";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EllipsisVertical } from "lucide-react";
import { Button } from "@/components/ui/button";

const MediaButton = ({ eventData, event_slug }) => {
  const [pageRedirect, setPageRedirect] = useState(3);
  const [buttonList, setButtonList] = useState([]);
  const [scannerUniqueId, setScannerUniqueId] = useState("");
  const [scannerData, setScannerData] = useState(null);
  const router = useRouter();

  useEffect(() => {
    fetchButtonList();
    getScannerUniqueId();
    const scanner_data = JSON.parse(
      sessionStorage.getItem("scannerloginToken")
    );
    if (scanner_data) {
      setScannerData(scanner_data);
    }
  }, []);

  function getScannerUniqueId() {
    try {
      const tokenData = sessionStorage.getItem("scannerloginToken");
      if (tokenData) {
        const parsed = JSON.parse(tokenData);
        setScannerUniqueId(parsed.scanner_unique_id || "");
      }
    } catch (error) {
      console.error("Error getting scanner unique ID:", error);
    }
  }

  async function fetchButtonList() {
    try {
      const response = await SacnnerGet("scanner-page");
      if (response.status == 403) {
        localStorage.removeItem("scannerloginToken");
      }
      const buttonSettings = response.data?.button_settings;
      setButtonList(buttonSettings);
    } catch (error) {
      console.error("Error fetching button list:", error);
    }
  }
  
  const backButton = () => {
    setPageRedirect(1);
  };

  const cameraError = () => {
    toast.error("Camera Error: ", { description: `Camera not found` });
    setPageRedirect(1);
  };

  const toggleScanner = () => {
    setPageRedirect(2);
  };

  const faceScanner = () => {
    setPageRedirect(3);
  };

  function handleLogout() {
    sessionStorage.removeItem("scannerloginToken");
    const entryUrl = localStorage.getItem("scannerEntryUrl");

    // Extract and store key and event_slug for clean URL redirect
    if (entryUrl) {
      try {
        const url = new URL(entryUrl);
        const key = url.searchParams.get("key");
        const event_slug = url.searchParams.get("event_slug");

        // Store parameters in localStorage for the attendance page to use
        if (key && event_slug) {
          localStorage.setItem("tempAttendanceKey", key);
          localStorage.setItem("tempAttendanceEventSlug", event_slug);
        }
      } catch (error) {
        console.error("Error parsing entry URL:", error);
      }
    }

    // Redirect to clean URL without any query parameters
    router.replace("/attendee");
  }

  function mediaButtonNameUpdate (item){
    if(item.type == 1 || item.type == 4 ){
      return scannerData.type == 0 ? `Entry ${item.name}` : `Exit ${item.name}`
    }else{
      return item.name
    }
  }
  return (
    <div className="flex md:flex-row pb-24 p-4 flex-col md:flex-wrap items-center justify-center h-full min-h-svh gap-4 relative bg-cover bg-no-repeat bg-center bg-[url('/assets/images/scanner-bg.webp')]">
      <div className="w-full flex md:flex-row flex-col md:flex-wrap gap-3 md:gap-5 justify-center xl:min-h-60 px-4">
        {true && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="h-8 w-8 p-0 hover:bg-transparent text-white hover:text-white fixed top-4 right-4  z-10"
              >
                <EllipsisVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                {scannerData && scannerData.type == 0
                  ? "Check In"
                  : "Check Out"}{" "}
                {scannerUniqueId ? `(${scannerUniqueId})` : ""}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={backButton} className="cursor-pointer">
                Change mode
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleLogout}
                className="cursor-pointer"
              >
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {pageRedirect === 1 && (
          <div className="flex flex-wrap justify-center gap-4 max-w-4xl w-full mx-auto">
            <div className="w-full text-center">
              <h3 className="text-white sm:mb-3 md:mb-5 text-xl lg:text-3xl 2xl:text-4xl font-semibold capitalize -tracking-wide">
                Choose your choice
              </h3>
            </div>

            {buttonList?.length > 0 ? (
              buttonList.map((item, idx) => {
                const ButtonContent = () => (
                  <>
                    <div className="bg-white p-0 rounded-lg size-20 overflow-hidden grid place-items-center">
                      <img
                        className="max-w-full size-full"
                        src={item.icon}
                        alt={item.name}
                        loading="lazy"
                      />
                    </div>
                    <span className="text-sm lg:text-lg leading-tight text-center w-full block">
                      {mediaButtonNameUpdate(item)}
                    </span>
                  </>
                );

                let onClick;
                if (item.type == 0) onClick = toggleScanner;
                else if (item.type == 1 && eventData?.with_face_scanner == 1)
                  onClick = faceScanner;
                else if (item.type == 4) onClick = () => setPageRedirect(2);
                else if (item.type == 5) onClick = () => setPageRedirect(6);
                else return null;
                const isDisabled = item.status === false;

                return (
                  <button
                    key={idx}
                    disabled={isDisabled}
                    className="text-white bg-white/10 hover:bg-white/15 backdrop-blur-lg border border-solid border-white/20 overflow-hidden rounded-xl lg:rounded-2xl cursor-pointer p-4 outline-0 flex flex-col items-center gap-3 w-3xs md:max-w-1/3 md:w-1/4 grow transition-all duration-200 ease-linear"
                    onClick={onClick}
                  >
                    <ButtonContent />
                  </button>
                );
              })
            ) : (
              <div className="fixed inset-0 grid place-items-center">
                <div className="three-body">
                  <div className="three-body__dot"></div>
                  <div className="three-body__dot"></div>
                  <div className="three-body__dot"></div>
                </div>
              </div>
            )}
          </div>
        )}

        {pageRedirect === 2 && (
          <QrScanner className="w-full" onCameraError={cameraError} />
        )}

        {pageRedirect == 3 && (
          <FaceComponent eventData={eventData} onCameraError={cameraError} />
        )}
        

        {pageRedirect === 6 && <MobileWithLogin onCameraError={cameraError} />}
      </div>

      <div className="absolute bottom-5 left-2/4 -translate-x-2/4 flex flex-col gap-2 w-fit">
        <span className="block w-full text-zinc-50 text-sm xl:text-base px-5 text-center">
          Powered by 
        </span>
        <Image
          width={150}
          height={150}
          src={eventData?.event_logo||"/assets/images/Powerdby.png"}
          className="max-w-36 w-full block h-auto mx-auto rounded-sm"
          alt="Logo"
        />
      </div>
    </div>
  );
};

export default MediaButton;
