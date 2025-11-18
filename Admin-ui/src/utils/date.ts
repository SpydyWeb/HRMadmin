import { format } from "date-fns";

export function useLocalizedDate() {
  function formatDate(input: string | Date) {
    const date = typeof input === "string" ? new Date(input) : input;
    return format(date, "dd MMM yyyy"); // ONLY DATE
  }

  function formatTime(input: string | Date) {
    const date = typeof input === "string" ? new Date(input) : input;
    return format(date, "hh:mm a");     // ONLY TIME
  }

  return { formatDate, formatTime };
}
