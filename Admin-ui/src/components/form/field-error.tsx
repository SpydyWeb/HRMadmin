import { FiAlertCircle } from "react-icons/fi";
import type { AnyFieldMeta } from "@tanstack/react-form";

export function FieldError({ field }: { field: AnyFieldMeta }) {
  if (!field.isTouched || field.isValid) return null;

  return (
    <div className="space-y-1 mt-1">
      {field.errors.map((err: any, key: number) => {
        const msg =
          typeof err === "string"
            ? err
            : err?.message || JSON.stringify(err) || "Invalid value";

        return (
          <div
            key={key}
            className="flex items-center text-sm text-red-600 bg-red-50 border border-red-300 rounded-lg p-1"
          >
            <FiAlertCircle className="w-4 h-4 mr-2" />
            <span>{msg}</span>
          </div>
        );
      })}
    </div>
  );
}
