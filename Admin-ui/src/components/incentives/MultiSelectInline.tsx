import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"

export type Option = {
  id: number
  label: string
}

export function MultiSelectInline({
  options,
  placeholder = "Search...",
  onChange,
}: {
  options: Option[]
  placeholder?: string
  onChange?: (selectedIds: number[], selectedOptions: Option[]) => void
}) {
  const [input, setInput] = useState("")
  const [filteredOptions, setFilteredOptions] = useState<Option[]>([])
  const [selectedOptions, setSelectedOptions] = useState<Option[]>([])
  const [isFocused, setIsFocused] = useState(false)

  useEffect(() => {
    setFilteredOptions(options)
  }, [options])

  const handleChangeInput = (value: string) => {
    setInput(value)

    setFilteredOptions(
      options.filter(
        (opt) =>
          opt.label.toLowerCase().includes(value.toLowerCase()) &&
          !selectedOptions.some((s) => s.id === opt.id)
      )
    )
  }

  const addOption = (option: Option) => {
    setSelectedOptions((prev) => {
      if (prev.some((o) => o.id === option.id)) return prev

      const updated = [...prev, option]

      setFilteredOptions(
        options.filter((o) => !updated.some((s) => s.id === o.id))
      )

      // ✅ send selected IDs to parent
      onChange?.(
        updated.map((o) => o.id),
        updated
      )

      return updated
    })

    setInput("")
  }

  const removeOption = (option: Option) => {
    setSelectedOptions((prev) => {
      const updated = prev.filter((o) => o.id !== option.id)

      setFilteredOptions(
        options.filter((o) => !updated.some((s) => s.id === o.id))
      )

      // ✅ send updated IDs to parent
      onChange?.(
        updated.map((o) => o.id),
        updated
      )

      return updated
    })
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault()

      const values = input
        .split(",")
        .map((v) => v.trim())
        .filter(Boolean)

      values.forEach((val) => {
        const found = options.find(
          (o) => o.label.toLowerCase() === val.toLowerCase()
        )
        if (found) addOption(found)
      })
    }
  }

  return (
    <div className="relative w-full">
      
      {/* Input + Chips */}
      <div className="w-full min-h-[40px] max-h-[80px] overflow-y-auto rounded-md border border-neutral-300 px-3 py-2 text-sm flex items-center flex-wrap gap-2 focus-within:border-teal-500 focus-within:ring-1 focus-within:ring-teal-500">
        
        {selectedOptions.map((opt) => (
          <Badge
            key={opt.id}
            className="flex items-center gap-1 px-2 py-[2px] text-xs rounded bg-neutral-900 text-white"
          >
            {opt.label}
            <span
              className="cursor-pointer text-xs ml-1"
              onClick={() => removeOption(opt)}
            >
              ✕
            </span>
          </Badge>
        ))}

        <input
          value={input}
          onChange={(e) => handleChangeInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 150)}
          placeholder={placeholder}
          className="flex-1 min-w-[100px] h-5 text-sm outline-none bg-transparent"
        />
      </div>

      {/* Dropdown */}
      {isFocused && (
        <div className="absolute top-full left-0 mt-1 w-full z-50">
          <ScrollArea className="max-h-44 border rounded-md bg-white shadow-md">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => (
                <div
                  key={opt.id}
                  className="px-3 py-2 text-sm hover:bg-gray-100 cursor-pointer border-b"
                  onMouseDown={(e) => {
                    e.preventDefault()
                    addOption(opt)
                  }}
                >
                  {opt.label}
                </div>
              ))
            ) : (
              <p className="p-2 text-sm text-gray-400">No data found</p>
            )}
          </ScrollArea>
        </div>
      )}
    </div>
  )
}