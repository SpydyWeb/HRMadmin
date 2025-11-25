import * as React from "react"
import { cn } from "@/lib/utils"

interface InputProps extends React.ComponentProps<"input"> {
  variant?: "outlined" | "filled" | "standard"| "custom"
}

function Login_Input({
  className,
  type,
  variant = "outlined",
  ...props
}: InputProps) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        // Base classes
        "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground flex h-9 w-full min-w-0 rounded-sm px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",

        // Outlined
        // variant === "outlined" &&
        //   "border border-gray-400 bg-transparent focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",

        variant === "outlined" &&
"border border-gray-300 bg-transparent h-10 text-[15px] rounded-md" &&
 "focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/30",

        // Filled
        variant === "filled" &&
          "bg-gray-100 dark:bg-zinc-800 border border-transparent focus-visible:border-ring focus-visible:ring-ring/40 focus-visible:ring-[3px]",

        // Standard (thick bottom line)
        variant === "standard" &&
          "border-0 border-b-[2px] border-gray-400 rounded-none px-1 pb-1 \
           focus-visible:border-b-[3px] focus-visible:border-b-ring focus-visible:ring-0",

        // Standard (thin bottom line)
        variant === "custom" &&
          "input-text font-poppins text-[24px] font-semibold text-black-500 border-none shadow-none rounded-none px-1 pb-1 \ text-black-500 focus-visible:border-b-[3px] focus-visible:border-b-ring focus-visible:ring-0",

        // Error state
        "aria-invalid:ring-destructive/20 aria-invalid:border-destructive dark:aria-invalid:ring-destructive/40",

        className
      )}
      {...props}
    />
  )
}

export { Login_Input  }
