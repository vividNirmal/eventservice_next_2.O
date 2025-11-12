"use client"
import { Button } from "@/components/ui/button"
import { ChevronRight } from "lucide-react"
import { getCurrencySymbol } from "../../eventAdminpages/package/addPackage";
import { Badge } from "@/components/ui/badge";

// Event Attendees Card (first image layout)
export function EventAttendeesCard({
  title,
  description,
  onApply,
}) {
  return (
    <div className="group relative bg-white border border-solid border-blue-500 rounded-lg p-6 shadow-md overflow-hidden cursor-pointer transition-all duration-200 ease-in hover:shadow-xl hover:-translate-y-1" onClick={onApply}>
      {/* Decorative gold line on the right */}
      <div className="absolute z-2 inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-br from-blue-400/10 via-transparent to-transparent transition-opacity duration-300" />
      <div className="relative z-10">
        <Button className="!size-12 mb-4 shadow-none group-hover:bg-blue-500 hover:bg-blue-500 bg-white border-blue-500 hover:text-white gap-2 transition-all duration-200 ease-in">
          <ChevronRight className="size-8 group-hover:text-white text-blue-500 transition-all duration-200 ease-in" />
        </Button>
        <h3 className="text-xl mb-2 font-bold text-zinc-900">{title}</h3>
        <p className="flex items-start gap-2 text-sm leading-relaxed text-zinc-600">{description}</p>

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
    <div className="relative group bg-white rounded-lg p-4 border border-solid border-orange-400 shadow-md overflow-hidden hover:shadow-lg transition-all duration-300">
      <div className="absolute inset-0 bg-gradient-to-br from-orange-400/10 via-transparent to-transparent transition-opacity duration-300" />
      <div className="space-y-4 relative z-10">
        <h3 className="text-xl font-bold text-foreground mb-2">{category.title}</h3>
        <div className="flex items-start gap-2 text-sm text-zinc-700">
          <span className="inline-flex items-center justify-center shrink-0 size-8 bg-orange-400/10 text-orange-400 rounded-full font-semibold">{eventCount}</span>
          <span>{eventCount === 1 ? "Event" : "Events"} Available</span>
        </div>
        <div className="pt-4 border-t border-gray-200">
          <Button onClick={onApply} className="!text-white hover:bg-orange-400 bg-orange-400 border-orange-400 shadow-[0_0_0_4px_rgba(255,137,4,0.2)] gap-2">
            View Events 
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

// Keep your existing ExhibitorCard component
export function ExhibitorCard({ title, description, price, onBuyNow, currency,dateRange }) {
  const currentCurrencySymbol = getCurrencySymbol(currency || 'INR');
  return (
    <div className="overflow-hidden relative h-full bg-zinc-50 backdrop-shadow rounded-lg border-b-4 pb-4 border-solid border-blue-500 flex flex-col justify-center text-center">
      <img src="/banner-img1.webp" className="rounded-t-lg w-full h-42 max-w-full object-cover object-center" alt="ticket img" />
      <div className="p-4 flex flex-col items-center justify-center min-h-44 gap-2 text-sm text-center text-muted-foreground border-b-2 border-dashed border-gray-300 mb-2 pb-2 relative before:size-6 before:absolute before:bottom-0 before:translate-y-1/2 before:rounded-full before:-left-3 before:bg-white after:size-6 after:absolute after:bottom-0 after:translate-y-1/2 after:rounded-full after:-right-3 after:bg-white">
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