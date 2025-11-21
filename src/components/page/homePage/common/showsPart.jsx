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
    <section className="py-16 bg-muted/30 relative overflow-hidden">
      {/* Subtle texture overlay */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight uppercase">
            A Must Visit Shows
          </h2>
          <div className="w-24 h-1 bg-primary mx-auto mt-4 rounded-full"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {showsData.map((item, index) => (
            <Link
                href={`/show-event/${item._id}`}
              key={index}
              className="group relative bg-background p-6 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1  rounded-lg border border-border/50 overflow-hidden cursor-pointer"
            >
              {/* Hover gradient effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              <div className="relative z-10 flex flex-col items-center text-center h-full">
                <div
                  className={`mb-4 p-4 rounded-full bg-muted group-hover:bg-background transition-colors duration-300 `}
                ><Ticket/></div>

                <h3 className="text-lg font-bold mb-2 uppercase tracking-wide group-hover:text-primary transition-colors">
                  {item.title}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
