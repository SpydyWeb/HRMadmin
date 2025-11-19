import { useEffect, useState } from "react";
import { Calendar as CalendarIcon } from "lucide-react";
import { useLocalizedDate } from "@/utils/date";
import { FieldError } from "./field-error";
import { useFieldContext } from "."; 

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { Calendar } from "@/components/ui/calendar";

interface Props {
  label: string;
  value?: string;
  onChange?: (value: string) => void;
  readOnly?: boolean;
}

export function FloatedDateTimeField({
  label,
  value,
  onChange,
  readOnly = false,
}: Props) {
  const { formatDate, formatTime } = useLocalizedDate();
  
  let field;
  try {
    field = useFieldContext<string>();
  } catch {
    field = null;
  }

  const [open, setOpen] = useState(false);
  const [date, setDate] = useState<Date | undefined>();
  const [time, setTime] = useState("");

  useEffect(() => {
    const currentValue = field ? field.state.value : value;
    
    if (!currentValue) {
      setDate(undefined);
      setTime("");
      return;
    }

    try {
      const d = new Date(currentValue);
      if (isNaN(d.getTime())) {
        console.warn("Invalid date value passed to FloatedDateTimeField:", currentValue);
        setDate(undefined);
        setTime("");
        return;
      }

      setDate(d);
      const hh = String(d.getHours()).padStart(2, "0");
      const mm = String(d.getMinutes()).padStart(2, "0");
      setTime(`${hh}:${mm}`);
    } catch (error) {
      console.error("Error parsing date:", error);
      setDate(undefined);
      setTime("");
    }
  }, [field?.state.value, value]); 

  useEffect(() => {
    if (!date || !time) {
      return;
    }

    const [h, m] = time.split(":");
    const final = new Date(date);
    final.setHours(Number(h));
    final.setMinutes(Number(m));
    final.setSeconds(0);

    const isoString = final.toISOString();

    if (field) {
      field.handleChange(isoString);
    } else {
      onChange?.(isoString);
    }
  }, [date, time, field, onChange]); 

  const displayValue = date
    ? `${formatDate(date)} , ${formatTime(date)}`
    : "";

  return (
    <div className="relative w-full pt-3">
      <div className="relative">
        <input
          readOnly
          value={displayValue}
          placeholder=" "
          onClick={() => !readOnly && setOpen(true)}
          className={`
            peer w-full border-0 border-b-1 rounded-none bg-transparent
             pt-4 text-orange-400
            focus:outline-none focus:ring-0
            ${
              readOnly
                ? "cursor-not-allowed text-orange-400 border-gray-400"
                : "cursor-pointer border-gray-400"
            }
          `}
        />

        {!readOnly && (
          <CalendarIcon
            className="absolute right-0 top-4 h-5 w-5 text-gray-400 cursor-pointer"
            onClick={() => setOpen(prev => !prev)}
          />
        )}
      </div>

      <label
        className={`
          absolute left-0 transition-all duration-200 pointer-events-none
          ${
            displayValue
              ? "top-0 text-xs text-black-600"
              : "top-4 text-sm text-gray-600"
          }
          peer-focus:top-0 peer-focus:text-xs peer-focus:text-black-600
        `}
      >
        {label}
      </label>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <div></div>
        </PopoverTrigger>

        <PopoverContent className="w-auto p-0" align="start">
          {/* Changed to flex layout: calendar and time side by side */}
          <div className="flex flex-col sm:flex-row">
            {/* Calendar section with custom styling */}
            <div className="p-2">
              {/* <Calendar
                mode="single"
                selected={date}
                onSelect={(d) => {
                  setDate(d || undefined);
                  setOpen(false); 
                }}
                captionLayout="dropdown"
                classNames={{
                  months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                  month: "space-y-2",
                  caption: "flex justify-center pt-1 relative items-center",
                  caption_label: "text-sm font-medium",
                  caption_dropdowns: "flex justify-center gap-1",
                  // nav: "space-x-1 flex items-center",
                  // nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 inline-flex items-center justify-center",
                  // nav_button_previous: "absolute left-1",
                  // nav_button_next: "absolute right-1",
                  table: "w-full border-collapse space-y-1",
                  head_row: "flex",
                  head_cell: "text-muted-foreground rounded-md w-8 font-normal text-[0.8rem]",
                  row: "flex w-full mt-1",
                  cell: "text-center text-sm p-0 relative [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                  day: "h-8 w-8 p-0 font-normal aria-selected:opacity-100 hover:bg-accent hover:text-accent-foreground rounded-md",
                  day_selected: "bg-orange-500 text-white hover:bg-orange-600 hover:text-white focus:bg-orange-500 focus:text-white",
                  day_today: "bg-accent text-accent-foreground",
                  day_outside: "text-muted-foreground opacity-50",
                  day_disabled: "text-muted-foreground opacity-50",
                  day_hidden: "invisible",
                }}
                
              /> */}
              <div className="p-2">
  <Calendar
    mode="single"
    selected={date}
    captionLayout="dropdown"
    onSelect={(d) => {
      setDate(d || undefined)
      setOpen(false)
    }}
    className="p-2"
    classNames={{
      months: "flex flex-col space-y-4",
      month: "space-y-2",
      caption: "flex justify-between items-center px-2",
      caption_label: "text-sm font-medium",
      caption_dropdowns: "flex gap-1 items-center",
      table: "w-full border-collapse",
      head_row: "flex",
      head_cell: "w-8 text-xs text-muted-foreground",
      row: "flex",
      cell: "relative p-0 w-8 h-8 text-center",
      day: "h-8 w-8 rounded hover:bg-accent hover:text-accent-foreground",
      day_selected:
        "h-8 w-8 rounded bg-orange-500 text-white hover:bg-orange-600",
    }}
  />
</div>

            </div>

            {/* Time selector section with scroll area */}
            <div className="border-t sm:border-t-0 sm:border-l">
              <div className="p-3 w-full sm:w-28">
                <label className="text-xs font-medium mb-2 block">Select Time</label>
                
                {/* Scrollable time list - smaller */}
                <div className="max-h-[220px] overflow-y-auto overflow-x-hidden pr-1">
                  <div className="space-y-0.5">
                    {generateTimes().map((t) => (
                      <button
                        key={t}
                        onClick={() => {
                          setTime(t);
                          setOpen(false);
                        }}
                        className={`
                          w-full text-left px-2 py-1.5 rounded text-xs transition-colors
                          ${time === t 
                            ? 'bg-orange-500 text-white hover:bg-orange-600' 
                            : 'hover:bg-gray-100'
                          }
                        `}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
      
      {field && <FieldError field={field.state.meta} />}
    </div>
  );
}

function generateTimes() {
  const items: string[] = [];
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 30) {
      items.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
    }
  }
  return items;
}