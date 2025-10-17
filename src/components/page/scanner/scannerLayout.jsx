"use client";
import React, { useEffect, useState } from "react";
// import MediaButton from "./mediabutton";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { postRequest } from "@/service/viewService";
import ScannerLogin from "./scannerLogin/scannerLogin";
import MediaButton from "./mediabutton";
import { toast } from "sonner";

function ScannerLayout() {
  const [step, setStep] = useState(2);
  const [scannerList, setScannerList] = useState([]);
  const [eventData, setEventData] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const { event_slug, domain } = useParams();
  const router = useRouter();


  // Fix window undefined error by checking if we're on client side
  const getSubdomain = () => {
    if (typeof window !== 'undefined') {
      const host = window.location.hostname;      
      const parts = host.split(".");      
      const currentSubdomain = parts.length > 1 ? parts[0] : "";      
      return currentSubdomain;
    }
    return "";
  };

  const currentSubdomain = getSubdomain();

  // Function to get the original attendee URL
  const getOriginalAttendeeUrl = () => {
    const entryUrl = localStorage.getItem("scannerEntryUrl");
    if (entryUrl) {
      try {
        const url = new URL(entryUrl);
        // Extract the path from the original URL
        return url.pathname;
      } catch (e) {
        console.error("Error parsing scannerEntryUrl:", e);
      }
    }
    // Fallback: try to construct from current URL or use a default
    if (typeof window !== 'undefined') {
      const currentHost = window.location.hostname;
      const parts = currentHost.split(".");
      const subdomain = parts.length > 1 ? parts[0] : "";
      return `/attendee/default`;
    }
    return "/attendee/default";
  };

  useEffect(() => {
    const token = JSON.parse( sessionStorage.getItem("scannerloginToken"));        
    if (token) {
      setStep(2);
    } else {
      setStep(1);
    }
  }, []); // Remove step dependency to prevent infinite loop

  useEffect(() => {
    fetchScannerMachine();
  }, [event_slug, currentSubdomain]);

  async function fetchScannerMachine() {
    try {
      setIsLoading(true);
      setError("");
      
      const formData = new FormData();
      formData.append("event_slug", event_slug);
      formData.append("sub_domain", currentSubdomain);
      const responce = await postRequest("get-event-details-slug", formData);      
      // Check if response is successful
      if (responce && responce.status === 1) {
        setScannerList(responce?.data?.scanner_machine_list || []);
        setEventData(responce?.data?.event_details || null);
      } else {
        // Handle error response (status 0 or other errors)
        const errorMessage = responce?.message || "Failed to fetch event details";
        toast.error(errorMessage);
        console.error("API Error:", responce);
        
        // Clear token and redirect back to original attendee URL
        sessionStorage.removeItem("scannerloginToken");
        const originalUrl = getOriginalAttendeeUrl();
        router.push(originalUrl);
        return;
      }
    } catch (error) {
      const errorMessage = error.message || "Failed to fetch scanner machine";
      setError(errorMessage);
      toast.error(errorMessage);
      console.error("Network/Parse Error:", error);
      
      // Clear token and redirect back to original attendee URL
      sessionStorage.removeItem("scannerloginToken");
      const originalUrl = getOriginalAttendeeUrl();
      router.push(originalUrl);
      return;
    } finally {
      setIsLoading(false);
    }
  }

  const goback = () => {
    // Clear token and redirect back to where user came from
    router.back();
  };

  const renderStep = () => {
    // Show loading state while fetching data
    if (isLoading) {
      return (
        <div className="fixed inset-0 grid place-items-center">
          <div className="three-body">
            <div className="three-body__dot"></div>
            <div className="three-body__dot"></div>
            <div className="three-body__dot"></div>
          </div>
        </div>
      );
    }

    switch (Number(step)) {
      case 1:
        return (
          // <ScannerLogin
          //   scannerList={scannerList}
          //   userLogin={(data) => setStep(data)}
          // />
          // Redirect to original attendee URL if no scannerList
          
            <div className="fixed inset-0 grid place-items-center">
              <div className="text-center p-6 max-w-md mx-auto">
                <div className="text-yellow-500 text-6xl mb-4">⚠️</div>
                <h2 className="text-xl font-semibold text-gray-800 mb-2">
                  {error || "No Scanner Machines Available"}
                </h2>
                <button
                  onClick={() => { goback (); }}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                >
                  Go Back
                </button>
              </div>
            </div>
        );
      case 2:
        if (!eventData) {
          return (
            <div className="fixed inset-0 grid place-items-center">
              <div className="text-center p-6 max-w-md mx-auto">
                <div className="text-yellow-500 text-6xl mb-4">⚠️</div>
                <h2 className="text-xl font-semibold text-gray-800 mb-2">
                  {error || "No Event Data Available"}
                </h2>
                <button
                  onClick={() => fetchScannerMachine()}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                >
                  Reload
                </button>
              </div>
            </div>
          );
        }
        return <MediaButton eventData={eventData} event_slug={event_slug} />;
      default:
        return <ScannerLogin scannerList={scannerList} userLogin={(data) => setStep(data)} />;
    }
  };

  return (
    <>
      <div className="content-center min-h-svh">{renderStep()}</div>
    </>
  );
}

export default ScannerLayout;
