import React from 'react'
import { BiUserCheck } from 'react-icons/bi'
import { BsArrowLeft } from 'react-icons/bs'
import OTPInput from './OTPInput'

interface OtpVerificationFormProps {
  otp: string
  countdown: number
  setOtp: (val: string) => void
  onBack: () => void
  onVerify: () => void
  onResend: () => void
}

const OtpVerificationForm: React.FC<OtpVerificationFormProps> = ({
   otp,
  countdown,
  setOtp,
  onBack,
  onVerify,
  onResend,
}) => {
  return (
    <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100 animate-slide-up">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-400 to-green-500 rounded-lg mb-4 shadow-lg">
          <BiUserCheck className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">Enter Verification Code</h2>
        <p className="text-gray-600 text-sm mb-1">We've sent a 6-digit code to your email</p>
        {/* <p className="text-orange-600 font-medium text-sm">{email}</p> */}
      </div>

      <div className="space-y-6">
        <div className="space-y-4">
          <label className="block text-sm font-medium text-gray-700 text-center">
            Verification Code
          </label>
          <OTPInput value={otp} onChange={setOtp} />
        </div>

        <div className="text-center">
          {countdown > 0 ? (
            <p className="text-gray-500 text-sm">Resend code in {countdown} seconds</p>
          ) : (
            <button
              type="button"
              onClick={onResend}
              className="text-blue-600 hover:text-blue-700 text-sm hover:underline transition-colors"
            >
              Didn't receive code? Resend
            </button>
          )}
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <BsArrowLeft className="w-4 h-4" />
            Back
          </button>
          <button
            type="button"
            onClick={onVerify}
            disabled={otp.length !== 6}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-green-400 to-green-500 text-white rounded-lg hover:from-green-500 hover:to-green-600 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            <BiUserCheck className="w-5 h-5" />
            Verify Code
          </button>
        </div>
      </div>
    </div>
  )
}

export default OtpVerificationForm
