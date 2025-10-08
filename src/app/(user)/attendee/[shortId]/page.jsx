"use client";

import { useEffect, useState, Suspense } from "react";
import { useParams } from "next/navigation";
import { userGetRequest } from "@/service/viewService";
import Attendence from "@/components/page/attendence/attendence";

function CleanAttendeeContent() {
  const params = useParams();
  const shortId = params.shortId;
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isResolved, setIsResolved] = useState(false);

  useEffect(() => {
    const resolveDeviceUrl = async () => {
      try {
        if (!shortId) {
          setError("No shortId provided");
          setIsLoading(false);
          return;
        }
        
        
        // Call the backend to resolve the shortId (using userGetRequest for public access)
        const response = await userGetRequest(`resolve-device-url/${shortId}`);
        
        if (response.status === "success" || response.status == 1) {
          const { key, event_slug } = response.data;
          
          // Store in localStorage for the Attendence component to use
          localStorage.setItem("tempAttendanceKey", key);
          localStorage.setItem("tempAttendanceEventSlug", event_slug);
          
          console.log("Device URL resolved successfully:", { key, event_slug });
          setIsResolved(true);
        } else {
          console.error("Failed to resolve device URL:", response.message);
          setError("Invalid or expired device URL");
        }
      } catch (error) {
        console.error("Error resolving device URL:", error);
        setError("Failed to resolve device URL");
      } finally {
        setIsLoading(false);
      }
    };

    resolveDeviceUrl();
  }, [shortId]);

  if (isLoading) {
    return (
      <div className="h-svh flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading check-in page...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-svh flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Error</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!isResolved) {
    return (
      <div className="h-svh flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Invalid URL</h2>
          <p className="text-gray-600">Unable to resolve device URL</p>
        </div>
      </div>
    );
  }

  // Render the Attendence component - it will read from localStorage
  return <Attendence />;
}

export default function DeviceRedirectPage() {
  return (
    <Suspense fallback={
      <div className="h-svh flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <CleanAttendeeContent />
    </Suspense>
  );
}
