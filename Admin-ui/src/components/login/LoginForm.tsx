import React from 'react'
import { BiBuilding } from 'react-icons/bi'
import { Card, CardContent } from '../ui/card'
import DynamicFormBuilder from '../form/DynamicFormBuilder'
import { loginSchema } from '@/schema/authSchema'
import { auth } from '@/auth'
import { CommonConstants, LoginConstants } from '@/services/constant'
import { NOTIFICATION_CONSTANTS, RoutePaths } from '@/utils/constant'
import { useNavigate } from '@tanstack/react-router'
import { showToast } from '../ui/sonner'



const LoginForm: any = () => {
  const navigate = useNavigate()
  const loginformConfig = {
    gridCols: 1,
    schema: loginSchema,
    buttons: {
      gridCols: 1,
      items: [
        {
          label: 'Login',
          type: 'submit',
          variant: 'orange',
          colSpan: 1,
          icon: <BiBuilding className="w-5 h-5" />,
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
      {
        name: 'password',
        label: 'Password',
        type: 'password',
        placeholder: 'Enter password',
        colSpan: 1,
      },
      {
        name: 'remember',
        label: 'Remember Me',
        type: 'checkbox',
        placeholder: '',
        colSpan: 1,
      },
    ],
  }
    const handleSubmit = async (data: z.infer<typeof loginSchema>) => {
       try {
          // navigate({ to: RoutePaths.SEARCH })
          const response = await auth.login(data)
          const { errorCode, errorMessage } = response.responseHeader
          switch (errorCode) {
            case CommonConstants.SUCCESS:
              navigate({ to: RoutePaths.SEARCH })
              break
            case LoginConstants.INVALID_CREDENTIALS:
              showToast(
                NOTIFICATION_CONSTANTS.ERROR,
                'Invalid username or password',
              )
              break
            case LoginConstants.ACCOUNT_LOCKED:
              showToast(
                NOTIFICATION_CONSTANTS.ERROR,
                'Your account is locked. Contact support.',
              )
              break
            case LoginConstants.NO_ACTIVE_PRIMARY_ROLE:
              showToast(
                NOTIFICATION_CONSTANTS.WARNING,
                'No active role assigned to your account',
              )
              break
            default:
              showToast(
                NOTIFICATION_CONSTANTS.ERROR,
                errorMessage || 'Unexpected error occurred',
              )
          }
        } catch (err: any) {
          showToast(
            NOTIFICATION_CONSTANTS.ERROR,
            'Login failed: ' + (err.message || 'Unknown error'),
          )
        }
    }
  return (
    <Card className="animate-slide-up">
      <CardContent>
        <DynamicFormBuilder config={loginformConfig} onSubmit={handleSubmit} />
      </CardContent>
    </Card>
  )
}

export default LoginForm
