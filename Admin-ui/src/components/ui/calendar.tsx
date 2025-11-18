import * as React from "react"
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react"
import { DayButton, DayPicker, getDefaultClassNames } from "react-day-picker"

import { cn } from "@/lib/utils"
import Button from "@/components/ui/button"

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout = "label",
  formatters,
  components,
  ...props
}: React.ComponentProps<typeof DayPicker>) {
  const defaultClassNames = getDefaultClassNames()

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn(
        "bg-white group/calendar p-3 [--cell-size:--spacing(8)] [[data-slot=card-content]_&]:bg-transparent [[data-slot=popover-content]_&]:bg-transparent dark:bg-neutral-950",
        String.raw`rtl:**:[.rdp-button_next>svg]:rotate-180`,
        String.raw`rtl:**:[.rdp-button_previous>svg]:rotate-180`,
        className
      )}
      captionLayout={captionLayout}
      formatters={{
        formatMonthDropdown: (date) =>
          date.toLocaleString("default", { month: "long" }),
        ...formatters,
      }}
      classNames={{
        root: cn("w-fit", defaultClassNames.root),
        months: cn("flex gap-4  relative", defaultClassNames.months),
        month: cn("flex  w-full gap-4", defaultClassNames.month),
        nav: cn(
          "flex items-center gap-1 w-full absolute top-0 inset-x-0 justify-between",
          defaultClassNames.nav
        ),

        // 🔥 now using your Button styles directly
        button_previous: cn(
          "size-(--cell-size) p-0 select-none",
          defaultClassNames.button_previous
        ),
        button_next: cn(
          "size-(--cell-size) p-0 select-none",
          defaultClassNames.button_next
        ),

        month_caption: cn(
          "flex items-center justify-center h-(--cell-size) w-full px-(--cell-size)",
          defaultClassNames.month_caption
        ),
        dropdowns: cn(
          "w-full flex items-center text-sm font-medium justify-center h-(--cell-size) [--cell-size:2.75rem] gap-1.5",
          defaultClassNames.dropdowns
        ),
        dropdown_root: cn(
          "relative border border-neutral-200 shadow-xs rounded-md has-focus:border-neutral-950 has-focus:ring-neutral-950/50 has-focus:ring-[3px] dark:border-neutral-800 dark:has-focus:border-neutral-300 dark:has-focus:ring-neutral-300/50",
          defaultClassNames.dropdown_root
        ),
        dropdown: cn(
          "absolute bg-white inset-0 opacity-0 dark:bg-neutral-950",
          defaultClassNames.dropdown
        ),
        caption_label: cn(
          "select-none font-medium",
          captionLayout === "label"
            ? "text-sm"
            : "rounded-md pl-2 pr-1 flex items-center gap-1 text-sm h-8 [&>svg]:text-neutral-500 [&>svg]:size-3.5 dark:[&>svg]:text-neutral-400",
          defaultClassNames.caption_label
        ),
        table: "w-full border-collapse",
        weekdays: cn("flex", defaultClassNames.weekdays),
        weekday: cn(
          "text-neutral-500 rounded-md flex-1 font-normal text-[0.8rem] select-none dark:text-neutral-400",
          defaultClassNames.weekday
        ),
        week: cn("flex w-full mt-2", defaultClassNames.week),
        week_number_header: cn("select-none w-(--cell-size)", defaultClassNames.week_number_header),
        week_number: cn(
          "text-[0.8rem] select-none text-neutral-500 dark:text-neutral-400",
          defaultClassNames.week_number
        ),
        day: cn(
          "relative w-full h-full p-0 text-center group/day aspect-square select-none",
          props.showWeekNumber
            ? "[&:nth-child(2)[data-selected=true]_button]:rounded-l-md"
            : "[&:first-child[data-selected=true]_button]:rounded-l-md",
          defaultClassNames.day
        ),

        range_start: cn("rounded-l-md bg-neutral-100 dark:bg-neutral-800", defaultClassNames.range_start),
        range_middle: cn("rounded-none", defaultClassNames.range_middle),
        range_end: cn("rounded-r-md bg-neutral-100 dark:bg-neutral-800", defaultClassNames.range_end),

        today: cn(
          "bg-neutral-100 text-neutral-900 rounded-md data-[selected=true]:rounded-none dark:bg-neutral-800 dark:text-neutral-50",
          defaultClassNames.today
        ),
        outside: cn(
          "text-neutral-500 aria-selected:text-neutral-500 dark:text-neutral-400 dark:aria-selected:text-neutral-400",
          defaultClassNames.outside
        ),
        disabled: cn("text-neutral-500 opacity-50 dark:text-neutral-400", defaultClassNames.disabled),
        hidden: cn("invisible", defaultClassNames.hidden),

        ...classNames,
      }}
      components={{
        Root: ({ className, rootRef, ...props }) => (
          <div data-slot="calendar" ref={rootRef} className={cn(className)} {...props} />
        ),

        // 🔥 your custom Button for nav
        // Nav: ({ onNextClick, onPreviousClick }) => (
        //   <div className="flex w-full items-center justify-between">
        //     <Button onClick={onPreviousClick} size="sm" variant="outline">
        //       <ChevronLeftIcon className="size-4" />
        //     </Button>
        //     <Button onClick={onNextClick} size="sm" variant="outline">
        //       <ChevronRightIcon className="size-4" />
        //     </Button>
        //   </div>
        // ),

        Chevron: ({ className, orientation, ...props }) => {
          if (orientation === "left")
            return <ChevronLeftIcon className={cn("size-4", className)} {...props} />
          if (orientation === "right")
            return <ChevronRightIcon className={cn("size-4", className)} {...props} />
          return <ChevronDownIcon className={cn("size-4", className)} {...props} />
        },

        DayButton: CalendarDayButton,

        WeekNumber: ({ children, ...props }) => (
          <td {...props}>
            <div className="flex size-(--cell-size) items-center justify-center text-center">
              {children}
            </div>
          </td>
        ),

        ...components,
      }}
      {...props}
    />
  )
}

function CalendarDayButton({ className, day, modifiers, ...props }: React.ComponentProps<typeof DayButton>) {
  const ref = React.useRef<HTMLButtonElement>(null)

  React.useEffect(() => {
    if (modifiers.focused) ref.current?.focus()
  }, [modifiers.focused])
  
  return (
    <button
      ref={ref}
      // variant="ghost"
      // size="sm"
      data-day={day.date.toLocaleDateString()}
      className={cn(
        "flex aspect-square w-full min-w-(--cell-size)  gap-1 text-xs",
        className
      )}
      {...props}
    />
  )
}

export { Calendar, CalendarDayButton }
