import * as React from "react"

import { cn } from "@/lib/utils"

function Input({
  className,
  type,
  id,
  ...props
}) {
  return (
    (<input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex w-full min-w-0 rounded-md border border-solid bg-transparent px-3 2xl:px-4 py-1.5 2xl:py-2 text-xs lg:text-sm shadow-xs transition-[color,box-shadow] outline-none h-9 2xl:h-10 file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-xs file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        // "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
        "focus-visible:border-ring focus-visible:ring-ring/50",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        className
      )}
      {...props} />)
  );
}

export { Input }
