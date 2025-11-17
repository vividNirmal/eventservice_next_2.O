"use client"
import { Button } from "@/components/ui/button"
import { ChevronRight } from "lucide-react"
import { getCurrencySymbol } from "../../eventAdminpages/package/addPackage";
import { Badge } from "@/components/ui/badge";

// Event Attendees Card (first image layout)
export function EventAttendeesCard({
  title,
  description,
  date_time,
  onApply,
}) {
  return (
    <div className="group relative bg-white border border-solid border-blue-500 rounded-lg p-5 shadow-md overflow-hidden cursor-pointer transition-all duration-200 ease-in hover:shadow-xl hover:-translate-y-1" onClick={onApply}>
      {/* Decorative gold line on the right */}
      <div className="absolute z-2 inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-br from-blue-400/10 via-transparent to-transparent transition-opacity duration-300" />
      <div className="relative z-10">
        <Button className="!size-12 mb-4 shadow-none group-hover:bg-blue-500 hover:bg-blue-500 bg-white border-blue-500 hover:text-white gap-2 transition-all duration-200 ease-in">
          <ChevronRight className="size-8 group-hover:text-white text-blue-500 transition-all duration-200 ease-in" />
        </Button>
        <h3 className="text-xl mb-2 font-bold text-zinc-900">{title}</h3>
        <p className="flex items-start gap-2 text-sm leading-relaxed text-zinc-600">{description}</p>
        <p className="flex items-start gap-1 text-sm leading-relaxed text-zinc-600 mt-2"><b>Event Time :</b> {`${date_time[0].startDate}  ${date_time[0].startTime}`} <b>to</b> {`${date_time[0].endDate}  ${date_time[0].endTime}`}</p>
        
        {/* <Button onClick={onApply} className="mt-4 bg-orange-400 border-orange-400 hover:text-white hover:bg-orange-400 hover:border-orange-400 gap-2">
          Details
          <ChevronRight className="w-4 h-4" />
        </Button> */}
      </div>
    </div>
  )
}

// Exhibitor Card (second image layout)
export function CategoryCard({ category, eventCount, onApply , status }) {    
  return (
    <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-slate-100 hover:border-blue-200 hover:scale-105 p-6 space-y-6">
      {/* Header with Title */}
      <h3 className="text-2xl font-bold text-slate-900 mb-2">{category.title}</h3>

      {/* Status Badge */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100 flex items-center gap-3">
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-sm">{eventCount}</div>
        <p className="text-sm font-medium text-slate-700">{eventCount === 1 ? "Event" : "Events"} Available</p>
      </div>

      {/* CTA Button */}
      <button onClick={onApply} className="cursor-pointer w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg">
        <span>View Events</span>
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}

// Keep your existing ExhibitorCard component
export function ExhibitorCard({ title, description, price, onBuyNow, currency,dateRange }) {
  const currentCurrencySymbol = getCurrencySymbol(currency || 'INR');
  return (
    <div className="overflow-hidden relative h-full bg-white backdrop-shadow rounded-lg border-b-4 pb-4 border-solid border-blue-500 flex flex-col justify-center text-center group translate-y-0 hover:-translate-y-1 transition-all duration-300 ease-linear">
      <img src="/banner-img1.webp" className="rounded-t-lg w-full h-42 max-w-full object-cover object-center" alt="ticket img" />
      <div className="p-4 flex flex-col items-center justify-center min-h-44 gap-2 text-sm text-center text-muted-foreground border-b-2 border-dashed border-gray-300 mb-2 pb-2 relative before:size-6 before:absolute before:bottom-0 before:translate-y-1/2 before:rounded-full before:-left-3 before:bg-[#F5F6FA] after:size-6 after:absolute after:bottom-0 after:translate-y-1/2 after:rounded-full after:-right-3 after:bg-[#F5F6FA]">
        <h4 className="text-base lg:text-lg xl:text-xl font-bold text-foreground mb-0">{title}</h4>
        <div className="flex flex-row gap-2">
          <span className="text-xs lg:text-sm xl:text-base text-blue-500">✓</span>
          <span className="text-xs lg:text-sm xl:text-base">{description}</span>
        </div>
        {
          dateRange && dateRange.map((date,index)=>(
            <span key={index} className="block"><b>Date</b> : <span>{date?.startDate} - {date?.endDate} </span></span>
          ))
        }
      </div>
      <Button onClick={onBuyNow} className="min-w-30 w-auto mx-auto text-white hover:text-white bg-blue-500 border border-solid border-blue-500 hover:bg-blue-600 gap-2">
        { `${currentCurrencySymbol} ${price}`}
        <ChevronRight className="w-4 h-4" />
      </Button>
    </div>
  );
}