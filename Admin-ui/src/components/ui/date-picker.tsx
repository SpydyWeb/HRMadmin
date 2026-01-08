import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import Button from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { convertUTCStringToLocalDate } from "../../utils/date";

interface DatePickerProps {
  value?: string | Date | null;
  onChange?: (value: string | null) => void;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  id?: string;
  icon?: string;
}

export default function DatePicker({
  value,
  onChange,
  label,
  placeholder = "Pick a date",
  disabled = false,
  id,
  icon,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);
  const [date, setDate] = React.useState<Date | undefined>();
  const [currentMonth, setCurrentMonth] = React.useState<Date>(new Date());

  React.useEffect(() => {
    if (!value) {
      setDate(undefined);
      return;
    }
    if (value instanceof Date) {
      setDate(value);
      setCurrentMonth(value);
    } else if (typeof value === "string") {
      const localDate = convertUTCStringToLocalDate(value);
      if (localDate) {
        setDate(localDate);
        setCurrentMonth(localDate);
      }
    }
  }, [value]);

  const handleSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate);
    setOpen(false); 

    if (selectedDate) {
      onChange?.(format(selectedDate, "dd LLL yyyy"));
    } else {
      onChange?.(null);
    }
  };

  const handlePreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const handleYearChange = (year: number) => {
    setCurrentMonth(new Date(year, currentMonth.getMonth(), 1));
  };

  const handleMonthChange = (month: number) => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), month, 1));
  };

  // Generate years for dropdown (current year ± 10)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 21 }, (_, i) => currentYear - 10 + i);
  
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  return (
    <div className="w-full relative">
      {label && <Label htmlFor={id} className="!mb-1 bg-red block">{label}</Label>}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild={false}>
          <button
            type="button"
            id={id}
            disabled={disabled}
            onClick={() => setOpen(!open)}
            className={cn(
              "w-full  input-text flex items-center px-3  py-1 h-10 gap-2 font-normal",
              "justify-start text-left border border-gray-400 shadow-none rounded-md bg-white",
              "hover:bg-white focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-300"
            )}
          >
            <span className={cn(disabled ? "text-black-500 !input-text" : "!input-text text-black-500"
  )}>
              {date ? format(date, "dd LLL yyyy") : placeholder}
            </span>
            <CalendarIcon className="h-4 w-4 ml-auto" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0 z-50" align="start" sideOffset={5}>
          <div className="bg-white rounded-md shadow-lg border border-gray-200 p-3">
            <div className="flex items-center justify-between mb-2 px-1">
              <button
                type="button"
                onClick={handlePreviousMonth}
                className="p-1 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              
              <div className="flex items-center gap-1">
                <select
                  value={currentMonth.getMonth()}
                  onChange={(e) => handleMonthChange(Number(e.target.value))}
                  className="border-none rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  {months.map((month, index) => (
                    <option key={month} value={index}>{month}</option>
                  ))}
                </select>
                
                <select
                  value={currentMonth.getFullYear()}
                  onChange={(e) => handleYearChange(Number(e.target.value))}
                  className="border-none rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  {years.map((year) => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
              
              <button
                type="button"
                onClick={handleNextMonth}
                className="p-1 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
            
            <Calendar
              mode="single"
              selected={date}
              onSelect={handleSelect}
              month={currentMonth}
              onMonthChange={setCurrentMonth}
              className="rounded-md border-none"
              classNames={{
                months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                month: "space-y-4",
                caption: "hidden", 
                nav: "hidden", 
                table: "w-full space-y-1",
                head_row: "flex",
                head_cell: "text-gray-500 rounded-md w-9 font-normal text-[0.8rem]",
                row: "flex w-full mt-2",
                cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected].day-outside)]:text-accent-foreground [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                day: "h-9 w-9 p-6 font-normal aria-selected:opacity-100 hover:bg-gray-100 rounded-md",
                day_range_end: "day-range-end",
                day_selected: "bg-orange-500 text-white hover:bg-orange-600 hover:text-white focus:bg-orange-500 focus:text-white",
                day_today: "bg-gray-100 text-gray-900",
                day_outside: "text-gray-400 opacity-50 aria-selected:bg-accent/50 aria-selected:text-accent-foreground aria-selected:opacity-30",
                day_disabled: "text-gray-400 opacity-50",
                day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
                day_hidden: "invisible",
              }}
            />
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}