"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import ScanningDevicesTabs from "@/components/page/event-host/ScanningDevicesTabs";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function ScanningDevicesEventPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params?.id;
  
  if (!eventId) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Event ID Required</h3>
              <p className="text-gray-500">Please select an event to view scanning devices.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">

        {/* Scanning Devices Tabs Component */}
        <ScanningDevicesTabs />
    </div>
  );
}