import React from 'react'
import { BiCheckCircle } from 'react-icons/bi'

interface SuccessMessageProps {
  onBackToLogin: () => void
}

const SuccessMessage: React.FC<SuccessMessageProps> = ({ onBackToLogin }) => {
  return (
    <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100 animate-slide-up">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-400 to-green-500 rounded-full mb-6 shadow-lg animate-bounce">
          <BiCheckCircle className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-3">Verification Successful!</h2>
        <p className="text-gray-600 mb-6">
          Your identity has been verified. You can now reset your password.
        </p>

        <div className="space-y-3">
          <button
            type="button"
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-400 to-orange-500 text-white rounded-lg hover:from-orange-500 hover:to-orange-600 shadow-lg hover:shadow-xl transition-all duration-200"
          >
            Reset Password
          </button>
          <button
            type="button"
            onClick={onBackToLogin}
            className="w-full text-gray-600 hover:text-gray-800 text-sm hover:underline transition-colors"
          >
            Back to Login
          </button>
        </div>
      </div>
    </div>
  )
}

export default SuccessMessage
