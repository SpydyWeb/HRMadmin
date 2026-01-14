import * as React from "react"

import { cn } from "@/lib/utils"

interface TextareaProps extends React.ComponentProps<"textarea"> {
  variant?: "default" | "white"
}

function Textarea({ className, variant='default', ...props }: TextareaProps) {
 
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "border-gray-400 placeholder:text-neutral-500 focus-visible:border-black focus-visible:ring-neutral-950/50 aria-invalid:ring-red-500/20 dark:aria-invalid:ring-red-500/40 aria-invalid:border-red-500 dark:bg-neutral-200/30 flex field-sizing-content min-h-16 w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:border-neutral-800 dark:placeholder:text-neutral-400 dark:focus-visible:border-neutral-300 dark:focus-visible:ring-neutral-300/50 dark:aria-invalid:ring-red-900/20 dark:dark:aria-invalid:ring-red-900/40 dark:aria-invalid:border-red-900 dark:dark:bg-neutral-800/30",
         // 👉 Variant styles
        variant === "white" && "!bg-white dark:bg-white input-text",

        className
      )}
      {...props}
    />
  )
}

export { Textarea }
