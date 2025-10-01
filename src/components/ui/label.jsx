"use client"

import * as React from "react"
import * as LabelPrimitive from "@radix-ui/react-label"

import { cn } from "@/lib/utils"

function Label({
  className,
  htmlFor,
  ...props
}) {
  return (
    (<LabelPrimitive.Root
    htmlFor={htmlFor && htmlFor}
      data-slot="label"
      className={cn(
        "text-xs 2xl:text-base text-zinc-500 leading-none font-normal select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50 mb-1",
        className
      )}
      {...props} />)
  );
}

export { Label }
