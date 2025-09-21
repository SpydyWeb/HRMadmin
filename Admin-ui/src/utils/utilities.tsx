import { useState } from 'react'
import { FiAlertCircle, FiEye, FiEyeOff, FiLock, FiUser } from 'react-icons/fi'
import type { AnyFieldApi } from '@tanstack/react-form'
import type { PasswordInputProps, TextInputProps } from './models'
import { TbLoader2 } from 'react-icons/tb'

export const TextInput: React.FC<TextInputProps> = ({
  id,
  label,
  value,
  onChange,
  onFocus,
  onBlur,
  placeholder,
  error,
  focused,
}) => {
  return (
    <div className="space-y-1">
      <label
        htmlFor={id}
        className="text-sm font-medium text-gray-700 block mb-2"
      >
        {label}
      </label>
      <div className="relative">
        <div
          className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors duration-200 ${
            focused ? 'text-orange-500' : 'text-gray-400'
          }`}
        >
          <FiUser className="h-5 w-5" />
        </div>
        <input
          id={id}
          type="text"
          value={value}
          onChange={onChange}
          onFocus={onFocus}
          onBlur={onBlur}
          placeholder={placeholder}
          className={`w-full pl-10 pr-4 py-3 border rounded-lg transition-all duration-300 outline-none ${
            error
              ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red-200'
              : focused
                ? 'border-orange-500 bg-orange-50 focus:ring-2 focus:ring-orange-200'
                : 'border-gray-300 bg-gray-50 hover:bg-white hover:border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'
          }`}
        />
        {error && (
          <p className="text-red-500 text-xs mt-1 animate-shake">{error}</p>
        )}
      </div>
    </div>
  )
}

export const PasswordInput: React.FC<PasswordInputProps> = ({
  id,
  label,
  value,
  onChange,
  onFocus,
  onBlur,
  error,
  focused,
}) => {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className="space-y-1">
      <label
        htmlFor={id}
        className="text-sm font-medium text-gray-700 block mb-2"
      >
        {label}
      </label>
      <div className="relative">
        <div
          className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors duration-200 ${
            focused ? 'text-orange-500' : 'text-gray-400'
          }`}
        >
          <FiLock className="h-5 w-5" />
        </div>
        <input
          id={id}
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          onFocus={onFocus}
          onBlur={onBlur}
          placeholder="••••••••"
          className={`w-full pl-10 pr-12 py-3 border rounded-lg transition-all duration-300 outline-none ${
            error
              ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red-200'
              : focused
                ? 'border-orange-500 bg-orange-50 focus:ring-2 focus:ring-orange-200'
                : 'border-gray-300 bg-gray-50 hover:bg-white hover:border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'
          }`}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-orange-500 transition-colors duration-200"
        >
          {showPassword ? (
            <FiEyeOff className="h-5 w-5" />
          ) : (
            <FiEye className="h-5 w-5" />
          )}
        </button>
        {error && (
          <p className="text-red-500 text-xs mt-1 animate-shake">{error}</p>
        )}
      </div>
    </div>
  )
}

export function FieldInfo({ field }: { field: AnyFieldApi }) {
  const { meta } = field.state;
  const errors = meta.errors.map((err) => err.message).join(', ');

  return (
    <div className="mt-1">
      {meta.isTouched && !meta.isValid && (
        <div className="flex items-center text-sm text-red-600 bg-red-50 border border-red-300 rounded-lg p-2">
          <FiAlertCircle className="w-4 h-4 mr-2" />
          <span>{errors}</span>
        </div>
      )}

      {meta.isValidating && (
        <div className="flex items-center text-sm text-blue-600 bg-blue-50 border border-blue-300 rounded-lg p-2 mt-1">
          <TbLoader2 className="w-4 h-4 mr-2 animate-spin" />
          <span>Validating...</span>
        </div>
      )}
    </div>
  );
}


export const tableData = [
  {
    srno: 1,
    agentid: 'AG10F12',
    requestedby: 'Manan Kumar',
    date: '12 May 2025',
    name: 'Rakesh Kumar',
    pan: 'QRSTU3456V',
    region: 'Delhi NCR',
    zone: 'North',
    currentBranch: 'Connaught Place',
    image: 'https://your-image-url.com/rakesh-kumar.jpg',
  },
  {
    srno: 2,
    agentid: 'BG10F12',
    requestedby: 'Jaydeep Sharma',
    date: '11 May 2025',
    name: 'Suresh Patel',
    pan: 'ABCDE1234F',
    region: 'Mumbai',
    zone: 'West',
    currentBranch: 'Andheri',
    image: 'https://your-image-url.com/suresh-patel.jpg',
  },
  {
    srno: 3,
    agentid: 'FG10F12',
    requestedby: 'Jitendra Rathore',
    date: '10 May 2025',
    name: 'Amit Verma',
    pan: 'FGHIJ5678K',
    region: 'Bangalore',
    zone: 'South',
    currentBranch: 'MG Road',
    image: 'https://your-image-url.com/amit-verma.jpg',
  },
  {
    srno: 4,
    agentid: 'KJ10F12',
    requestedby: 'Vivek Choubey',
    date: '10 May 2025',
    name: 'Vivek Choubey',
    pan: 'LMNOP9876Q',
    region: 'Delhi NCR',
    zone: 'North',
    currentBranch: 'Karol Bagh',
    image: 'https://your-image-url.com/vivek-choubey.jpg',
  },
  {
    srno: 5,
    agentid: 'KG10F12',
    requestedby: 'Jaydeep Sharma',
    date: '09 May 2025',
    name: 'Jaydeep Sharma',
    pan: 'RSTUV5432W',
    region: 'Pune',
    zone: 'West',
    currentBranch: 'Shivaji Nagar',
    image: 'https://your-image-url.com/jaydeep-sharma.jpg',
  },
  {
    srno: 6,
    agentid: 'MG10F12',
    requestedby: '12 July 2025',
    date: '08 May 2025',
    name: 'Manan Gupta',
    pan: 'WXYZA6789B',
    region: 'Hyderabad',
    zone: 'South',
    currentBranch: 'Banjara Hills',
    image: 'https://your-image-url.com/manan-gupta.jpg',
  },
  {
    srno: 7,
    agentid: 'AG10F12',
    requestedby: 'Vivek Choubey',
    date: '07 May 2025',
    name: 'Rakesh Kumar',
    pan: 'QRSTU3456V',
    region: 'Delhi NCR',
    zone: 'North',
    currentBranch: 'Connaught Place',
    image: 'https://your-image-url.com/rakesh-kumar.jpg',
  },
];