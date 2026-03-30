import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Button from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

// ─── Types ────────────────────────────────────────────────────────────────────

interface WeightageRecord {
  id: number
  weightageName: string
  productCode: string
  createdBy: string
  isActive: boolean
}

interface FormState {
  weightageName: string
  productCode: string
}

const EMPTY_FORM: FormState = { weightageName: '', productCode: '' }

// ─── Initial Mock Data ────────────────────────────────────────────────────────

const INITIAL_DATA: WeightageRecord[] = [
  { id: 1, weightageName: 'Life Insurance Weightage', productCode: 'LI-001', createdBy: 'Admin', isActive: true },
  { id: 2, weightageName: 'Health Plan Weightage', productCode: 'HP-042', createdBy: 'John Smith', isActive: true },
  { id: 3, weightageName: 'Motor Cover Weightage', productCode: 'MC-017', createdBy: 'Priya Sharma', isActive: false },
  { id: 4, weightageName: 'Term Plan Weightage', productCode: 'TP-009', createdBy: 'Admin', isActive: true },
]

// ─── Confirmation Dialog (Inline) ─────────────────────────────────────────────

interface ConfirmDialogProps {
  message: string
  onConfirm: () => void
  onCancel: () => void
}

const ConfirmDialog = ({ message, onConfirm, onCancel }: ConfirmDialogProps) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center">
    <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
    <div className="relative z-10 w-full max-w-sm rounded-xl bg-white shadow-2xl p-6">
      <div className="flex items-start gap-4">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-red-100">
          <svg className="h-5 w-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-gray-900 mb-1">Confirm Action</h3>
          <p className="text-sm text-gray-600">{message}</p>
        </div>
      </div>
      <div className="mt-5 flex justify-end gap-2">
        <Button variant="outline" size="sm" onClick={onCancel}>Cancel</Button>
        <Button variant="red" size="sm" onClick={onConfirm}>Confirm</Button>
      </div>
    </div>
  </div>
)

// ─── Add / Edit Modal (Inline) ────────────────────────────────────────────────

interface WeightageModalProps {
  title: string
  form: FormState
  errors: Partial<FormState>
  onChange: (field: keyof FormState, value: string) => void
  onSubmit: () => void
  onClose: () => void
}

const WeightageModal = ({ title, form, errors, onChange, onSubmit, onClose }: WeightageModalProps) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center">
    <div className="absolute inset-0 bg-black/40" onClick={onClose} />
    <div className="relative z-10 w-full max-w-md rounded-xl bg-white shadow-2xl">
      {/* Modal Header */}
      <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
        <h2 className="text-base font-semibold text-gray-900">{title}</h2>
        <button
          onClick={onClose}
          className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Modal Body */}
      <div className="px-6 py-5 space-y-4">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1.5">
            Weightage Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={form.weightageName}
            onChange={(e) => onChange('weightageName', e.target.value)}
            placeholder="e.g. Life Insurance Weightage"
            className={`w-full rounded-md border px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors
              ${errors.weightageName ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-white hover:border-gray-400'}`}
          />
          {errors.weightageName && (
            <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
              <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {errors.weightageName}
            </p>
          )}
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1.5">
            Product Code <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={form.productCode}
            onChange={(e) => onChange('productCode', e.target.value)}
            placeholder="e.g. LI-001"
            className={`w-full rounded-md border px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors
              ${errors.productCode ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-white hover:border-gray-400'}`}
          />
          {errors.productCode && (
            <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
              <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {errors.productCode}
            </p>
          )}
        </div>
      </div>

      {/* Modal Footer */}
      <div className="flex justify-end gap-2 border-t border-gray-200 px-6 py-4">
        <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
        <Button variant="default" size="sm" onClick={onSubmit}>Save</Button>
      </div>
    </div>
  </div>
)

// ─── Main Page ────────────────────────────────────────────────────────────────

