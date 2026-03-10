import { useEffect, useState } from 'react'
import FieldTreeView from '../components/ui/FieldTreeView'
import { showToast } from "@/components/ui/sonner"
import { NOTIFICATION_CONSTANTS } from '@/utils/constant'
import Loading from '@/components/ui/Loading'
import Loader from '@/components/Loader'
import { OrgConfigService } from '@/services/orgConfigService'
import { HMSService } from '@/services/hmsService'


const OrgConfiguration = () => {

  type Role = {
    roleId: number
    roleName: string
  }

  type SectionAccess = {
    componentId: number
    fieldId: number
    fieldName: string
    edit: boolean
    render: boolean
    createLog: boolean
    approvalMode: 'USER' | 'CUSTOM' | 'NONE'
    approver1: number | ''
    approver2: number | ''
    approver3: number | ''
  }

  const [fieldAccess, setFieldAccess] = useState<SectionAccess[]>([])
  const [fieldLoading, setFieldLoading] = useState(false)
  const [treeData, setTreeData] = useState<any[]>([])
  const [globalLoading, setGlobalLoading] = useState(false)
  const [orgConfig, setOrgConfig] = useState<any[]>([])
  const [roles, setRoles] = useState<Role[]>([])

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await HMSService.getRoles()
        const apiRoles = response?.responseBody?.roles || []
        setRoles(apiRoles)
      } catch (error) {
        console.error('Failed to fetch roles:', error)
      }
    }

    fetchRoles()
  }, [])

  // Fetch org configuration data
  useEffect(() => {
    const fetchOrgConfig = async () => {
      try {
        const response = await OrgConfigService.fetchOrgConfig()
        if (response?.responseHeader?.errorCode === 1101) {
          const apiMenu = response?.responseBody?.uiMenuResponse?.uiMenu || []
          setOrgConfig(apiMenu)
        } else {
          setOrgConfig([])
        }
      } catch (error) {
        console.error('Failed to fetch org config:', error)
        setOrgConfig([])
      }
    }

    fetchOrgConfig()
  }, [])


    


  // Format tree data from orgConfig
  useEffect(() => {
    if (orgConfig.length === 0) {
      setTreeData([])
      return
    }

    setFieldLoading(true)

    const formattedTree = orgConfig.map((screen: any, i: number) => ({
      id: `screen-${i}`,
      name: screen.section,
      type: 'root',
      children:
        screen.subSection?.map((tab: any, j: number) => ({
          id: `screen-${i}-tab-${j}`,
          name: tab.section,
          type: 'module',
          children:
            tab.subSection?.map((section: any, k: number) => ({
              id: `screen-${i}-tab-${j}-section-${k}`,
              name: section.section,
              type: 'menu',
              componentId: section.componentId,
              fieldList: section.fieldList || [],
              children: [],
            })) || [],
        })) || [],
    }))

    setTreeData(formattedTree)
    setFieldLoading(false)
  }, [orgConfig])

  const handleApiToast = (res: any) => {
    const message = res?.responseHeader?.errorMessage || 'Unexpected response'
    if (res?.responseHeader?.errorCode === 1101) {
      showToast(NOTIFICATION_CONSTANTS.SUCCESS, message)
    } else {
      showToast(NOTIFICATION_CONSTANTS.ERROR, message)
    }
  }

  const updateFieldAccess = async (
    fieldId: number,
    key: keyof SectionAccess,
    value: boolean | string | number
  ) => {
    let updatedRow: SectionAccess | null = null

    // Update UI first
    setFieldAccess(prev =>
      prev.map(row => {
        if (row.fieldId !== fieldId) return row

        let newRow: SectionAccess

        if (key === 'approvalMode') {
          newRow = {
            ...row,
            approvalMode: value as 'USER' | 'CUSTOM' | 'NONE',
            approver1: '',
            approver2: '',
            approver3: '',
          }
        } else {
          newRow = {
            ...row,
            [key]: value,
          } as SectionAccess
        }
        updatedRow = newRow
        return newRow
      })
    )

    if (!updatedRow) return

    // Convert approvalMode → useDefaultApprover (Save API only supports this flag + approver ids)
    const mode =
      key === 'approvalMode'
        ? (value as 'USER' | 'CUSTOM' | 'NONE')
        : updatedRow.approvalMode

    // All modes use useDefaultApprover: false
    // USER and NONE: send null for all approver IDs
    // CUSTOM: send actual approver IDs
    const useDefaultApprover = false
    const isCustomMode = mode === 'CUSTOM'

    // Save API payload (matches: /api/Access/ApprovalSettings/Save)
    // Note: API expects `componentId` from orgConfiguration fetch response.
    const payload = {
      componentId: updatedRow.componentId || updatedRow.fieldId,
      approverOneId: isCustomMode ? Number(updatedRow.approver1 || 0) : null,
      approverTwoId: isCustomMode ? Number(updatedRow.approver2 || 0) : null,
      approverThreeId: isCustomMode ? Number(updatedRow.approver3 || 0) : null,
      useDefaultApprover,
    }

    console.log('orgConfig update payload', payload)
    try {
      setGlobalLoading(true)
      const res = await OrgConfigService.updateOrgConfig(payload)
      handleApiToast(res)
    } catch (error: any) {
      showToast(
        NOTIFICATION_CONSTANTS.ERROR,
        error?.response?.data?.responseHeader?.errorMessage ||
        error?.message ||
        'Server error'
      )
    } finally {
      setGlobalLoading(false)
    }
  }

  return (
    <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      {globalLoading && <Loading />}

      <div className="flex gap-6">
        {/* LEFT SIDE - Hierarchy Navigator */}
        <div className="w-80 bg-white rounded-2xl shadow-md p-4">
          {/* <h3 className="text-lg font-semibold mb-4">Hierarchy Navigator</h3> */}
          {fieldLoading ? (
            <div className="flex justify-center items-center py-10">
              <Loader />
            </div>
          ) : (
            <div className="h-[calc(100vh-200px)] overflow-y-auto">
              <FieldTreeView
                data={treeData}
                onSelect={(node) => {
                  console.log('Selected node:', node)

                  // Load field access when a section is selected
                  if (node.type === 'menu' && node.fieldList) {
                    const formattedFields = node.fieldList.map((field: any) => ({
                      componentId: Number((node as any).componentId || 0),
                      fieldId: field.cntrlid || 0,
                      fieldName: field.cntrlName || `Field ${field.cntrlid}`,
                      edit: field.allowedit || false,
                      render: field.render || false,
                      createLog: false,
                      approvalMode: (field.useDefaultApprover 
                        ? 'USER' 
                        : (field.approverOneRoleId || field.approverTwoRoleId || field.approverThreeRoleId 
                          ? 'CUSTOM' 
                          : 'NONE')) as 'USER' | 'CUSTOM' | 'NONE',
                      approver1: field.approverOneRoleId || '',
                      approver2: field.approverTwoRoleId || '',
                      approver3: field.approverThreeRoleId || '',
                    }))

                    setFieldAccess(formattedFields)
                  } else {
                    setFieldAccess([])
                  }
                }}
              />
            </div>
          )}
        </div>

        {/* RIGHT SIDE - Approver Matrix */}
        <div className="flex-1 bg-white rounded-2xl shadow-md border p-6">
          <h3 className="text-lg font-semibold mb-4">Approver Matrix</h3>
          
          {fieldAccess.length === 0 ? (
            <div className="flex items-center justify-center h-[calc(100vh-200px)] text-gray-400">
              <p>Select a section from the hierarchy to configure approval settings</p>
            </div>
          ) : (
            <div className="space-y-6">
              {fieldAccess.map((field) => (
                <div key={field.fieldId} className="border rounded-lg p-4 space-y-4">
                 
                  
                  {/* Approval Mode Dropdown */}
                  <div>
                    <select
                      value={field.approvalMode}
                      onChange={(e) =>
                        updateFieldAccess(field.fieldId, 'approvalMode', e.target.value)
                      }
                      className="w-full border rounded px-3 py-2 text-sm"
                    >
                      <option value="USER">Use User Hierarchy</option>
                      <option value="CUSTOM">Use Custom Hierarchy</option>
                      <option value="NONE">No Approval Required</option>
                    </select>
                  </div>

                  {/* Approver Selection (only shown when CUSTOM mode) */}
                  {field.approvalMode === 'CUSTOM' && (
                    <div className="space-y-3 border-t pt-4">
                      <div className="flex items-center justify-between gap-3">
                        <label className="text-sm text-gray-600 w-32">Approver 1</label>
                        <select
                          value={field.approver1}
                          onChange={(e) =>
                            updateFieldAccess(
                              field.fieldId,
                              'approver1',
                              e.target.value ? Number(e.target.value) : ''
                            )
                          }
                          className="flex-1 border rounded px-3 py-2 text-sm"
                        >
                          <option value="">Select</option>
                          {roles.map(role => (
                            <option key={role.roleId} value={role.roleId}>
                              {role.roleName}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="flex items-center justify-between gap-3">
                        <label className="text-sm text-gray-600 w-32">Approver 2</label>
                        <select
                          value={field.approver2}
                          onChange={(e) =>
                            updateFieldAccess(
                              field.fieldId,
                              'approver2',
                              e.target.value ? Number(e.target.value) : ''
                            )
                          }
                          className="flex-1 border rounded px-3 py-2 text-sm"
                        >
                          <option value="">Select</option>
                          {roles.map(role => (
                            <option key={role.roleId} value={role.roleId}>
                              {role.roleName}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="flex items-center justify-between gap-3">
                        <label className="text-sm text-gray-600 w-32">Approver 3</label>
                        <select
                          value={field.approver3}
                          onChange={(e) =>
                            updateFieldAccess(
                              field.fieldId,
                              'approver3',
                              e.target.value ? Number(e.target.value) : ''
                            )
                          }
                          className="flex-1 border rounded px-3 py-2 text-sm"
                        >
                          <option value="">Select</option>
                          {roles.map(role => (
                            <option key={role.roleId} value={role.roleId}>
                              {role.roleName}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
};

export default OrgConfiguration;
