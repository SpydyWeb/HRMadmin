import { useEffect, useState } from 'react';
import { Calendar } from 'lucide-react';

interface DateTimeFieldProps {
  label: string;
  name?: string;
  value?: string;
  onChange?: (value: string) => void;
  readOnly?: boolean;
}

export const FloatedDateTimeField = ({
  label,
  name,
  value,
  onChange,
  readOnly = false,
}: DateTimeFieldProps) => {
  const [localValue, setLocalValue] = useState('');
  const [showPicker, setShowPicker] = useState(false);

  // Update local value when prop value changes
  useEffect(() => {
    setLocalValue(value || '');
  }, [value]);

  // Format ISO date to display format: "13th Nov 2025, 12:05 PM"
  const formatDisplayDate = (isoString: string) => {
    if (!isoString) return '';
    console.log("testing")
    
    try {
      const date = new Date(isoString);
      
      // Check if date is valid
      if (isNaN(date.getTime())) return '';
      
      // Get day with ordinal suffix
      const day = date.getDate();
      const suffix = ['th', 'st', 'nd', 'rd'];
      const v = day % 100;
      const ordinal = day + (suffix[(v - 20) % 10] || suffix[v] || suffix[0]);
      
      // Format month
      const month = date.toLocaleString('en-US', { month: 'short' });
      
      // Format year
      const year = date.getFullYear();
      
      // Format time
      let hours = date.getHours();
      const minutes = date.getMinutes().toString().padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12 || 12;
      
      return `${ordinal} ${month} ${year}, ${hours}:${minutes} ${ampm}`;
    } catch (e) {
      return '';
    }
  };

  // Convert ISO to datetime-local format
 const getDateTimeLocalValue = (isoString: string) => {
  if (!isoString) return '';

  try {
    const cleanISO = isoString.replace(/\.\d+/, ''); // remove milliseconds
    const date = new Date(cleanISO);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  } catch {
    return "";
  }
};


  const handleChange = (val: string) => {
    if (!val) {
      setLocalValue('');
      onChange?.('');
      setShowPicker(false);
      return;
    }
     const date = new Date(val);
    // Convert datetime-local format to ISO string
    const isoString = date.toISOString();
    setLocalValue(isoString);
    onChange?.(isoString);
    setShowPicker(false);
  };

  // Use value prop or localValue
  const currentValue = value !== undefined ? value : localValue;
  const displayValue = formatDisplayDate(currentValue);
  const hasValue = currentValue && currentValue.length > 0;

  return (
    <div className="relative w-full pt-3">
      {/* Display Input */}
      <div className="relative">
        <input
          type="text"
          id={name}
          name={name}
          value={displayValue}
          placeholder=" "
          readOnly
          onClick={() => !readOnly && setShowPicker(!showPicker)}
          className={`
            peer w-full border-0 border-b-2 rounded-none shadow-none
            px-0 pb-2 pt-6 text-orange-700 bg-transparent
            focus:outline-none focus:ring-0 
            focus:border-orange-500
            ${readOnly ? 'cursor-not-allowed text-orange-400 border-gray-300' : 'cursor-pointer border-gray-300'}
          `}
        />
        
        {/* Calendar Icon */}
        {!readOnly && (
          <Calendar 
            className="absolute right-0 top-6 h-5 w-5 text-gray-400 cursor-pointer hover:text-orange-500 transition-colors"
            onClick={() => setShowPicker(!showPicker)}
          />
        )}
      </div>

      {/* Floating Label */}
      <label
        htmlFor={name}
        className={`
          absolute left-0 transition-all duration-200 pointer-events-none
          ${hasValue ? 'top-0 text-xs text-black-600' : 'top-4 text-sm text-gray-600'}
          peer-focus:top-0 peer-focus:text-xs peer-focus:text-black-600
        `}
      >
        {label}
      </label>

      {/* DateTime Picker Popup */}
      {showPicker && !readOnly && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setShowPicker(false)}
          />
          
          {/* Picker Container */}
          <div className="absolute left-0 top-full mt-2 z-50 bg-white rounded-lg shadow-xl border border-gray-200 p-4 min-w-[300px]">
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  Select Date & Time
                </label>
                <input
                  type="datetime-local"
                  value={getDateTimeLocalValue(currentValue)}
                  onChange={(e) => handleChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
              
              {/* Quick Actions */}
              <div className="flex gap-2 pt-2 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => handleChange(new Date().toISOString().slice(0, 16))}
                  className="flex-1 px-3 py-1.5 text-sm font-medium bg-orange-50 text-orange-600 rounded hover:bg-orange-100 transition-colors"
                >
                  Now
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setLocalValue('');
                    onChange?.('');
                    setShowPicker(false);
                  }}
                  className="flex-1 px-3 py-1.5 text-sm font-medium bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors"
                >
                  Clear
                </button>
                <button
                  type="button"
                  onClick={() => setShowPicker(false)}
                  className="flex-1 px-3 py-1.5 text-sm font-medium bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
