import { useEffect, useMemo, useState } from 'react'
import FieldTreeView from '../components/ui/FieldTreeView'
import { showToast } from "@/components/ui/sonner"
import { MASTER_DATA_KEYS, NOTIFICATION_CONSTANTS } from '@/utils/constant'
import Loading from '@/components/ui/Loading'
import Loader from '@/components/Loader'
import { OrgConfigService } from '@/services/orgConfigService'
import { HMSService } from '@/services/hmsService'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { productService } from '@/services/productService'
import { CommonConstants } from '@/services/constant'
import DynamicFormBuilder from '@/components/form/DynamicFormBuilder'
import { format, isValid, parse, parseISO } from 'date-fns'
import { useMasterData } from '@/hooks/useMasterData'
import DataTable from '@/components/table/DataTable'

const buildProductFormConfig = (
  getOptions: (key: string) => Array<{ label: string; value: any }>,
  defaults?: Partial<Record<string, any>>,
) => ({
  gridCols: 2,
  defaultValues: {
    productId: 0,
    productCode: '',
    productName: '',
    categoryId: 0,
    effectiveFrom: '',
    effectiveTo: '',
    isActive: true,
    description: '',
    ...(defaults || {}),
  },
  fields: [
    {
      name: 'productName',
      label: 'Product Name',
      type: 'text',
      placeholder: 'Enter product name',
      colSpan: 1,
      variant: 'standard',
    },
    {
      name: 'productCode',
      label: 'Product Code',
      type: 'text',
      placeholder: 'Enter product code',
      colSpan: 1,
      variant: 'standard',
    },
    {
      name: 'effectiveFrom',
      label: 'Effective From',
      type: 'date',
      colSpan: 1,
    },
    {
      name: 'effectiveTo',
      label: 'Effective To',
      type: 'date',
      colSpan: 1,
    },
    {
      name: 'categoryId',
      label: 'Category',
      type: 'select',
      placeholder: 'Select category',
      colSpan: 1,
      options: getOptions(MASTER_DATA_KEYS.PRODUCT_CATEGORY),
    },
    {
      name: 'isActive',
      label: 'Active',
      type: 'boolean',
      colSpan: 1,
    },
    
    {
      name: 'description',
      label: 'Description',
      type: 'textarea',
      placeholder: 'Enter description',
      colSpan: 2,
    },
  ],
  buttons: {
    gridCols: 2,
    items: [
      {
        label: 'Save Product',
        type: 'submit',
        variant: 'blue',
        colSpan: 1,
        loadingText: 'Saving...',
        className: 'mt-4',
        size: 'md',
      },
      {
        label: 'Clear',
        type: 'reset',
        variant: 'default',
        colSpan: 1,
        className: 'mt-4',
        size: 'md',
      },
    ],
  },
})


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
    isLog: boolean
    approvalMode: 'USER' | 'CUSTOM' | 'NONE'
    approver1: number | ''
    approver2: number | ''
    approver3: number | ''
  }

  const [fieldAccess, setFieldAccess] = useState<SectionAccess[]>([])
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null)
  const [fieldLoading, setFieldLoading] = useState(false)
  const [treeData, setTreeData] = useState<any[]>([])
  const [globalLoading, setGlobalLoading] = useState(false)
  const [orgConfig, setOrgConfig] = useState<any[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [productFormKey, setProductFormKey] = useState(0)
  const [activeTab, setActiveTab] = useState<'hierarchy' | 'product'>('hierarchy')
  const [products, setProducts] = useState<any[]>([])
  const [productsLoading, setProductsLoading] = useState(false)
  const [editingProduct, setEditingProduct] = useState<any | null>(null)

  const { getOptions, getDescription } = useMasterData([MASTER_DATA_KEYS.PRODUCT_CATEGORY])
  const productFormConfig = useMemo(
    () => buildProductFormConfig(getOptions, editingProduct || undefined),
    [getOptions, editingProduct],
  )

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response: any = await HMSService.getRoles()
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

  function findMenuNodeById(nodes: any[], id: string): any | null {
    for (const n of nodes) {
      if (n.id === id) return n
      if (n.children?.length) {
        const found = findMenuNodeById(n.children, id)
        if (found) return found
      }
    }
    return null
  }

  function formatFieldsFromMenuNode(node: any): SectionAccess[] {
    return (node.fieldList || []).map((field: any) => ({
      componentId: Number(node.componentId || 0),
      fieldId: field.cntrlid || 0,
      fieldName: field.cntrlName || `Field ${field.cntrlid}`,
      edit: field.allowedit || false,
      render: field.render || false,
      isLog: Boolean(field.isLog ?? field.createLog),
      approvalMode: (field.useDefaultApprover
        ? 'USER'
        : field.approverOneRoleId || field.approverTwoRoleId || field.approverThreeRoleId
          ? 'CUSTOM'
          : 'NONE') as 'USER' | 'CUSTOM' | 'NONE',
      approver1: field.approverOneRoleId || '',
      approver2: field.approverTwoRoleId || '',
      approver3: field.approverThreeRoleId || '',
    }))
  }

  // Keep matrix in sync when tree reloads (e.g. after save refetch) while same section stays selected
  useEffect(() => {
    if (!selectedSectionId) {
      setFieldAccess([])
      return
    }
    const node = findMenuNodeById(treeData, selectedSectionId)
    if (node?.type === 'menu' && node.fieldList?.length) {
      setFieldAccess(formatFieldsFromMenuNode(node))
    } else {
      setFieldAccess([])
    }
  }, [treeData, selectedSectionId])

  const refetchOrgConfig = async () => {
    try {
      const response = await OrgConfigService.fetchOrgConfig()
      if (response?.responseHeader?.errorCode === 1101) {
        const apiMenu = response?.responseBody?.uiMenuResponse?.uiMenu || []
        setOrgConfig(apiMenu)
      }
    } catch (error) {
      console.error('Failed to refetch org config:', error)
    }
  }

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
    const existingRow = fieldAccess.find(r => r.fieldId === fieldId)
    if (!existingRow) return

    const updatedRow: SectionAccess =
      key === 'approvalMode'
        ? {
            ...existingRow,
            approvalMode: value as 'USER' | 'CUSTOM' | 'NONE',
            approver1: '',
            approver2: '',
            approver3: '',
          }
        : ({
            ...existingRow,
            [key]: value,
          } as SectionAccess)

    setFieldAccess(prev => prev.map(r => (r.fieldId === fieldId ? updatedRow : r)))

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
      isLog: Boolean(updatedRow.isLog),
      useDefaultApprover,
    }

    try {
      setGlobalLoading(true)
      const res = await OrgConfigService.updateOrgConfig(payload)
      handleApiToast(res)
      if (res?.responseHeader?.errorCode === 1101) {
        await refetchOrgConfig()
      }
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

  const toIsoUtcMidnightFromPicker = (value: any) => {
    if (!value) return ''
    // DynamicFormBuilder's DatePicker returns "dd LLL yyyy"
    if (typeof value === 'string') {
      try {
        const d = parse(value, 'dd LLL yyyy', new Date())
        const utc = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0))
        return utc.toISOString()
      } catch {
        return ''
      }
    }
    if (value instanceof Date) {
      const utc = new Date(Date.UTC(value.getFullYear(), value.getMonth(), value.getDate(), 0, 0, 0))
      return utc.toISOString()
    }
    return ''
  }

  const handleSaveProduct = async (data: Record<string, any>) => {
    try {
      const payload = {
        ...(data.productId ? { productId: Number(data.productId) } : {}),
        productCode: String(data.productCode ?? '').trim(),
        productName: String(data.productName ?? '').trim(),
        categoryId: Number(data.categoryId ?? 0),
        effectiveFrom: toIsoUtcMidnightFromPicker(data.effectiveFrom),
        effectiveTo: toIsoUtcMidnightFromPicker(data.effectiveTo),
        isActive: Boolean(data.isActive),
      }

      const res = await productService.saveProduct(payload)
      const message = res?.responseHeader?.errorMessage || 'Unexpected response'

      if (res?.responseHeader?.errorCode === CommonConstants.SUCCESS) {
        showToast(NOTIFICATION_CONSTANTS.SUCCESS, message)
        // Refresh product list and clear the form on success
        await fetchProducts()
        setEditingProduct(null)
        setProductFormKey((k) => k + 1)
      } else {
        showToast(NOTIFICATION_CONSTANTS.ERROR, message)
      }
    } catch (error: any) {
      showToast(
        NOTIFICATION_CONSTANTS.ERROR,
        error?.response?.data?.responseHeader?.errorMessage ||
          error?.message ||
          'Server error'
      )
    }
  }

  const fetchProducts = async () => {
    try {
      setProductsLoading(true)
      const res = await productService.getProducts()
      if (res?.responseHeader?.errorCode === CommonConstants.SUCCESS) {
        setProducts(res?.responseBody?.products || [])
      } else {
        setProducts([])
        showToast(
          NOTIFICATION_CONSTANTS.ERROR,
          res?.responseHeader?.errorMessage || 'Failed to fetch products'
        )
      }
    } catch (error: any) {
      setProducts([])
      showToast(
        NOTIFICATION_CONSTANTS.ERROR,
        error?.response?.data?.responseHeader?.errorMessage ||
          error?.message ||
          'Server error'
      )
    } finally {
      setProductsLoading(false)
    }
  }

  useEffect(() => {
    if (activeTab !== 'product') return
    // fetch once when product tab opens (and whenever user comes back)
    fetchProducts()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab])

  const startEditProduct = (row: any) => {
    const asPickerDate = (v: any) => {
      if (!v) return ''
      // API sometimes returns "2026-04-01T00:00:00" (no Z). Normalize for picker.
      let d: Date
      if (typeof v === 'string') {
        // parseISO supports "YYYY-MM-DDTHH:mm:ss"
        d = parseISO(v)
        if (!isValid(d)) d = new Date(v)
      } else {
        d = v instanceof Date ? v : new Date(v)
      }
      if (!isValid(d)) return ''
      return format(d, 'dd LLL yyyy')
    }

    setEditingProduct({
      productId: row.productId ?? 0,
      productCode: row.productCode ?? '',
      productName: row.productName ?? '',
      categoryId: row.categoryId ?? 0,
      effectiveFrom: asPickerDate(row.effectiveFrom),
      effectiveTo: asPickerDate(row.effectiveTo),
      isActive: Boolean(row.isActive),
      description: row.description ?? '',
    })
    setProductFormKey((k) => k + 1)
  }

  return (
    <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      {globalLoading && <Loading />}

      <div className="bg-gray-150 rounded-2xl shadow-md border p-6">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="contents">
          <div className="-ml-px pt-2">
            <TabsList className="rounded-none py-6 bg-transparent shadow-none px-0">
              <TabsTrigger
                value="hierarchy"
                className="px-8 py-6 rounded-none text-gray-600 data-[state=active]:bg-white data-[state=active]:shadow-none data-[state=active]:text-black transition-all data-[state=active]:rounded-t-md"
              >
                Hierarchy
              </TabsTrigger>
              <TabsTrigger
                value="product"
                className="px-8 py-6 rounded-none text-gray-600 data-[state=active]:bg-white data-[state=active]:shadow-none data-[state=active]:text-black transition-all data-[state=active]:rounded-t-md"
              >
                Product
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="-ml-px p-4 -mt-px bg-white rounded-b-xl rounded-tr-xl">
            <TabsContent value="hierarchy" className="mt-0">
              <div className="flex gap-6">
                {/* LEFT SIDE - Hierarchy Navigator */}
                <div className="w-80 bg-white rounded-2xl shadow-md p-4 border">
                  {fieldLoading ? (
                    <div className="flex justify-center items-center py-10">
                      <Loader />
                    </div>
                  ) : (
                    <div className="h-[calc(100vh-320px)] overflow-y-auto">
                      <FieldTreeView
                        data={treeData}
                        onSelect={(node) => {
                          if (node.type === 'menu' && node.fieldList?.length) {
                            setSelectedSectionId(node.id)
                          } else {
                            setSelectedSectionId(null)
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
                    <div className="flex items-center justify-center h-[calc(100vh-320px)] text-gray-400">
                      <p>Select a section from the hierarchy to configure approval settings</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {fieldAccess.map((field) => (
                        <div key={field.fieldId} className="border rounded-lg p-4 space-y-4">
                          {/* Approval Mode Dropdown */}
                          <div>
                            <Select
                              value={field.approvalMode}
                              onValueChange={(v) =>
                                updateFieldAccess(field.fieldId, 'approvalMode', v)
                              }
                            >
                              <SelectTrigger className="w-full border rounded px-3 py-2 text-sm">
                                <SelectValue placeholder="Select approval mode" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="USER">Use User Hierarchy</SelectItem>
                                <SelectItem value="CUSTOM">Use Custom Hierarchy</SelectItem>
                                <SelectItem value="NONE">No Approval Required</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Approver Selection (only shown when CUSTOM mode) */}
                          {field.approvalMode === 'CUSTOM' && (
                            <div className="space-y-3 border-t pt-4">
                              <div className="flex items-center justify-between gap-3">
                                <label className="text-sm text-gray-600 w-32">Approver 1</label>
                                <Select
                                  value={field.approver1 ? String(field.approver1) : ''}
                                  onValueChange={(v) =>
                                    updateFieldAccess(
                                      field.fieldId,
                                      'approver1',
                                      v ? Number(v) : ''
                                    )
                                  }
                                >
                                  <SelectTrigger className="w-full flex-1 border rounded px-3 py-2 text-sm">
                                    <SelectValue placeholder="Select" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {roles.map(role => (
                                      <SelectItem key={role.roleId} value={String(role.roleId)}>
                                        {role.roleName}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>

                              <div className="flex items-center justify-between gap-3">
                                <label className="text-sm text-gray-600 w-32">Approver 2</label>
                                <Select
                                  value={field.approver2 ? String(field.approver2) : ''}
                                  onValueChange={(v) =>
                                    updateFieldAccess(
                                      field.fieldId,
                                      'approver2',
                                      v ? Number(v) : ''
                                    )
                                  }
                                >
                                  <SelectTrigger className="w-full flex-1 border rounded px-3 py-2 text-sm">
                                    <SelectValue placeholder="Select" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {roles.map(role => (
                                      <SelectItem key={role.roleId} value={String(role.roleId)}>
                                        {role.roleName}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>

                              <div className="flex items-center justify-between gap-3">
                                <label className="text-sm text-gray-600 w-32">Approver 3</label>
                                <Select
                                  value={field.approver3 ? String(field.approver3) : ''}
                                  onValueChange={(v) =>
                                    updateFieldAccess(
                                      field.fieldId,
                                      'approver3',
                                      v ? Number(v) : ''
                                    )
                                  }
                                >
                                  <SelectTrigger className="w-full flex-1 border rounded px-3 py-2 text-sm">
                                    <SelectValue placeholder="Select" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {roles.map(role => (
                                      <SelectItem key={role.roleId} value={String(role.roleId)}>
                                        {role.roleName}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          )}

                          <div className="flex items-center justify-between gap-3 border-t pt-4">
                            <label className="text-sm text-gray-600 w-32">Log Changes</label>
                            <Switch
                              checked={field.isLog}
                              onCheckedChange={(checked) =>
                                updateFieldAccess(field.fieldId, 'isLog', checked)
                              }
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="product" className="mt-0">
              <div className="bg-white rounded-2xl shadow-md border p-6">
                <div className="flex items-center justify-between gap-4 mb-4">
                  <div>
                    <h3 className="text-lg font-semibold">Product</h3>
                    {editingProduct?.productId ? (
                      <div className="text-xs text-gray-500 mt-0.5">
                        Editing: {editingProduct.productCode} (ID: {editingProduct.productId})
                      </div>
                    ) : null}
                  </div>
                  <button
                    type="button"
                    onClick={fetchProducts}
                    disabled={productsLoading}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {productsLoading ? 'Refreshing...' : 'Refresh'}
                  </button>
                </div>

                <DynamicFormBuilder
                  key={`product-form-${productFormKey}`}
                  config={productFormConfig}
                  onSubmit={handleSaveProduct}
                />

                <div className="mt-6">
                  <div className="text-sm font-semibold text-gray-800 mb-3">
                    Product List
                  </div>

                  <DataTable
                    loading={productsLoading}
                    noDataMessage="No products found"
                    columns={[
                      { header: 'Code', accessor: 'productCode', width: '140px' },
                      { header: 'Name', accessor: 'productName' },
                      {
                        header: 'Category',
                        accessor: (row) =>
                          getDescription(MASTER_DATA_KEYS.PRODUCT_CATEGORY, row.categoryId) ||
                          row.categoryId,
                        width: '180px',
                      },
                      {
                        header: 'Effective From',
                        accessor: (row) => String(row.effectiveFrom ?? '').split('T')[0],
                        width: '140px',
                      },
                      {
                        header: 'Effective To',
                        accessor: (row) => String(row.effectiveTo ?? '').split('T')[0],
                        width: '140px',
                      },
                      {
                        header: 'Active',
                        accessor: (row) => (
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              row.isActive
                                ? 'bg-green-100 text-green-700'
                                : 'bg-gray-100 text-gray-600'
                            }`}
                          >
                            {row.isActive ? 'Active' : 'Inactive'}
                          </span>
                        ),
                        width: '120px',
                        align: 'center',
                      },
                      {
                        header: 'Edit',
                        accessor: (row) => (
                          <button
                            type="button"
                            onClick={() => startEditProduct(row)}
                            className="text-blue-600 hover:underline text-sm"
                          >
                            Edit
                          </button>
                        ),
                        width: '90px',
                        align: 'center',
                      },
                    ]}
                    data={products}
                  />
                </div>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  )
};

export default OrgConfiguration;
