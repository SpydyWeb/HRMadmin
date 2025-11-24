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

export function convertUTCStringToLocalDate(dateString: string): Date | null {
  if (!dateString) return null;

  const utcDate = new Date(dateString);
  if (isNaN(utcDate.getTime())) return null;

  // Create a new date in LOCAL timezone
  return new Date(
    utcDate.getUTCFullYear(),
    utcDate.getUTCMonth(),
    utcDate.getUTCDate(),
    utcDate.getUTCHours(),
    utcDate.getUTCMinutes(),
    utcDate.getUTCSeconds()
  );
}
