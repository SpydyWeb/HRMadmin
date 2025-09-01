import { MdBusiness, MdSecurity } from 'react-icons/md'
import { useNavigate } from '@tanstack/react-router'
import { loginSchema } from '@/schema/loginSchema'
import { useAppForm } from '@/components/form'
import { TextFeild } from '@/components/form/text-field'
import { auth } from '@/auth'

export default function Login() {
  const navigate = useNavigate()
  const form = useAppForm({
    defaultValues: {
      username: '',
      password: '',
    },
    // validatorAdapter: zodValidator(),
    validators: {
      onChange: loginSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        const response = await auth.login(value)
        console.log('Logged in user:', response)
      } catch (err) {
        console.error('Login failed:', err)
      }
    },
  })
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
        <form
          onSubmit={(e) => {
            e.preventDefault()
            e.stopPropagation()
            form.handleSubmit()
          }}
          className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100 animate-slide-up"
          style={{
            boxShadow:
              '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          }}
        >
          <div className="space-y-4">
            {/* Email Field */}
            <form.AppField
              name="username"
              children={() => <TextFeild label="Email" />}
            />
            {/* Password Field */}
            <form.AppField
              name="password"
              children={() => <TextFeild label="Password" />}
            />

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
            <form.AppForm>
              <form.Button
                type="submit"
                className="w-full"
                size="lg"
                variant="orange"
                icon={<MdBusiness className="w-5 h-5" />}
              >
                Login
              </form.Button>
            </form.AppForm>
          </div>

          {/* Divider */}
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
        </form>

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
