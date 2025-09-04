import React from 'react'
import { BiBuilding } from 'react-icons/bi'
import { Card, CardContent } from '../ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { TextFeild } from '@/components/form/text-field'

interface LoginFormProps {
  form: any         // replace `any` with your actual form type if available
  onForgotPassword: () => void
  onSubmit:()=>void
}

const LoginForm: React.FC<LoginFormProps> = ({ form, onForgotPassword ,onSubmit}) => {
  return (
    <Card className=" animate-slide-up">
       <CardContent>
      <form.AppForm  >
       <div className="space-y-4">
          <form.AppField name="username">
            {({ value, onChange }: { value: string; onChange: (v: string) => void }) => (
              <TextFeild label="User Name" value={value} onChange={onChange} />
            )}
          </form.AppField>

          <form.AppField name="password">
            {({ value, onChange }: { value: string; onChange: (v: string) => void }) => (
              <TextFeild label="Password" type="password" value={value} onChange={onChange} />
            )}
          </form.AppField>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1">
              <Checkbox id="terms" className="w-4 h-4 text-orange-500 " />
              <Label htmlFor="terms">Remember me</Label>
            </div>

            <span
              onClick={onForgotPassword}
              className="text-blue-600 hover:underline cursor-pointer"
            >
              Forgot password?
            </span>
          </div>
          <form.Button
            onClick={onSubmit}
            className="w-full"
            size="lg"
            variant="orange"
            icon={<BiBuilding className="w-5 h-5" />}
          >
            Login
          </form.Button>
       </div>
      </form.AppForm>
       </CardContent>
    </Card>
  )
}

export default LoginForm
