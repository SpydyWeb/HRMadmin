import { useState } from 'react'
import { BiShield } from 'react-icons/bi'
import { useNavigate } from '@tanstack/react-router'
import { useAppForm } from '@/components/form'
import LoginForm from '@/components/login/LoginForm'
import ForgotPasswordForm from '@/components/login/ForgotPasswordForm'
import OtpVerificationForm from '@/components/login/OtpVerificationForm'
import SuccessMessage from '@/components/login/SuccessMessage'
import { UserNameSchema } from '@/schema/authSchema'

type Step = 'login' | 'forgot-email' | 'otp' | 'success'

export default function Login() {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState<Step>('login')
  const [otp, setOtp] = useState<string>('')
  const [countdown, setCountdown] = useState<number>(0)

  const forgetform = useAppForm({
    defaultValues: {
      username: '',
    },
    validators: {
      onChange: UserNameSchema,
    },
    onSubmit: async ({ value }) => {
      if (!value.username) return
      setCurrentStep('otp')
      setCountdown(60)

      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    },
  })

  /** Handle Forgot Password */
  const handleForgotPassword = () => {
    setCurrentStep('forgot-email')
  }

  /** Verify OTP */
  const handleVerifyOTP = () => {
    if (otp.length === 6) {
      setCurrentStep('success')
    }
  }

  /** Back to Login */
  const handleBackToLogin = () => {
    setCurrentStep('login')
    setOtp('')
    setCountdown(0)
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 relative">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-50 to-orange-50 opacity-50"></div>
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-orange-400 rounded-full opacity-10 animate-pulse"></div>
          <div
            className="absolute -bottom-24 -left-24 w-48 h-48 bg-blue-500 rounded-full opacity-10 animate-pulse"
            style={{ animationDelay: '2s' }}
          ></div>
        </div>
        <div className="relative z-10 w-[30rem]">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-400 to-orange-500 rounded-lg mb-4 shadow-lg animate-float">
              <span className="text-white font-bold text-xl">HM</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-1">
              Distribution Management
            </h1>
            <p className="text-gray-600 flex items-center justify-center gap-2 text-sm">
              <BiShield className="w-4 h-4 text-blue-500" />
              Administrator Portal
            </p>
          </div>
          {currentStep === 'login' && (
            <LoginForm
            onForgotPassword={handleForgotPassword}
            />
          )}
          {currentStep === 'forgot-email' && (
            <ForgotPasswordForm
              onBack={handleBackToLogin}
              onSubmit={forgetform.handleSubmit}
            />
          )}
          {currentStep === 'otp' && (
            <OtpVerificationForm
              otp={otp}
              countdown={countdown}
              setOtp={setOtp}
              onBack={() => setCurrentStep('forgot-email')}
              onVerify={handleVerifyOTP}
              onResend={forgetform.handleSubmit}
            />
          )}
          {currentStep === 'success' && (
            <SuccessMessage onBackToLogin={handleBackToLogin} />
          )}
          <div className="mt-6 pt-3 border-t border-gray-200">
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
          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-gray-500 text-xs">
              © 2025 Hierarchy Management System. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