const ProductWeightage = () => {
  const [records, setRecords] = useState<WeightageRecord[]>(INITIAL_DATA)
  const [nextId, setNextId] = useState<number>(5)

  // Modal state
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [formErrors, setFormErrors] = useState<Partial<FormState>>({})

  // Confirm dialog state
  const [confirmConfig, setConfirmConfig] = useState<{
    message: string
    onConfirm: () => void
  } | null>(null)

  // ── Form Helpers ──

  const validate = (): boolean => {
    const errors: Partial<FormState> = {}
    if (!form.weightageName.trim()) errors.weightageName = 'Weightage name is required'
    if (!form.productCode.trim()) errors.productCode = 'Product code is required'
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const openAddModal = () => {
    setEditingId(null)
    setForm(EMPTY_FORM)
    setFormErrors({})
    setModalOpen(true)
  }

  const openEditModal = (record: WeightageRecord) => {
    setEditingId(record.id)
    setForm({ weightageName: record.weightageName, productCode: record.productCode })
    setFormErrors({})
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setEditingId(null)
    setForm(EMPTY_FORM)
    setFormErrors({})
  }

  const handleFormChange = (field: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (formErrors[field]) setFormErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  const handleSubmit = () => {
    if (!validate()) return

    if (editingId !== null) {
      setRecords((prev) =>
        prev.map((r) =>
          r.id === editingId
            ? { ...r, weightageName: form.weightageName.trim(), productCode: form.productCode.trim() }
            : r
        )
      )
    } else {
      const newRecord: WeightageRecord = {
        id: nextId,
        weightageName: form.weightageName.trim(),
        productCode: form.productCode.trim(),
        createdBy: 'Admin',
        isActive: true,
      }
      setRecords((prev) => [...prev, newRecord])
      setNextId((n) => n + 1)
    }

    closeModal()
  }

  // ── Delete / Toggle ──

  const confirmDelete = (id: number, name: string) => {
    setConfirmConfig({
      message: `Are you sure you want to delete "${name}"? This action cannot be undone.`,
      onConfirm: () => {
        setRecords((prev) => prev.filter((r) => r.id !== id))
        setConfirmConfig(null)
      },
    })
  }

  const confirmToggle = (id: number, currentStatus: boolean) => {
    const action = currentStatus ? 'deactivate' : 'activate'
    setConfirmConfig({
      message: `Are you sure you want to ${action} this weightage record?`,
      onConfirm: () => {
        setRecords((prev) =>
          prev.map((r) => (r.id === id ? { ...r, isActive: !r.isActive } : r))
        )
        setConfirmConfig(null)
      },
    })
  }

  const activeCount = records.filter((r) => r.isActive).length

  return (
    <div className="flex flex-col gap-6 p-6 bg-gray-50 min-h-screen">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Product Weightage</h1>
          <p className="text-sm text-gray-500 mt-1">Manage product weightage records for incentive calculations</p>
        </div>
        <Button variant="default" size="sm" onClick={openAddModal} icon={
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        }>
          Add Weightage
        </Button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Records', value: records.length, borderClass: 'border-blue-100', textClass: 'text-blue-600' },
          { label: 'Active', value: activeCount, borderClass: 'border-green-100', textClass: 'text-green-600' },
          { label: 'Inactive', value: records.length - activeCount, borderClass: 'border-gray-100', textClass: 'text-gray-600' },
          { label: 'Recently Added', value: 1, borderClass: 'border-purple-100', textClass: 'text-purple-600' },
        ].map(({ label, value, borderClass, textClass }) => (
          <div key={label} className={`rounded-lg border bg-white px-4 py-3 shadow-sm ${borderClass}`}>
            <p className="text-xs text-gray-500 font-medium">{label}</p>
            <p className={`text-2xl font-bold mt-1 ${textClass}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Table Card */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold text-gray-800">Weightage Records</CardTitle>
            <span className="text-xs text-gray-400">{records.length} total</span>
          </div>
        </CardHeader>
        <CardContent className="pt-0 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-4 py-3 text-left font-medium text-gray-600">Weightage Name</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Product Code</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Created By</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Status</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {records.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-16 text-center">
                    <svg className="mx-auto h-12 w-12 text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="text-sm font-medium text-gray-500">No weightage records found</p>
                    <p className="text-xs text-gray-400 mt-1">Click "Add Weightage" to create one</p>
                  </td>
                </tr>
              ) : (
                records.map((record) => (
                  <tr key={record.id} className="border-b border-gray-100 hover:bg-blue-50 transition-colors group">
                    <td className="px-4 py-3">
                      <span className="font-medium text-gray-800">{record.weightageName}</span>
                    </td>
                    <td className="px-4 py-3">
                      <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs font-mono text-gray-700">
                        {record.productCode}
                      </code>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{record.createdBy}</td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={record.isActive ? 'default' : 'secondary'}
                        className={record.isActive
                          ? 'bg-green-100 text-green-700 hover:bg-green-100'
                          : 'bg-gray-100 text-gray-500 hover:bg-gray-100'}
                      >
                        {record.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Edit */}
                        <button
                          onClick={() => openEditModal(record)}
                          className="rounded-md p-1.5 text-gray-400 hover:bg-blue-100 hover:text-blue-600 transition-colors"
                          title="Edit"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>

                        {/* Toggle Active/Inactive */}
                        <button
                          onClick={() => confirmToggle(record.id, record.isActive)}
                          className={`rounded-md p-1.5 transition-colors
                            ${record.isActive
                              ? 'text-gray-400 hover:bg-orange-100 hover:text-orange-600'
                              : 'text-gray-400 hover:bg-green-100 hover:text-green-600'}`}
                          title={record.isActive ? 'Deactivate' : 'Activate'}
                        >
                          {record.isActive ? (
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                            </svg>
                          ) : (
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          )}
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() => confirmDelete(record.id, record.weightageName)}
                          className="rounded-md p-1.5 text-gray-400 hover:bg-red-100 hover:text-red-600 transition-colors"
                          title="Delete"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Add / Edit Modal */}
      {modalOpen && (
        <WeightageModal
          title={editingId !== null ? 'Edit Weightage' : 'Add Weightage'}
          form={form}
          errors={formErrors}
          onChange={handleFormChange}
          onSubmit={handleSubmit}
          onClose={closeModal}
        />
      )}

      {/* Confirm Dialog */}
      {confirmConfig && (
        <ConfirmDialog
          message={confirmConfig.message}
          onConfirm={confirmConfig.onConfirm}
          onCancel={() => setConfirmConfig(null)}
        />
      )}
    </div>
  )
}

export default ProductWeightage
