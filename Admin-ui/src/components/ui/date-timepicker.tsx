"use client"

import * as React from "react"
import { ChevronDownIcon } from "lucide-react"

import Button  from "@/components/ui/button"
import {Calendar}  from "@/components/ui/calendar"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"

export function DateTimePicker({ value, onChange }: {
  value?: Date
  onChange?: (value: Date | undefined) => void
}) {
  const [open, setOpen] = React.useState(false)
  const [date, setDate] = React.useState<Date | undefined>(value)
  const [time, setTime] = React.useState<string>("")

  // combine date + time into final Date object
  React.useEffect(() => {
    if (!date || !time) return

    const [h, m] = time.split(":")
    const finalDate = new Date(date)
    finalDate.setHours(Number(h))
    finalDate.setMinutes(Number(m))
    finalDate.setSeconds(0)

    onChange?.(finalDate)
  }, [date, time])

  return (
    <div className="flex flex-col gap-2 w-full">
      <Label className="px-1">Date & Time</Label>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-56 justify-between font-normal"
          >
            {date && time
              ? `${date.toLocaleDateString()} ${time}`
              : "Select date & time"}
            <ChevronDownIcon className="ml-2" />
          </Button>
        </PopoverTrigger>

        <PopoverContent
          className="w-auto p-3 flex gap-4"
          align="start"
        >
          {/* CALENDAR */}
          <Calendar
            mode="single"
            selected={date}
            onSelect={(d) => setDate(d)}
            captionLayout="dropdown"
          />

          {/* TIME SELECT */}
          <div className="flex flex-col gap-2 w-32">
            <Label className="text-xs px-1">Time</Label>

            <Select onValueChange={(val) => setTime(val)}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Select" />
              </SelectTrigger>

              <SelectContent className="max-h-60">
                {generateTimes().map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}

// helper → generates 24h time list (HH:MM)
function generateTimes() {
  const result: string[] = []
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 30) {
      const hh = h.toString().padStart(2, "0")
      const mm = m.toString().padStart(2, "0")
      result.push(`${hh}:${mm}`)
    }
  }
  return result
}
