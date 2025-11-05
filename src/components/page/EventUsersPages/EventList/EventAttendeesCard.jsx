"use client"
import { Button } from "@/components/ui/button"
import { ChevronRight } from "lucide-react"

// Event Attendees Card (first image layout)
export function EventAttendeesCard({
  title,
  description,
  onApply,
}) {
  return (
    <div className="relative bg-white rounded-lg p-6 shadow-md overflow-hidden border-l-4 border-l-amber-400">
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
export function ExhibitorCard({
  title,
  description,
  price,
  onBuyNow,
}) {
  return (
    <div className="relative bg-white rounded-lg p-6 shadow-md overflow-hidden">
      {/* Decorative gold accent with diagonal stripes pattern */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-amber-400 to-amber-500 opacity-10 rounded-bl-3xl" />
      <div className="absolute top-2 right-2 w-20 h-20 border-2 border-amber-400/30 rounded-bl-2xl" />

      <div className="space-y-3 relative z-10">
        <h3 className="text-xl font-bold text-foreground">{title}</h3>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="text-amber-400">✓</span>
          <span>{description}</span>
        </div>

        <div className="flex items-center justify-between pt-4">
          <span className="text-sm text-muted-foreground">More Details</span>
          <Button onClick={onBuyNow} className="bg-amber-400 text-foreground hover:bg-amber-500 gap-2 ml-auto">
            {price}
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
