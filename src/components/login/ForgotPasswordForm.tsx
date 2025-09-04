import React from 'react'
import { BiMailSend } from 'react-icons/bi'
import { BsArrowLeft } from 'react-icons/bs'
import Button from '@/components/ui/button'
import { TextFeild } from '@/components/form/text-field'
import { useAppForm } from '@/components/form'

interface ForgotPasswordFormProps {
  onBack: () => void
  onSendCode: (email: string) => void
}

const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({
  onBack,
  onSendCode,
}) => {
  // Initialize form
  const form = useAppForm({
    defaultValues: {
      email: '',
    },
    // validators: {
    //   onChange: loginSchema,
    // },
    onSubmit: ({ value }) => {
      onSendCode(value.email)
    },
  })

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        e.stopPropagation()
        form.handleSubmit()
      }}
      className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100 animate-slide-up"
    >
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-500 rounded-lg mb-4 shadow-lg">
          <BiMailSend className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">
          Forgot Password?
        </h2>
        <p className="text-gray-600 text-sm">
          Enter your email address and we'll send you a verification code
        </p>
      </div>

      <div className="space-y-4">
        {/* Email field wrapped with AppField */}
        <form.AppField
          name="email"
          children={() => <TextFeild label="Email Address" />}
        />

        <div className="flex justify-between gap-3">
          <Button variant="default" type="button" onClick={onBack} size="lg">
            <BsArrowLeft className="w-4 h-4" />
            Back
          </Button>
           <form.AppForm>
              <form.Button
                type="submit"
                className="w-full"
                size="lg"
                variant="orange"
                icon={<BiMailSend className="w-5 h-5" />}
              >
                 Send Code
              </form.Button>
            </form.AppForm>
         
        </div>
      </div>
    </form>
  )
}

export default ForgotPasswordForm
