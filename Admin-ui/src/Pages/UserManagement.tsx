import { useCallback, useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Button from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { showToast } from '@/components/ui/sonner'
import { useAuth } from '@/hooks/useAuth'
import { CommonConstants } from '@/services/constant'
import { NOTIFICATION_CONSTANTS } from '@/utils/constant'
import { userManagementService } from '@/services/userService'
import type { IUserDetails, ICreateUserRequest, IUpdateUserRequest, IUpdatePasswordRequest } from '@/models/user'
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
  const navigate = useNavigate()
  const { user } = useAuth()
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

  // Handle field click for buttons
  const handleFieldClick = (fieldName: string) => {
    if (fieldName === 'resetPassword') {
      setIsResetPasswordModalOpen(true)
    }
  }

  // Handle password change
  const handlePasswordChange = async () => {
    try {
      if (!userDetails?.username) {
        throw new Error('Username is missing. Cannot change password.')
      }

      if (!oldPassword || !newPassword) {
        showToast(NOTIFICATION_CONSTANTS.ERROR, 'Please enter both old and new password')
        return
      }

      const updatePasswordPayload: IUpdatePasswordRequest = {
        username: userDetails.username,
        oldPassword: oldPassword,
        newPassword: newPassword,
        isActive: userDetails.isActive ?? true,
        isLocked: userDetails.isLocked ?? false,
        reportingMgr: userDetails.reportingMgr ?? 0,
      }

      console.log('📤 Sending password change payload:', { ...updatePasswordPayload, oldPassword: '***', newPassword: '***' })
      const response = await userManagementService.UpdatePassword(updatePasswordPayload)
      
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

      // Fields that can be updated (excluding username)
      const updatableFields = ['emailId', 'mobileNumber', 'reportingMgrName', 'isActive', 'isLocked']
      
      // Build update payload with userId and username (required by API)
      const updatePayload: Partial<IUpdateUserRequest> & { userId: number; username?: string } = {
        userId: userDetails.userId,
        username: userDetails.username, // Required by API even though it's not updated
      }

      // Helper function to normalize values for comparison
      const normalizeValue = (value: any): any => {
        if (value === null || value === undefined) return undefined
        if (typeof value === 'boolean') return Boolean(value)
        if (typeof value === 'string') {
          const trimmed = value.trim()
          return trimmed === '' ? undefined : trimmed
        }
        return value
      }

      // Include all updatable fields that are present in formData
      let hasAnyChanges = false
      updatableFields.forEach((field) => {
        const newValue = formData[field]
        const oldValue = userDetails[field as keyof IUserDetails]
        
        // Normalize both values for comparison
        const normalizedNew = normalizeValue(newValue)
        const normalizedOld = normalizeValue(oldValue)
        
        // Check if value has changed (using strict comparison after normalization)
        const hasChanged = normalizedNew !== normalizedOld
        
        console.log(`🔍 Field: ${field}, Old: ${JSON.stringify(oldValue)} (normalized: ${JSON.stringify(normalizedOld)}), New: ${JSON.stringify(newValue)} (normalized: ${JSON.stringify(normalizedNew)}), Changed: ${hasChanged}`)
        
        // Include field if it exists in formData
        // For booleans, always include if they exist in formData (they might be false which is a valid value)
        if (newValue !== undefined) {
          const valueToSend = normalizedNew !== undefined ? normalizedNew : newValue
          ;(updatePayload as any)[field] = valueToSend
          
          // Track if this field actually changed
          if (hasChanged) {
            hasAnyChanges = true
          }
        }
      })

      // Don't send if only userId and username are present (no changes)
      if (!hasAnyChanges && Object.keys(updatePayload).length === 2) {
        showToast(NOTIFICATION_CONSTANTS.ERROR, 'No changes detected. Please modify at least one field.')
        return
      }

      console.log('📤 Sending update payload:', JSON.stringify(updatePayload, null, 2))
      console.log('📤 Original userDetails:', JSON.stringify(userDetails, null, 2))
      console.log('📤 Form data received:', JSON.stringify(formData, null, 2))
      
      const response = await userManagementService.UpdateUser(updatePayload as IUpdateUserRequest)
      
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
      // Validate required fields
      if (!formData.username || !formData.emailId || !formData.password || !formData.mobileNumber) {
        showToast(NOTIFICATION_CONSTANTS.ERROR, 'Please fill in all required fields')
        return
      }

      const createPayload: ICreateUserRequest & { reportingMgrName?: string; reportingMgrId?: string } = {
        username: formData.username || '',
        emailId: formData.emailId || '',
        password: formData.password || '',
        mobileNumber: formData.mobileNumber || '',
        reportingMgrName: formData.reportingMgrName || '',
      }

      console.log('📤 Sending create user payload:', { ...createPayload, password: '***' })
      const response = await userManagementService.CreateUser(createPayload)
      
      if (!response) {
        throw new Error('No response received from server')
      }

      const { errorCode, errorMessage } = response.responseHeader
      if (errorCode === CommonConstants.SUCCESS) {
        // Success notification
        showToast(
          NOTIFICATION_CONSTANTS.SUCCESS,
          'User created successfully!',
        )

        // Action notification with link to roles management (no auto-redirect)
        showToast(NOTIFICATION_CONSTANTS.ACTION, 'Assign roles to this user', {
          description: 'Click below to go to Roles Management and assign roles for the newly created user.',
          actionLabel: 'Go to Roles Management',
          onAction: () => navigate({ to: '/roles-management' }),
          duration: 8000,
        })

        setIsCreateModalOpen(false)
        // Clear search and user details to return to search page
        setSearchQuery('')
        setUserDetails(null)
      } else {
        throw new Error(errorMessage || 'Failed to create user')
      }
    } catch (error: any) {
      console.error('❌ Error creating user:', error)
      showToast(NOTIFICATION_CONSTANTS.ERROR, error.message || 'Failed to create user. Please try again.')
      // Don't close modal on error so user can fix and retry
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
        readOnly: true,
        variant: 'standard',
      },
      {
        name: 'emailId',
        label: 'Email ID',
        type: 'email',
        colSpan: 1,
        readOnly: false,
        variant: 'standard',
      },
      {
        name: 'mobileNumber',
        label: 'Mobile Number',
        type: 'text',
        colSpan: 1,
        readOnly: false,
        variant: 'standard',
      },
    
      {
        name: 'reportingMgrName',
        label: 'Reporting Manager',
        type: 'text',
        colSpan: 1,
        readOnly: false,
        variant: 'standard',
      },
      {
        name: 'isActive',
        label: 'Is Active',
        type: 'boolean',
        colSpan: 1,
        readOnly: false,
      },
      {
        name: 'isLocked',
        label: 'Is Locked',
        type: 'boolean',
        colSpan: 1,
        readOnly: false,
      },
    ],
    buttons:  {
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
              variant: 'orange',
              colSpan: 2,
              size: 'md',
              className: 'whitespace-nowrap mt-4',
            },

          ],
        },
  }

  // Create User Form Configuration
  const createUserConfig = {
    gridCols: 8,
    sectionName: 'create_user',
    defaultValues: {
      username: '',
      emailId: '',
      password: '',
      mobileNumber: '',
      reportingMgrName: '',
      reportingMgrId: '',
    },
    schema: z.object({
      username: z.string().min(3, 'Username must be at least 3 characters'),
      emailId: z.string().email('Invalid email address').min(1, 'Email is required'),
      password: z.string().min(1, 'Password is required'),
      mobileNumber: z.string()
        .regex(/^\d{10}$/, 'Mobile number must be exactly 10 digits (Indian number without +91)')
        .min(1, 'Mobile number is required'),
      reportingMgrName: z.string().min(1, 'Reporting manager name is required'),
      reportingMgrId: z.string().optional(),
    }),
    fields: [
      {
        name: 'username',
        label: 'Username',
        type: 'text',
        colSpan: 4,
        readOnly: false,
        variant: 'standard',
        required: true,
      },
      {
        name: 'emailId',
        label: 'Email ID',
        type: 'email',
        colSpan: 4,
        readOnly: false,
        variant: 'standard',
        required: true,
      },
      {
        name: 'password',
        label: 'Password',
        type: 'password',
        colSpan: 4,
        readOnly: false,
        variant: 'standard',
        required: true,
      },
      {
        name: 'mobileNumber',
        label: 'Mobile Number',
        type: 'text',
        colSpan: 4,
        readOnly: false,
        variant: 'standard',
        required: true,
      },
      {
        name: 'reportingMgrName',
        label: 'Reporting Manager Name',
        type: 'text',
        colSpan: 4,
        readOnly: false,
        variant: 'standard',
        required: true,
      },
  
    ],
    buttons: {
      gridCols: 4,
      items: [
        {
          label: 'Create User',
          type: 'submit',
          variant: 'orange',
          colSpan: 6,
          size: 'md',
          className: 'whitespace-nowrap mt-4',
        },
        {
          label: 'Cancel',
          type: 'button',
          variant: 'outline',
          colSpan: 6,
          size: 'md',
          className: 'whitespace-nowrap mt-4',
          name: 'cancel',
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
              
              <Card className="w-full !px-6 mt-5 overflow-y-auto overflow-x-hidden bg-[#fff]">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-xl text-start font-semibold text-gray-900 font-poppins text-[20px]">User Details</CardTitle>
                    <div className="flex items-center gap-3">
                    {/* add the reset password button here  we dont required edit mode */}
                    <Button
                      variant="orange"
                      onClick={() => setIsResetPasswordModalOpen(true)}
                      size="sm"
                    >
                      Reset Password
                    </Button>
                     
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="!px-0 !py-0 w-[100%]">
                  <AutoAccordionSection id="user-details-sec">
                    <DynamicFormBuilder
                      key={`user-details-${userDetails?.userId}`}
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
      <AlertDialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <AlertDialogContent className="w-full max-w-4xl sm:max-w-4xl max-h-[95vh] overflow-y-auto p-8">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-semibold pr-8">Create New User</AlertDialogTitle>
            <button
              onClick={() => setIsCreateModalOpen(false)}
              className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              aria-label="Close"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
              >
                <path d="M18 6L6 18" />
                <path d="M6 6l12 12" />
              </svg>
            </button>
          </AlertDialogHeader>
          <div className="mt-2">
            {createUserConfig ? (
              <DynamicFormBuilder
                key={`create-user-form-${isCreateModalOpen}`}
                config={createUserConfig}
                onSubmit={handleCreateUser}
                onFieldClick={(fieldName: string) => {
                  if (fieldName === 'cancel') {
                    setIsCreateModalOpen(false)
                  }
                }}
              />
            ) : (
              <div className="p-4 text-center text-red-600">
                Error loading form. Please close and try again.
              </div>
            )}
          </div>
        </AlertDialogContent>
      </AlertDialog>

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
