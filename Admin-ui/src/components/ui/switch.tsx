import * as React from "react"
import * as SwitchPrimitive from "@radix-ui/react-switch"
import { cn } from "@/lib/utils"

function Switch({
  className,
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        // Base styling
        "peer inline-flex h-[1.5rem] w-10 shrink-0 cursor-pointer items-center rounded-full border border-neutral-300 shadow-xs transition-all outline-none",
        // Checked (ON) and unchecked (OFF) colors
        "data-[state=checked]:bg-blue-500 data-[state=unchecked]:bg-neutral-200",
        // Focus & disabled states
        "focus-visible:ring-[3px] focus-visible:ring-blue-500/40 focus-visible:border-blue-600 disabled:cursor-not-allowed disabled:opacity-50",
        // Dark mode
        "dark:data-[state=checked]:bg-neutral-50 dark:data-[state=unchecked]:bg-neutral-800 dark:border-neutral-700",
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          // Size & shape
          "block h-[1.1rem] w-[1.1rem] rounded-full bg-white shadow-md ring-0 transition-transform",
          // Motion
          "data-[state=checked]:translate-x-[calc(100%-2px)] data-[state=unchecked]:translate-x-[2px]",
          // Dark mode thumb
          "dark:bg-neutral-950"
        )}
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }
