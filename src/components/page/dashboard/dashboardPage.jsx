"use client";

import { useRouter } from "next/navigation";
import React, { useEffect } from "react";

const DashboardPage = () => {   
  const router = useRouter();
  useEffect(()=>{
    const token = localStorage.getItem("token");
    if(token){
      router.replace("/dashboard/event-host");
    }else{
      router.replace("/dashboard/login");
    }
  },[])
  return (
    <section className="w-full flex flex-wrap items-start gap-6 p-4 h-full max-h-full">
      <div className="flex flex-wrap gap-3.5 2xl:gap-6 w-3/4 flex-grow">
        
        {/* Event List */}
        <div className="flex flex-wrap items-center gap-2.5 2xl:gap-4 w-[45%] xl:w-1/5 p-3.5 2xl:p-6 flex-grow bg-white border-l-4 border-solid border-orange-400 rounded-2xl 2xl:rounded-3xl shadow-[0_0_6px_0_rgba(0,0,0,0.12)]">
          <div className="w-12 h-12 2xl:w-16 2xl:h-16 p-2 bg-black rounded-full flex items-center justify-center font-semibold text-base 2xl:text-xl text-orange-400">
            07
          </div>
          <h2 className="text-base md:text-lg 2xl:text-xl leading-snug font-medium text-primaryBlue w-2/4 flex-grow">
            Event List
          </h2>
        </div>

        {/* User List */}
        <div className="flex flex-wrap items-center gap-2.5 2xl:gap-4 w-[45%] xl:w-1/5 p-3.5 2xl:p-6 flex-grow bg-white border-l-4 border-solid border-lime-400 rounded-2xl 2xl:rounded-3xl shadow-[0_0_6px_0_rgba(0,0,0,0.12)]">
          <div className="w-12 h-12 2xl:w-16 2xl:h-16 p-2 bg-black rounded-full flex items-center justify-center font-semibold text-base 2xl:text-xl text-lime-400">
            10+
          </div>
          <h2 className="text-base md:text-lg 2xl:text-xl leading-snug font-medium text-primaryBlue w-2/4 flex-grow">
            User List
          </h2>
        </div>

        {/* Email Template List */}
        <div className="flex flex-wrap items-center gap-2.5 2xl:gap-4 w-[45%] xl:w-1/5 p-3.5 2xl:p-6 flex-grow bg-white border-l-4 border-solid border-cyan-400 rounded-2xl 2xl:rounded-3xl shadow-[0_0_6px_0_rgba(0,0,0,0.12)]">
          <div className="w-12 h-12 2xl:w-16 2xl:h-16 p-2 bg-black rounded-full flex items-center justify-center font-semibold text-base 2xl:text-xl text-cyan-400">
            125+
          </div>
          <h2 className="text-base md:text-lg 2xl:text-xl leading-snug font-medium text-primaryBlue w-2/4 flex-grow">
            Email Template List
          </h2>
        </div>

        {/* Another Email Template List */}
        <div className="flex flex-wrap items-center gap-2.5 2xl:gap-4 w-[45%] xl:w-1/5 p-3.5 2xl:p-6 flex-grow bg-white border-l-4 border-solid border-primaryBlue rounded-2xl 2xl:rounded-3xl shadow-[0_0_6px_0_rgba(0,0,0,0.12)]">
          <div className="w-12 h-12 2xl:w-16 2xl:h-16 p-2 bg-black rounded-full flex items-center justify-center font-semibold text-base 2xl:text-xl text-white">
            25+
          </div>
          <h2 className="text-base md:text-lg 2xl:text-xl leading-snug font-medium text-primaryBlue w-2/4 flex-grow">
            Email Template List
          </h2>
        </div>

      </div>
    </section>
  );
};

export default DashboardPage;
