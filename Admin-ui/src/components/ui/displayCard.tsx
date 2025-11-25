// components/DisplayFieldCard.tsx
import React from "react";
import { cn } from "@/lib/utils";

interface DisplayFieldCardProps {
  icon?: React.ReactNode;
  label: string;
  value: string | number | null | undefined;
  className?: string;
}

function formatDateIfValid(value: any) {
  if (!value) return "NA";

  const date = new Date(value);
  if (isNaN(date.getTime())) return value;

  // Day with suffix
  const day = date.getDate();
  const getSuffix = (n: number) => {
    if (n % 10 === 1 && n !== 11) return "st";
    if (n % 10 === 2 && n !== 12) return "nd";
    if (n % 10 === 3 && n !== 13) return "rd";
    return "th";
  };
  const dayWithSuffix = `${day}${getSuffix(day)}`;

  // Month short name
  const month = date.toLocaleString("en-US", { month: "short" });

  // Year
  const year = date.getFullYear();

  return `${dayWithSuffix} ${month} ${year}`;
}


export default function DisplayFieldCard({
  icon,
  label,
  value,
  className
}: DisplayFieldCardProps) {


  //   const displayValue =
  // typeof value === "string" || typeof value === "number"
  //   ? formatDateIfValid(value)
  //   : "NA";
console.log("value",value)

  return (
    <div
      className={cn(
        "w-full rounded-xl border border-gray-200 bg-white p-4 flex gap-4 items-start shadow-sm",
        className
      )}
    >
      {/* Icon */}
      {/* <div className="text-gray-500 text-2xl shrink-0">{icon}</div> */}

      <div className="flex flex-col w-full">
        {/* Label */}
        <p className="label-text text-[13px] text-gray-500 font-medium">{label}</p>

        {/* Value */}
        <p className="input-text text-[15px] text-gray-800 font-semibold mt-1">
          {/* {displayValue} */}{value}
        </p>
      </div>
    </div>
  );
}
