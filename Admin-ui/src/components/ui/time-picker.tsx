// components/ui/time-picker.tsx
import React from "react"
import { Input } from "@/components/ui/input"

export function TimePicker({ value, onChange }) {
  return (
    <Input
      type="time"
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      className="w-full"
    />
  )
}
