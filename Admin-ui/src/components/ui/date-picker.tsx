// components/ui/date-picker.tsx
import * as React from "react"
import { format } from "date-fns"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import Button from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"

export function DatePicker({ value, onChange }) {
  const [open, setOpen] = React.useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-start text-left"
          onClick={() => setOpen(true)}
        >
          {value ? format(new Date(value), "PPP") : "Pick a date"}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="p-0">
        <Calendar
          mode="single"
          selected={value ? new Date(value) : undefined}
          onSelect={(d) => {
            onChange(d)
            setOpen(false)
          }}
        />
      </PopoverContent>
    </Popover>
  )
}
