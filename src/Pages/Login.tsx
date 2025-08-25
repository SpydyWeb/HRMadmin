import React, { useState } from 'react'
import { FiEye, FiEyeOff, FiLock, FiUser } from 'react-icons/fi'
import { MdBusiness, MdSecurity } from 'react-icons/md'

export default function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [focusedField, setFocusedField] = useState('')

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.email) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid'
    }

    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }

    return newErrors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const formErrors = validateForm()

    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors)
      return
    }

    setIsLoading(true)
    setErrors({})

    setTimeout(() => {
      setIsLoading(false)
      alert('Login successful! Welcome to HMS Hierarchy Management')
    }, 2000)
  }

  const handleFocus = (fieldName) => {
    setFocusedField(fieldName)
  }

  const handleBlur = () => {
    setFocusedField('')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 relative">
      {/* Background pattern */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-50 to-orange-50 opacity-50"></div>
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-orange-400 rounded-full opacity-10 animate-pulse"></div>
        <div
          className="absolute -bottom-24 -left-24 w-48 h-48 bg-blue-500 rounded-full opacity-10 animate-pulse"
          style={{ animationDelay: '2s' }}
        ></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo and Header */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-400 to-orange-500 rounded-lg mb-4 shadow-lg animate-float">
            <span className="text-white font-bold text-xl">HM</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-1">
            Hierarchy Management
          </h1>
          <p className="text-gray-600 flex items-center justify-center gap-2 text-sm">
            <MdSecurity className="w-4 h-4 text-blue-500" />
            Administrator Portal
          </p>
        </div>

        {/* Login Card */}
        <div
          className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100 animate-slide-up"
          style={{
            boxShadow:
              '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          }}
        >
          <div className="space-y-6">
            {/* Email Field */}
            <div className="space-y-1">
              <label
                htmlFor="email"
                className="text-sm font-medium text-gray-700 block mb-2"
              >
                Email Address
              </label>
              <div className="relative">
                <div
                  className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors duration-200 ${
                    focusedField === 'email'
                      ? 'text-orange-500'
                      : 'text-gray-400'
                  }`}
                >
                  <FiUser className="h-5 w-5" />
                </div>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  onFocus={() => handleFocus('email')}
                  onBlur={handleBlur}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg transition-all duration-300 outline-none ${
                    errors.email
                      ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red-200'
                      : focusedField === 'email'
                        ? 'border-orange-500 bg-orange-50 focus:ring-2 focus:ring-orange-200'
                        : 'border-gray-300 bg-gray-50 hover:bg-white hover:border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'
                  }`}
                  placeholder="admin@company.com"
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1 animate-shake">
                    {errors.email}
                  </p>
                )}
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1">
              <label
                htmlFor="password"
                className="text-sm font-medium text-gray-700 block mb-2"
              >
                Password
              </label>
              <div className="relative">
                <div
                  className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors duration-200 ${
                    focusedField === 'password'
                      ? 'text-orange-500'
                      : 'text-gray-400'
                  }`}
                >
                  <FiLock className="h-5 w-5" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  onFocus={() => handleFocus('password')}
                  onBlur={handleBlur}
                  className={`w-full pl-10 pr-12 py-3 border rounded-lg transition-all duration-300 outline-none ${
                    errors.password
                      ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red-200'
                      : focusedField === 'password'
                        ? 'border-orange-500 bg-orange-50 focus:ring-2 focus:ring-orange-200'
                        : 'border-gray-300 bg-gray-50 hover:bg-white hover:border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'
                  }`}
                  placeholder="••••••••"
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
                {errors.password && (
                  <p className="text-red-500 text-xs mt-1 animate-shake">
                    {errors.password}
                  </p>
                )}
              </div>
            </div>

            {/* Remember & Forgot */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center text-gray-600 hover:text-gray-800 transition-colors cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500 focus:ring-2 mr-2"
                />
                Remember me
              </label>
              <button className="text-blue-600 hover:text-blue-700 hover:underline transition-colors duration-200">
                Forgot password?
              </button>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-all duration-300 transform focus:outline-none focus:ring-4 ${
                isLoading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 hover:scale-105 hover:shadow-lg active:scale-95 focus:ring-orange-300'
              }`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Signing In...
                </div>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <MdBusiness className="w-5 h-5" />
                  Access Dashboard
                </span>
              )}
            </button>
          </div>

          {/* Divider */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="text-center">
              <p className="text-gray-500 text-sm mb-2">
                Secure access to organizational hierarchy
              </p>
              <div className="flex items-center justify-center space-x-4 text-xs text-gray-400">
                <span className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  System Online
                </span>
                <span>•</span>
                <span>Support: ext. 1234</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center animate-fade-in-delay">
          <p className="text-gray-500 text-xs">
            © 2025 Hierarchy Management System. All rights reserved.
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes float {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-6px);
          }
        }

        @keyframes shake {
          0%,
          100% {
            transform: translateX(0);
          }
          25% {
            transform: translateX(-4px);
          }
          75% {
            transform: translateX(4px);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }

        .animate-fade-in-delay {
          animation: fade-in 1s ease-out 0.6s both;
        }

        .animate-slide-up {
          animation: slide-up 0.6s ease-out 0.2s both;
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }

        .animate-shake {
          animation: shake 0.4s ease-in-out;
        }
      `}</style>
    </div>
  )
}
