"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

const ScrollArea = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<"div">
>(function ScrollArea({ className, children, ...props }, ref) {
  return (
    <div
      ref={ref}
      data-slot="scroll-area"
      className={cn("relative overflow-hidden", className)}
      {...props}
    >
      <div
        data-slot="scroll-area-viewport"
        className="size-full overflow-auto rounded-[inherit] transition-[color,box-shadow] outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-1"
      >
        {children}
      </div>
    </div>
  )
})
ScrollArea.displayName = "ScrollArea"

function ScrollBar(props: React.ComponentProps<"div">) {
  void props;
  return null;
}

export { ScrollArea, ScrollBar }
