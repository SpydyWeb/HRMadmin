import { useCallback, useState, useEffect, useMemo, useRef } from 'react'
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
import { agentService } from '@/services/agentService'
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

  type BranchOption = { branchId: number; name: string; code: string }
  const [branchCatalog, setBranchCatalog] = useState<BranchOption[]>([])
  const [branchCatalogLoading, setBranchCatalogLoading] = useState(false)
  const [branchTagError, setBranchTagError] = useState<string | null>(null)
  const [branchTagSearchText, setBranchTagSearchText] = useState('')
  const [showBranchSuggestions, setShowBranchSuggestions] = useState(false)
  const [selectedBranchIds, setSelectedBranchIds] = useState<number[]>([])

  const parseBranchCatalog = (raw: unknown): BranchOption[] => {
    const unwrap = (r: any) => r?.responseBody ?? r
    const body: any = unwrap(raw)

    const list = Array.isArray(body?.branchList)
      ? body.branchList
      : Array.isArray(body?.BranchList)
        ? body.BranchList
        : Array.isArray(body)
          ? body
          : []

    const out: BranchOption[] = []
    const seen = new Set<number>()
    for (const item of list) {
      const idRaw =
        item?.branchId ?? item?.BranchId ?? item?.branchMasterId ?? item?.id
      const id = typeof idRaw === 'string' ? parseInt(idRaw, 10) : Number(idRaw)
      if (!Number.isFinite(id) || seen.has(id)) continue
      seen.add(id)
      out.push({
        branchId: id,
        name: String(
          item?.branchName ?? item?.BranchName ?? item?.name ?? `Branch ${id}`,
        ),
        code: String(item?.branchCode ?? item?.BranchCode ?? item?.code ?? ''),
      })
    }
    return out
  }

  const clearBranchTagState = () => {
    setBranchCatalog([])
    setBranchCatalogLoading(false)
    setBranchTagError(null)
    setBranchTagSearchText('')
    setShowBranchSuggestions(false)
    setSelectedBranchIds([])
  }

  useEffect(() => {
    const shouldLoadCatalog = isCreateModalOpen || Boolean(userDetails?.userId)
    if (!shouldLoadCatalog) return
    if (branchCatalog.length > 0) return

    let cancelled = false
    ;(async () => {
      setBranchCatalogLoading(true)
      setBranchTagError(null)
      try {
        const res = await agentService.fetchRegulatorBranches({ isActive: true })
        if (cancelled) return
        setBranchCatalog(parseBranchCatalog(res))
      } catch (e: any) {
        if (cancelled) return
        setBranchTagError(
          e instanceof Error ? e.message : 'Failed to load branches',
        )
        setBranchCatalog([])
      } finally {
        if (!cancelled) setBranchCatalogLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [isCreateModalOpen, userDetails?.userId, branchCatalog.length])

  const selectedBranchSet = useMemo(
    () => new Set(selectedBranchIds),
    [selectedBranchIds],
  )

  const initialSelectedBranchIdsRef = useRef<number[]>([])

  const areBranchIdArraysEqual = (a: number[], b: number[]) => {
    if (a.length !== b.length) return false
    const sa = [...a].sort((x, y) => x - y)
    const sb = [...b].sort((x, y) => x - y)
    for (let i = 0; i < sa.length; i++) {
      if (sa[i] !== sb[i]) return false
    }
    return true
  }

  const selectedBranchesForTags = useMemo(() => {
    return selectedBranchIds.map((id) => {
      const b = branchCatalog.find((x) => x.branchId === id)
      return b ?? { branchId: id, name: `Branch ${id}`, code: '' }
    })
  }, [branchCatalog, selectedBranchIds])

  const branchSuggestions = useMemo(() => {
    const q = branchTagSearchText.trim().toLowerCase()
    return branchCatalog
      .filter((b) => !selectedBranchSet.has(b.branchId))
      .filter((b) => {
        if (!q) return true
        return `${b.name} ${b.code}`.toLowerCase().includes(q)
      })
      .slice(0, 20)
  }, [branchCatalog, branchTagSearchText, selectedBranchSet])

  const addBranchTag = (id: number) => {
    setSelectedBranchIds((prev) => (prev.includes(id) ? prev : [...prev, id]))
    setBranchTagSearchText('')
    setShowBranchSuggestions(false)
  }

  const removeBranchTag = (id: number) => {
    setSelectedBranchIds((prev) => prev.filter((x) => x !== id))
  }

  const commitBranchInput = () => {
    const q = branchTagSearchText.trim().toLowerCase()
    if (!q) return

    const exact = branchSuggestions.find(
      (b) => b.name.toLowerCase() === q || (b.code && b.code.toLowerCase() === q),
    )

    if (exact) {
      addBranchTag(exact.branchId)
      return
    }

    // If only one suggestion remains, allow Enter to select it.
    if (branchSuggestions.length === 1) {
      addBranchTag(branchSuggestions[0].branchId)
    }
  }

  const normalizeLinkedBranchIdsByUser = (raw: unknown): number[] => {
    const body = (raw as any)?.responseBody ?? raw
    if (!body) return []

    const toNumber = (v: any): number | null => {
      const n = typeof v === 'string' ? parseInt(v, 10) : Number(v)
      return Number.isFinite(n) ? n : null
    }

    const extractId = (item: any): number | null => {
      const idRaw =
        item?.branchId ?? item?.BranchId ?? item?.branchMasterId ?? item?.id
      return toNumber(idRaw)
    }

    if (Array.isArray(body?.branchIds)) {
      return body.branchIds
        .map(toNumber)
        .filter((n: number | null): n is number => n !== null)
    }
    if (Array.isArray(body?.BranchIds)) {
      return body.BranchIds
        .map(toNumber)
        .filter((n: number | null): n is number => n !== null)
    }
    if (Array.isArray(body?.branchList)) {
      return body.branchList
        .map(extractId)
        .filter((n: number | null): n is number => n !== null)
    }
    if (Array.isArray(body?.BranchList)) {
      return body.BranchList
        .map(extractId)
        .filter((n: number | null): n is number => n !== null)
    }
    if (Array.isArray(body?.branches)) {
      return body.branches
        .map(extractId)
        .filter((n: number | null): n is number => n !== null)
    }
    if (Array.isArray(body)) {
      return body
        .map(extractId)
        .filter((n: number | null): n is number => n !== null)
    }

    return []
  }

  // Prefill tagged branches for selected user (edit mode)
  const [branchUpdateLoading, setBranchUpdateLoading] = useState(false)
  useEffect(() => {
    if (!userDetails?.userId) return
    if (isCreateModalOpen) return // don't overwrite create-user selection

    const userId: number = userDetails.userId as number
    let cancelled = false
    ;(async () => {
      setBranchTagError(null)
      try {
        const res = await userManagementService.fetchRegulatorBranchesByUser({
          userId,
        })
        if (cancelled) return
        const ids = normalizeLinkedBranchIdsByUser(res)
        setSelectedBranchIds(ids)
        initialSelectedBranchIdsRef.current = ids
      } catch (e: any) {
        if (cancelled) return
        setSelectedBranchIds([])
        setBranchTagError(
          e instanceof Error ? e.message : 'Failed to load user branches',
        )
      }
    })()

    return () => {
      cancelled = true
    }
  }, [userDetails?.userId, isCreateModalOpen])

  const handleUpdateUserBranches = async () => {
    if (!userDetails?.userId) return
    if (selectedBranchIds.length === 0) {
      showToast(NOTIFICATION_CONSTANTS.ERROR, 'Please select at least one branch')
      return
    }

    setBranchUpdateLoading(true)
    setBranchTagError(null)
    try {
      const saveRes = await userManagementService.saveRegulatorBranchesForUser({
        userId: userDetails.userId,
        branchIds: selectedBranchIds,
      })

      const code = saveRes?.responseHeader?.errorCode
      const msg = saveRes?.responseHeader?.errorMessage

      if (code === CommonConstants.SUCCESS) {
        showToast(NOTIFICATION_CONSTANTS.SUCCESS, 'Branches updated successfully!')
        // Refresh chips
        const res = await userManagementService.fetchRegulatorBranchesByUser({
          userId: userDetails.userId,
        })
        const ids = normalizeLinkedBranchIdsByUser(res)
        setSelectedBranchIds(ids)
      } else {
        showToast(NOTIFICATION_CONSTANTS.ERROR, msg || 'Failed to update branches')
      }
    } catch (e: any) {
      showToast(
        NOTIFICATION_CONSTANTS.ERROR,
        e?.message || 'Failed to update branches',
      )
    } finally {
      setBranchUpdateLoading(false)
    }
  }

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

      // Branch tagging changes should also trigger an update.
      const branchIdsChanged = !areBranchIdArraysEqual(
        initialSelectedBranchIdsRef.current,
        selectedBranchIds,
      )
      ;(updatePayload as any).branchIds = selectedBranchIds

      if (!hasAnyChanges && !branchIdsChanged) {
        showToast(
          NOTIFICATION_CONSTANTS.ERROR,
          'No changes detected. Please modify at least one field.',
        )
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
        branchIds: selectedBranchIds,
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
        clearBranchTagState()
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
                {/* <CardHeader> */}
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
                {/* </CardHeader> */}
                <CardContent className="!px-0 !py-0 w-[100%] flex flex-col">
                  <div className="order-1">
                  <AutoAccordionSection id="user-details-sec">
                    <DynamicFormBuilder
                      key={`user-details-${userDetails?.userId}`}
                      config={userDetailsConfig}
                      onSubmit={handleUserUpdate}
                      onFieldClick={handleFieldClick}
                    />
                  </AutoAccordionSection>
                  </div>

                  {/* Branch tagging for selected user */}
                  <div className="mt-6 px-0 order-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="text-sm font-semibold text-gray-800">
                          Linked regulator branches
                        </div>
                        <div className="text-xs text-gray-500">
                          Type a branch name and click to tag it.
                        </div>
                      </div>
                      <Button
                        variant="blue"
                        size="sm"
                        type="button"
                        disabled={
                          branchUpdateLoading ||
                          branchCatalogLoading ||
                          !userDetails?.userId ||
                          selectedBranchIds.length === 0
                        }
                        onClick={handleUpdateUserBranches}
                      >
                        {branchUpdateLoading ? 'Updating…' : 'Update branches'}
                      </Button>
                    </div>

                    {branchTagError && (
                      <div className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                        {branchTagError}
                      </div>
                    )}

                    <div
                      className="mt-3 w-full rounded-md border border-gray-300 px-2 py-2 text-sm focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-500 bg-white"
                      onClick={() => setShowBranchSuggestions(true)}
                    >
                      <div className="flex flex-wrap gap-2">
                        {branchCatalogLoading && (
                          <div className="text-xs text-gray-500">Loading…</div>
                        )}

                        {selectedBranchesForTags.map((b) => (
                          <span
                            key={b.branchId}
                            className="inline-flex items-center gap-2 px-2 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs"
                            title={b.code ? `${b.name} (${b.code})` : b.name}
                          >
                            <span className="max-w-[180px] truncate">{b.name}</span>
                            <button
                              type="button"
                              className="text-blue-700/80 hover:text-blue-900"
                              onClick={(e) => {
                                e.stopPropagation()
                                removeBranchTag(b.branchId)
                              }}
                              aria-label={`Remove ${b.name}`}
                            >
                              ×
                            </button>
                          </span>
                        ))}

                        <input
                          type="text"
                          value={branchTagSearchText}
                          disabled={branchCatalogLoading}
                          onChange={(e) => {
                            const val = e.target.value
                            setBranchTagSearchText(val)
                            setShowBranchSuggestions(true)
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault()
                              commitBranchInput()
                            }
                            if (
                              e.key === 'Backspace' &&
                              branchTagSearchText.length === 0 &&
                              selectedBranchIds.length > 0
                            ) {
                              removeBranchTag(
                                selectedBranchIds[selectedBranchIds.length - 1],
                              )
                            }
                          }}
                          onBlur={() => {
                            window.setTimeout(
                              () => setShowBranchSuggestions(false),
                              150,
                            )
                          }}
                          onFocus={() => setShowBranchSuggestions(true)}
                          placeholder="Type and press Enter to add…"
                          className="flex-1 min-w-[140px] outline-none border-0 px-1 py-1 text-sm"
                        />
                      </div>
                    </div>

                    {showBranchSuggestions && !branchCatalogLoading && (
                      <div className="relative">
                        <div className="absolute z-50 mt-2 w-full max-h-56 overflow-auto rounded-md border border-gray-200 bg-white shadow-lg">
                          {branchCatalog.length === 0 ? (
                            <div className="p-3 text-sm text-gray-500">
                              No branches loaded — check API / network
                            </div>
                          ) : branchSuggestions.length === 0 ? (
                            <div className="p-3 text-sm text-gray-500">
                              {branchTagSearchText.trim()
                                ? 'No matching branches'
                                : 'Showing all branches — type to filter'}
                            </div>
                          ) : (
                            branchSuggestions.map((b) => (
                              <button
                                key={b.branchId}
                                type="button"
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => addBranchTag(b.branchId)}
                                className="w-full text-left px-3 py-2 hover:bg-gray-50 transition"
                              >
                                <div className="text-sm font-medium text-gray-800">
                                  {b.name}
                                </div>
                                {b.code && (
                                  <div className="text-xs text-gray-500 truncate">
                                    {b.code}
                                  </div>
                                )}
                              </button>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </CardContent>

      {/* Create User Modal */}
      <AlertDialog
        open={isCreateModalOpen}
        onOpenChange={(open) => {
          setIsCreateModalOpen(open)
          if (!open) clearBranchTagState()
        }}
      >
        <AlertDialogContent className="w-full max-w-4xl sm:max-w-4xl max-h-[95vh] overflow-y-auto p-8">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-semibold pr-8">Create New User</AlertDialogTitle>
            <button
              onClick={() => {
                setIsCreateModalOpen(false)
                clearBranchTagState()
              }}
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
          <div className="flex flex-col">
            <div className="mt-2 order-1">
            {createUserConfig ? (
              <DynamicFormBuilder
                key={`create-user-form-${isCreateModalOpen}`}
                config={createUserConfig}
                onSubmit={handleCreateUser}
                onFieldClick={(fieldName: string) => {
                  if (fieldName === 'cancel') {
                    setIsCreateModalOpen(false)
                    clearBranchTagState()
                  }
                }}
              />
            ) : (
              <div className="p-4 text-center text-red-600">
                Error loading form. Please close and try again.
              </div>
            )}
          </div>

            <div className="mt-6 order-0">
            <div className="flex flex-col gap-2">
              <div>
                <div className="text-sm font-semibold text-gray-800">
                  Linked regulator branches
                </div>
                <div className="text-xs text-gray-500">
                  Type a branch name (e.g. Head Office) and click to tag it.
                </div>
              </div>

              {branchTagError && (
                <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {branchTagError}
                </div>
              )}

              <div
                className="w-full rounded-md border border-gray-300 px-2 py-2 text-sm focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-500 bg-white"
                onClick={() => setShowBranchSuggestions(true)}
              >
                <div className="flex flex-wrap gap-2">
                  {branchCatalogLoading && (
                    <div className="text-xs text-gray-500">Loading…</div>
                  )}

                  {selectedBranchesForTags.map((b) => (
                    <span
                      key={b.branchId}
                      className="inline-flex items-center gap-2 px-2 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs"
                      title={b.code ? `${b.name} (${b.code})` : b.name}
                    >
                      <span className="max-w-[180px] truncate">{b.name}</span>
                      <button
                        type="button"
                        className="text-blue-700/80 hover:text-blue-900"
                        onClick={(e) => {
                          e.stopPropagation()
                          removeBranchTag(b.branchId)
                        }}
                        aria-label={`Remove ${b.name}`}
                      >
                        ×
                      </button>
                    </span>
                  ))}

                  <input
                    type="text"
                    value={branchTagSearchText}
                    disabled={branchCatalogLoading}
                    onChange={(e) => {
                      const val = e.target.value
                      setBranchTagSearchText(val)
                      setShowBranchSuggestions(true)
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        commitBranchInput()
                      }
                      if (
                        e.key === 'Backspace' &&
                        branchTagSearchText.length === 0 &&
                        selectedBranchIds.length > 0
                      ) {
                        removeBranchTag(
                          selectedBranchIds[selectedBranchIds.length - 1],
                        )
                      }
                    }}
                    onBlur={() => {
                      window.setTimeout(
                        () => setShowBranchSuggestions(false),
                        150,
                      )
                    }}
                    onFocus={() => setShowBranchSuggestions(true)}
                    placeholder="Type and press Enter to add…"
                    className="flex-1 min-w-[140px] outline-none border-0 px-1 py-1 text-sm"
                  />
                </div>
              </div>

              {showBranchSuggestions && !branchCatalogLoading && (
                <div className="relative">
                  <div className="absolute z-50 mt-2 w-full max-h-56 overflow-auto rounded-md border border-gray-200 bg-white shadow-lg">
                    {branchCatalog.length === 0 ? (
                      <div className="p-3 text-sm text-gray-500">
                        No branches loaded — check API / network
                      </div>
                    ) : branchSuggestions.length === 0 ? (
                      <div className="p-3 text-sm text-gray-500">
                        {branchTagSearchText.trim()
                          ? 'No matching branches'
                          : 'Showing all branches — type to filter'}
                      </div>
                    ) : (
                      branchSuggestions.map((b) => (
                        <button
                          key={b.branchId}
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => addBranchTag(b.branchId)}
                          className="w-full text-left px-3 py-2 hover:bg-gray-50 transition"
                        >
                          <div className="text-sm font-medium text-gray-800">
                            {b.name}
                          </div>
                          {b.code && (
                            <div className="text-xs text-gray-500 truncate">
                              {b.code}
                            </div>
                          )}
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
            </div>
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
