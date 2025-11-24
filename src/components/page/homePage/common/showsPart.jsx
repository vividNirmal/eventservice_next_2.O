"use client";
import { getRequest } from "@/service/viewService";
import {  Ticket } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export function ShowsSection({ company_id }) {
  const [showsData, setShowsData] = useState([]);
  useEffect(() => {
    fetchshows();
  }, []);
  async function fetchshows() {
    try {
      const responce = await getRequest(
        `get-event-category?companyId=${company_id}`
      );
      setShowsData(responce.data.eventCategories);
    } catch (error) {
      console.error("Error fetching shows:", error);
    }
  }
  return (
    <section className="py-8 md:py-12 xl:py-16 relative overflow-hidden">
      {/* Subtle texture overlay */}
      {/* <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div> */}

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-black">A Must Visit Shows</h2>
          <div className="w-24 h-1 bg-gradient-to-r from-[#1f75ff] to-[#61daff] mx-auto mt-4 rounded-full"></div>
        </div>

        <div className="flex flex-wrap justify-center gap-4 xl:gap-6">
          {showsData.map((item, index) => (
            <Link href={`/show-event/${item._id}`} key={index} className="max-w-1/2 w-1/3 grow sm:max-w-1/3 sm:w-1/4 lg:max-w-1/4 lg:w-1/6 group relative bg-background p-4 lg:p-6 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 rounded-lg border border-border/50 overflow-hidden cursor-pointer">
              {/* Hover gradient effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#1f75ff]/10 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300" />
              <div className="relative z-10 flex flex-col items-center text-center h-full">
                <div className={"mb-4 p-4 rounded-full bg-muted group-hover:bg-blue-500/10 transition-colors duration-300"}><Ticket/></div>
                <h3 className="text-sm md:text-base lg:text-lg font-bold uppercase tracking-wide group-hover:bg-gradient-to-r group-hover:from-[#1f75ff] group-hover:to-[#61daff] group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300 ease-linear">{item.title}</h3>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
