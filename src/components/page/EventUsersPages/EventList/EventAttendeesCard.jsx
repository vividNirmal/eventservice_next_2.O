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
    <div className="relative bg-white rounded-lg p-6 shadow-md overflow-hidden">
      {/* Decorative gold line on the right */}
      <div className="absolute right-0 top-0 w-1 h-full bg-gradient-to-b from-amber-400 to-transparent opacity-30" />

      <div className="space-y-3">
        <h3 className="text-lg font-bold text-foreground">{title}</h3>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="text-amber-400">✓</span>
          <span>{description}</span>
        </div>

        <Button onClick={onApply} className="mt-4 bg-foreground text-primary-foreground hover:bg-foreground/90 gap-2">
          Apply Now
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}

// Exhibitor Card (second image layout)
export function CategoryCard({ category, eventCount, onApply , status }) {    
  return (
    <div className="relative bg-white rounded-lg p-4 border border-solid border-blue-300 hover:border-blue-500 shadow-md overflow-hidden hover:shadow-lg transition-all duration-300">
      <div className="space-y-4 relative z-10">
        <div>
          <h3 className="text-xl font-bold text-foreground mb-2">{category.title} <Badge variant="secondary" className={"bg-green-500 text-white dark:bg-green-600 ml-2"}>{status?"Active":"Unactive"}</Badge></h3>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="inline-flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full font-semibold">{eventCount}</span>
            <span>{eventCount === 1 ? "Event" : "Events"} Available</span>
          </div>
        </div>
        <div className="pt-4 border-t border-gray-200">
          <Button onClick={onApply} className="w-full bg-blue-600 !text-white hover:bg-blue-700 gap-2">
            View Events 
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

// Keep your existing ExhibitorCard component
export function ExhibitorCard({ title, description, price, onBuyNow, currency }) {
  const currentCurrencySymbol = getCurrencySymbol(currency || 'INR');
  return (
    <div className="relative bg-white rounded-lg p-4 shadow-md overflow-hidden border-l-4 border-solid border-blue-600">
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
        <div className="md:grow md:w-fit">
          <h3 className="text-base lg:text-lg xl:text-xl font-bold text-foreground mb-0">{title}</h3>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="text-xs lg:text-sm xl:text-base text-amber-400">✓</span>
            <span className="text-xs lg:text-sm xl:text-base">{description}</span>
          </div>
        </div>
        <div className="flex items-center w-fit">          
          <Button onClick={onBuyNow} className="bg-amber-400 border bordr-solid border-amber-400 text-foreground hover:bg-amber-500 gap-2 ml-auto">
            { `${currentCurrencySymbol} ${price}`}
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}