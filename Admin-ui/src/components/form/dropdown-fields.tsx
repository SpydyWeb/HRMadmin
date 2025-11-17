import { useEffect, useState } from "react";
import { FieldError } from './field-error'
import { useFieldContext } from '.'

interface selectFieldProps {
  label: string
  name?: string
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  type?: string,
  options: { label: string; value: string }[]
}


export const FloatedSelectField = ({
  label,
  name,
  value,
  onChange,
  readOnly = false,
  options = [],
}: selectFieldProps & { readOnly?: boolean }) => {

  let field
  try {
    field = useFieldContext<string>()
  } catch {
    field = null
  }
  const [localValue, setLocalValue] = useState(value ?? "");


  useEffect(() => {
  setLocalValue(value ?? "");
}, [value]);


  // const handleChange = (v: string) => {
  //   setLocalValue(v);
  //   onChange?.(v);
  // };
    const handleChange = (val: string) => {
    if (field) field.handleChange(val)
    else {
      setLocalValue(val)
      onChange?.(val)
    }
  }

  const currentValue = field ? field.state.value : localValue
  const currentName = field ? field.name : name
  const hasValue = currentValue && currentValue.length > 0


  return (
    <div className="relative w-full">
      <select
      id={currentName}
  name={currentName}
        value={localValue}
        onChange={(e) => handleChange(e.target.value)}
        disabled={readOnly}
        className={`
    peer w-full border-0 border-b-2  pt-7 rounded-none bg-transparent
    focus:border-orange-500 focus:ring-0 text-orange-400 text-sm
    ${readOnly ? "text-organge-700 border-gray-400 cursor-not-allowed" : "border-gray-400"}
  `}
      >
        <option value={currentValue} disabled hidden></option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>

      <label
        className={`
          absolute left-0 text-black-500 transition-all duration-200 pointer-events-none
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
