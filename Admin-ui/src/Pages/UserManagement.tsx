import { useCallback, useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Button from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { showToast } from '@/components/ui/sonner'
import { useAuth } from '@/hooks/useAuth'
import { CommonConstants } from '@/services/constant'
import { NOTIFICATION_CONSTANTS } from '@/utils/constant'
import { userManagementService } from '@/services/userService'
import type { IUserDetails, ICreateUserRequest } from '@/models/user'
import DynamicFormBuilder from '@/components/form/DynamicFormBuilder'
import AutoAccordionSection from '@/components/ui/autoAccordianSection'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import z from 'zod'

export default function UserManagement() {
  const [searchQuery, setSearchQuery] = useState('')
  const { user } = useAuth()
  const [isEdit, setIsEdit] = useState(false)
  const [userDetails, setUserDetails] = useState<IUserDetails | null>(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isResetPasswordModalOpen, setIsResetPasswordModalOpen] = useState(false)
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')

  console.log("merge check")

  // Fetch user details
  const fetchUserDetails = useCallback(async () => {
    if (!searchQuery.trim()) return null
    
    // Determine search type based on input format
    const trimmedQuery = searchQuery.trim()
    let requestData: { username?: string; emailId?: string; mobileNumber?: string } = {}
    
    if (trimmedQuery.includes('@')) {
      // Looks like an email
      requestData = { emailId: trimmedQuery }
    } else if (/^\d+$/.test(trimmedQuery)) {
      // All digits - likely a mobile number
      requestData = { mobileNumber: trimmedQuery }
    } else {
      // Default to username
      requestData = { username: trimmedQuery }
    }
    
    console.log("🔍 Searching user with:", requestData)
    const response = await userManagementService.UserDetails(requestData)
    console.log("✅ UserDetails API response:", response)
    
    if (!response) {
      throw new Error('No response received from server')
    }
    
    const { errorCode, errorMessage } = response.responseHeader
    if (errorCode === CommonConstants.SUCCESS) {
      // Handle different response formats: userDetails, userDetail, or userOtherDetails
      const userDetail = 
        response.responseBody?.userDetails?.[0] || 
        response.responseBody?.userDetail ||
        response.responseBody?.userOtherDetails?.[0] ||
        response.responseBody?.userOtherDetail
      if (userDetail) {
        setUserDetails(userDetail)
        return userDetail
      } else {
        throw new Error('User not found')
      }
    } else {
      throw new Error(errorMessage || 'Failed to fetch user details')
    }
  }, [searchQuery])
  
  const handleSearch = () => {
    if (!searchQuery.trim()) {
      showToast(NOTIFICATION_CONSTANTS.ERROR, 'Please enter a search value')
      return
    }
    // Clear previous user details when starting a new search
    setUserDetails(null)
    setIsEdit(false)
    // Trigger the API call
    refetchUserDetails()
  }

  const { data: userData, error, isFetching, refetch: refetchUserDetails } = useQuery({
    queryKey: ['userDetails', searchQuery],
    queryFn: fetchUserDetails,
    enabled: false,
    retry: false,
    networkMode: 'offlineFirst',
    refetchOnWindowFocus: false,
  })

  // Update user details when data changes
  useEffect(() => {
    if (userData) {
      setUserDetails(userData)
    }
  }, [userData])

  // Handle field click for buttons (Edit/Cancel)
  const handleFieldClick = (fieldName: string) => {
    if (fieldName === 'edit') {
      setIsEdit(true)
    } else if (fieldName === 'cancel') {
      setIsEdit(false)
    } else if (fieldName === 'resetPassword') {
      setIsResetPasswordModalOpen(true)
    }
  }

  // Handle password change
  const handlePasswordChange = async () => {
    try {
      if (!userDetails?.userId) {
        throw new Error('User ID is missing. Cannot change password.')
      }

      if (!oldPassword || !newPassword) {
        showToast(NOTIFICATION_CONSTANTS.ERROR, 'Please enter both old and new password')
        return
      }

      const updatePayload = {
        userId: userDetails.userId,
        oldPassword: oldPassword,
        password: newPassword,
      }

      console.log('📤 Sending password change payload:', { ...updatePayload, oldPassword: '***', password: '***' })
      const response = await userManagementService.UpdateUser(updatePayload)
      
      if (!response) {
        throw new Error('No response received from server')
      }

      const { errorCode, errorMessage } = response.responseHeader
      if (errorCode === CommonConstants.SUCCESS) {
        showToast(NOTIFICATION_CONSTANTS.SUCCESS, 'Password successfully changed')
        setIsResetPasswordModalOpen(false)
        setOldPassword('')
        setNewPassword('')
        // Refresh user details
        refetchUserDetails()
      } else {
        throw new Error(errorMessage || 'Failed to change password')
      }
    } catch (error: any) {
      console.error('❌ Error changing password:', error)
      showToast(NOTIFICATION_CONSTANTS.ERROR, error.message || 'Failed to change password. Please try again.')
    }
  }

  // Handle form submission for updating user details
  const handleUserUpdate = async (formData: Record<string, any>) => {
    try {
      if (!userDetails?.userId) {
        throw new Error('User ID is missing. Cannot update user details.')
      }

      const updatePayload = {
        userId: userDetails.userId,
        ...formData,
      }

      console.log('📤 Sending update payload:', updatePayload)
      const response = await userManagementService.UpdateUser(updatePayload)
      
      if (!response) {
        throw new Error('No response received from server')
      }

      const { errorCode, errorMessage } = response.responseHeader
      if (errorCode === CommonConstants.SUCCESS) {
        // Handle different response formats: userDetails, userDetail, or userOtherDetails
        const updatedUser = 
          response.responseBody?.userDetails?.[0] || 
          response.responseBody?.userDetail ||
          response.responseBody?.userOtherDetails?.[0] ||
          response.responseBody?.userOtherDetail
        if (updatedUser) {
          setUserDetails(updatedUser)
        }
        showToast(NOTIFICATION_CONSTANTS.SUCCESS, 'User details updated successfully!')
        setIsEdit(false)
      } else {
        throw new Error(errorMessage || 'Failed to update user details')
      }
    } catch (error: any) {
      console.error('❌ Error updating user details:', error)
      showToast(NOTIFICATION_CONSTANTS.ERROR, error.message || 'Failed to update user details. Please try again.')
    }
  }

  // Handle form submission for creating user
  const handleCreateUser = async (formData: Record<string, any>) => {
    try {
      const createPayload: ICreateUserRequest = {
        username: formData.username || '',
        emailId: formData.emailId || '',
        password: formData.password || '',
        mobileNumber: formData.mobileNumber || '',
        reportingMgrName: formData.reportingMgrName ? Number(formData.reportingMgrName) : undefined,
      }

      console.log('📤 Sending create user payload:', createPayload)
      const response = await userManagementService.CreateUser(createPayload)
      
      if (!response) {
        throw new Error('No response received from server')
      }

      const { errorCode, errorMessage } = response.responseHeader
      if (errorCode === CommonConstants.SUCCESS) {
        showToast(NOTIFICATION_CONSTANTS.SUCCESS, 'User created successfully!')
        setIsCreateModalOpen(false)
        // Clear search and user details to return to search page
        setSearchQuery('')
        setUserDetails(null)
        setIsEdit(false)
      } else {
        throw new Error(errorMessage || 'Failed to create user')
      }
    } catch (error: any) {
      console.error('❌ Error creating user:', error)
      showToast(NOTIFICATION_CONSTANTS.ERROR, error.message || 'Failed to create user. Please try again.')
    }
  }

  // User Details Form Configuration
  const userDetailsConfig = {
    gridCols: 3,
    sectionName: 'user_details',
    defaultValues: {
      username: userDetails?.username || '',
      emailId: userDetails?.emailId || '',
      mobileNumber: userDetails?.mobileNumber || '',
      reportingMgrName: userDetails?.reportingMgrName || '',
      isActive: userDetails?.isActive ?? true,
      isLocked: userDetails?.isLocked ?? false,
    },
    schema: z.object({
      username: z.string().optional(),
      emailId: z.string().email().optional().or(z.literal('')),
      mobileNumber: z.string().optional(),
      reportingMgrName: z.string().optional(),
      isActive: z.boolean().optional(),
      isLocked: z.boolean().optional(),
    }),
    fields: [
      {
        name: 'username',
        label: 'Username',
        type: 'text',
        colSpan: 1,
        readOnly: !isEdit,
        variant: 'standard',
      },
      {
        name: 'emailId',
        label: 'Email ID',
        type: 'email',
        colSpan: 1,
        readOnly: !isEdit,
        variant: 'standard',
      },
      {
        name: 'mobileNumber',
        label: 'Mobile Number',
        type: 'text',
        colSpan: 1,
        readOnly: !isEdit,
        variant: 'standard',
      },
    
      {
        name: 'reportingMgrName',
        label: 'Reporting Manager',
        type: 'text',
        colSpan: 1,
        readOnly: true,
        variant: 'standard',
      },
      {
        name: 'isActive',
        label: 'Is Active',
        type: 'boolean',
        colSpan: 1,
        readOnly: !isEdit,
      },
      {
        name: 'isLocked',
        label: 'Is Locked',
        type: 'boolean',
        colSpan: 1,
        readOnly: !isEdit,
      },
    ],
    buttons: isEdit
      ? {
          gridCols: 6,
          items: [
            {
              label: 'Save Changes',
              type: 'submit',
              variant: 'orange',
              colSpan: 2,
              size: 'md',
              className: 'whitespace-nowrap mt-4',
            },
            {
              label: 'Cancel',
              type: 'button',
              variant: 'outline',
              colSpan: 2,
              size: 'md',
              className: 'whitespace-nowrap mt-4',
              name: 'cancel',
            },
          ],
        }
      : {
          gridCols: 6,
          items: [
            {
              label: 'Reset Password',
              type: 'button',
              variant: 'orange',
              colSpan: 2,
              size: 'md',
              className: 'whitespace-nowrap mt-4',
              name: 'resetPassword',
            },
          ],
        },
  }

  return (
    <Card>
      <CardContent>
        <div className="max-w-6xl mx-auto space-y-4">
          {/* Header Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Search Users
            </h1>
            <p className="text-gray-600 text-lg mb-2">
              Quickly find Users, Details, Change/ reset thier Password.
            </p>
            <p className="text-sm text-gray-500">
              Powered by :- {user ? user.username : ' Not Logged In'}
            </p>
          </div>
          <div className=" flex justify-center items-center  gap-4">
            {/* Search Input */}
            <div className="relative w-[500px]">
              <Input
                type="text"
                label=''
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !isFetching) {
                    handleSearch()
                  }
                }}
                placeholder="Search by Username, Email, or Mobile Number"
                className="pr-24 py-5.5"
                variant='standardone'
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                <Button
                  variant="blue"
                  onClick={() => handleSearch()}
                  className={`"h-full  border-l-0 px-6 mt-2`}
                  size="sm"
                  disabled={isFetching}
                >
                  Search
                </Button>
              </div>
            </div>
            {/* Create User Button */}
            <Button
              variant="orange"
              onClick={() => setIsCreateModalOpen(true)}
              size="md"
              className="whitespace-nowrap"
            >
              Create User
            </Button>
            {/* <ZoneList /> */}
          </div>

          {/* Error Display */}
          {error && (
            <div className="mt-4 text-center">
              <p className="text-red-600">{error.message || 'Failed to fetch user details'}</p>
            </div>
          )}

          {/* User Details Form */}
          {userDetails && (
            <div className="mt-8">
              {/* <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900 font-poppins text-[20px]">
                  User Details
                </h2>
              </div> */}
              <Card className="w-full !px-6 mt-5 overflow-y-auto overflow-x-hidden bg-[#fff]">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-xl text-start font-semibold text-gray-900 font-poppins text-[20px]">User Details</CardTitle>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gray-600">Edit Mode</span>
                      <Switch
                        checked={isEdit}
                        onCheckedChange={setIsEdit}
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="!px-0 !py-0 w-[100%]">
                  <AutoAccordionSection id="user-details-sec">
                    <DynamicFormBuilder
                      key={`user-details-${userDetails?.userId}-${isEdit}`}
                      config={userDetailsConfig}
                      onSubmit={handleUserUpdate}
                      onFieldClick={handleFieldClick}
                    />
                  </AutoAccordionSection>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </CardContent>

      {/* Create User Modal */}
      {/* <AlertDialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <AlertDialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-semibold">Create New User</AlertDialogTitle>
          </AlertDialogHeader>
          <div className="mt-4">
            <DynamicFormBuilder
              config={createUserConfig}
              onSubmit={handleCreateUser}
              onFieldClick={(fieldName: string) => {
                if (fieldName === 'cancel') {
                  setIsCreateModalOpen(false)
                }
              }}
            />
          </div>
        </AlertDialogContent>
      </AlertDialog> */}

      {/* Reset Password Modal */}
      <AlertDialog open={isResetPasswordModalOpen} onOpenChange={setIsResetPasswordModalOpen}>
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-semibold">Reset Password</AlertDialogTitle>
          </AlertDialogHeader>
          <div className="mt-4 space-y-4">
            <div>
              <Input
                type="password"
                label="Old Password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="Enter old password"
                variant="standard"
                className="w-full"
              />
            </div>
            <div>
              <Input
                type="password"
                label="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                variant="standard"
                className="w-full"
              />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setIsResetPasswordModalOpen(false)
                  setOldPassword('')
                  setNewPassword('')
                }}
                size="md"
              >
                Cancel
              </Button>
              <Button
                variant="orange"
                onClick={handlePasswordChange}
                size="md"
              >
                Change Password
              </Button>
            </div>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}
