import Attendence from "@/components/page/attendence/attendence";
import React, { Suspense } from "react";

export default function page() {
  return(
    <Suspense fallback={
      <div className="h-svh flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <Attendence />
    </Suspense>
  ) ;
}
