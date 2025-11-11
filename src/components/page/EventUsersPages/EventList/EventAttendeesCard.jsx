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
    <div className="relative bg-white rounded-lg p-6 border-l-4 border-solid border-orange-400 shadow-md overflow-hidden">
      {/* Decorative gold line on the right */}
      <div className="absolute z-2 inset-0 bg-gradient-to-br from-orange-400/10 via-transparent to-transparent transition-opacity duration-300" />
      <div className="space-y-3 relative z-10">
        <h3 className="text-lg font-bold text-foreground">{title}</h3>

        <div className="flex items-start gap-2 text-sm text-muted-foreground">
          <span className="text-amber-400 shrink-0">✓</span>
          <span>{description}</span>
        </div>

        <Button onClick={onApply} className="mt-4 bg-orange-400 border-orange-400 hover:text-white hover:bg-orange-400 hover:border-orange-400 gap-2">
          Details
          <ChevronRight className="w-4 h-4" />
        </Button>
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
    <div className="relative bg-white rounded-lg p-4 shadow-md overflow-hidden border-l-4 border-solid border-blue-600">
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="md:grow md:w-fit">
          <h3 className="text-base lg:text-lg xl:text-xl font-bold text-foreground mb-0">{title}</h3>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="text-xs lg:text-sm xl:text-base text-blue-500">✓</span>
            <span className="text-xs lg:text-sm xl:text-base">{description}</span>
            {
              dateRange && dateRange.map((date,index)=>(
                <span key={index}>
                Data : <span>{date?.startDate} - {date?.endDate} </span>
                </span>
              ))
            }
          </div>
        </div>
        <div className="flex items-center w-fit">          
          <Button onClick={onBuyNow} className="text-white hover:text-white bg-blue-500 border border-solid border-blue-500 hover:bg-blue-600 gap-2 ml-auto">
            { `${currentCurrencySymbol} ${price}`}
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}