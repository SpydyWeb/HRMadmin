import { MdBusiness, MdSecurity } from 'react-icons/md'
import { useForm } from '@tanstack/react-form'
import { zodValidator } from '@tanstack/zod-form-adapter';
import { loginSchema } from '@/schema/loginSchema'
import { FieldInfo } from '@/utils/utilities'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button';

export default function Login() {
  const form = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
    validatorAdapter: zodValidator(),
    validators: {
      onChange: loginSchema
    },
    onSubmit: async ({ value }) => {
      // Do something with form data
      console.log(value)
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
            <form.Field
              name="email"
              children={(field) => {
                // Avoid hasty abstractions. Render props are great!
                return (
                  <>
                    <Label htmlFor={field.name}>Email id</Label>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />
                    <FieldInfo field={field} />
                  </>
                )
              }}
            />
            {/* Password Field */}
            <form.Field
              name="password"
              children={(field) => {
                // Avoid hasty abstractions. Render props are great!
                return (
                  <>
                    <Label htmlFor={field.name}>Password</Label>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />
                    <FieldInfo field={field} />
                  </>
                )
              }}
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
            <form.Subscribe
              selector={(state) => [state.canSubmit, state.isSubmitting]}
              children={([canSubmit, isSubmitting]) => (
                <Button
                  disabled={!canSubmit}
                  className={`w-full !py-5 !px-4 rounded-lg font-semibold text-white transition-all duration-300 transform focus:outline-none focus:ring-4 ${
                    isSubmitting
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 hover:scale-105 hover:shadow-lg active:scale-95 focus:ring-orange-300'
                  }`}
                >
                  {isSubmitting ? (
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
                </Button>
              )}
            />
          
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
