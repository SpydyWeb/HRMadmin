import { useEffect, useState } from "react";
import { FieldError } from "./field-error";
import { useFieldContext } from ".";

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"; 

interface selectFieldProps {
  label: string;
  name?: string;
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  options: { label: string; value: string }[];
  readOnly?: boolean;
}

export const FloatedSelectField = ({
  label,
  name,
  value,
  onChange,
  options = [],
  readOnly = false,
}: selectFieldProps) => {
  let field;
  try {
    field = useFieldContext<string>();
  } catch {
    field = null;
  }

  const [localValue, setLocalValue] = useState(value ?? "");

  useEffect(() => {
    setLocalValue(value ?? "");
  }, [value]);

  const handleChange = (val: string) => {
    if (field) field.handleChange(val);
    else {
      setLocalValue(val);
      onChange?.(val);
    }
  };

  const currentValue = field ? field.state.value : localValue;
  const currentName = field ? field.name : name;
  const hasValue = currentValue && currentValue.length > 0;

  return (
    <div className="relative w-full">
      <Select
        value={currentValue}
        onValueChange={handleChange}
        disabled={readOnly}
      >
        <SelectTrigger
          id={currentName}
          className={`
            peer w-full border-0 border-b-1 pt-9.5 rounded-none bg-transparent
            focus:border-orange-500 focus:ring-0 text-orange-500 text-sm
            ${readOnly ? "cursor-not-allowed opacity-100" : "border-gray-400"}
          `}
        >
          <SelectValue className="text-black opacity-100" placeholder="" />
        </SelectTrigger>

        <SelectContent>
          {options.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* floating label */}
      <label
        className={`
          absolute left-0 transition-all duration-200 pointer-events-none
          ${hasValue ? "top-0 text-xs text-black-600" : "top-4 text-sm"}
          peer-focus:top-0 peer-focus:text-xs peer-focus:text-black-600
        `}
      >
        {label}
      </label>

      {field && <FieldError field={field.state.meta} />}
    </div>
  );
};
