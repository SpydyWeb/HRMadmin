import React from 'react'
import { BiMailSend } from 'react-icons/bi'
import { BsArrowLeft } from 'react-icons/bs'
import { Card, CardContent } from '../ui/card'
import Button from '@/components/ui/button'
import { TextFeild } from '@/components/form/text-field'
import { UserNameSchema } from '@/schema/authSchema'
import DynamicFormBuilder from '../form/DynamicFormBuilder'


interface ForgotPasswordFormProps {
  onBack: () => void
  onSubmit: () => void
}

const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({
  onBack,
  onSubmit,
}) => {
   const formConfig = {
      gridCols: 1,
      schema: UserNameSchema,
      buttons: {
        gridCols: 2,
        items: [
          {
            label: 'Back',
            type: 'button',
            variant: 'default',
            colSpan: 1,
            icon: <BsArrowLeft className="w-5 h-5" />,
            size: 'lg',
          }, {
            label: 'Send Code',
            type: 'submit',
            variant: 'orange',
            colSpan: 1,
            icon: <BiMailSend className="w-5 h-5" />,
            size: 'lg',
          },
        ],
      },
      fields: [
        {
          name: 'username',
          label: 'User Name',
          type: 'text',
          placeholder: 'Enter user name',
          colSpan: 1,
        },
      ],
    }
      const handleFieldClick = (type: string) => {
    if (type === 'Back') {
      onBack()
    }
  }
  return (
    <Card className=" animate-slide-up">
      <CardContent>
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
          <DynamicFormBuilder config={formConfig} onSubmit={onSubmit}   onFieldClick={handleFieldClick}/>
        {/* <form.AppForm>
          <div className="space-y-4">
            <form.AppField name="username">
              {({
                value,
                onChange,
              }: {
                value: string
                onChange: (v: string) => void
              }) => (
                <TextFeild
                  label="User name"
                  value={value}
                  onChange={onChange}
                />
              )}
            </form.AppField>

            <div className="flex justify-between gap-3">
              <Button
                variant="default"
                type="button"
                onClick={onBack}
                size="lg"
              >
                <BsArrowLeft className="w-4 h-4" />
                Back
              </Button>
              <form.Button
                onClick={onSubmit}
                className="w-full"
                size="lg"
                variant="orange"
                icon={<BiMailSend className="w-5 h-5" />}
              >
                Send Code
              </form.Button>
            </div>
          </div>
        </form.AppForm> */}
      </CardContent>
    </Card>
  )
}

export default ForgotPasswordForm
