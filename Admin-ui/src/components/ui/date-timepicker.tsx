// components/ui/datetime-picker.tsx
import React from "react"
import Button from "@/components/ui/button"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { TimePicker } from "@/components/ui/time-picker"
import { format } from "date-fns"

export function DateTimePicker({ value, onChange }) {
  const [open, setOpen] = React.useState(false)

  const date = value?.date ? new Date(value.date) : null
  const time = value?.time || ""

  function updateDate(d) {
    onChange({ date: d, time })
  }

  function updateTime(t) {
    onChange({ date, time: t })
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full justify-start">
          {date || time
            ? `${date ? format(date, "PPP") : ""} ${time ? time : ""}`
            : "Pick date & time"}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="p-3 flex flex-col gap-4">
        <Calendar
          mode="single"
          selected={date || undefined}
          onSelect={(d) => updateDate(d)}
        />

        <TimePicker value={time} onChange={updateTime} />
      </PopoverContent>
    </Popover>
  )
}
