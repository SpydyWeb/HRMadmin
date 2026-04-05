import { useCallback, useState } from 'react'
import { FiPlus, FiTrash2 } from 'react-icons/fi'
import { parse } from 'date-fns'
import { useNavigate } from '@tanstack/react-router'

import Button from '@/components/ui/button'
import DatePicker from '@/components/ui/date-picker'
import { Input } from '@/components/ui/input'
import { incentiveService } from '@/services/incentiveService'
import { showToast } from '@/components/ui/sonner'
import { NOTIFICATION_CONSTANTS } from '@/utils/constant'

const DIMENSION_COUNT = 10

type ProductRow = {
  id: string
  productCode: string
  version: string
  weightage: string
  dimensions: string[]
}

function emptyDimensions(): string[] {
  return Array.from({ length: DIMENSION_COUNT }, () => '')
}

export default function ProductWeightage() {
  const navigate = useNavigate()
  const [weightName, setWeightName] = useState('')
  const [startDate, setStartDate] = useState<string | null>(null)
  const [endDate, setEndDate] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [masterReady, setMasterReady] = useState(false)
  const [products, setProducts] = useState<ProductRow[]>([])

  const hasMaster = masterReady

  const toIso = useCallback((value: string | null) => {
    if (!value) return null
    const parsed = parse(value, 'dd LLL yyyy', new Date())
    if (Number.isNaN(parsed.getTime())) return null
    return parsed.toISOString()
  }, [])

  const handleCreate = async () => {
    const name = weightName.trim()
    if (!name) {
      showToast(NOTIFICATION_CONSTANTS.ERROR, 'Weight Name is required')
      return
    }
    const startDateIso = toIso(startDate)
    const endDateIso = toIso(endDate)
    if (!startDateIso) {
      showToast(NOTIFICATION_CONSTANTS.ERROR, 'Start Date is required')
      return
    }
    if (!endDateIso) {
      showToast(NOTIFICATION_CONSTANTS.ERROR, 'End Date is required')
      return
    }

    setIsCreating(true)
    try {
      await incentiveService.upsertWeightageMaster({
        weightageName: name,
        startDate: startDateIso,
        endDate: endDateIso,
      })
      setMasterReady(true)
      showToast(NOTIFICATION_CONSTANTS.SUCCESS, 'Weightage master created successfully')
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.response?.data?.errorMessage ||
        err?.message ||
        'Failed to create weightage master'
      showToast(NOTIFICATION_CONSTANTS.ERROR, message)
    } finally {
      setIsCreating(false)
    }
  }

  const addProductRow = () => {
    setProducts((prev) => [
      ...prev,
      {
        id: `${Date.now()}-${prev.length}`,
        productCode: '',
        version: '',
        weightage: '',
        dimensions: emptyDimensions(),
      },
    ])
  }

  const updateProduct = (id: string, patch: Partial<Omit<ProductRow, 'id' | 'dimensions'>>) => {
    setProducts((rows) =>
      rows.map((r) => (r.id === id ? { ...r, ...patch } : r)),
    )
  }

  const updateDimension = (id: string, dimIndex: number, value: string) => {
    setProducts((rows) =>
      rows.map((r) => {
        if (r.id !== id) return r
        const next = [...r.dimensions]
        next[dimIndex] = value
        return { ...r, dimensions: next }
      }),
    )
  }

  const removeProduct = (id: string) => {
    setProducts((rows) => rows.filter((r) => r.id !== id))
  }

  const tableHeaders = [
    'Product Code',
    'Version',
    'Weightage',
    ...Array.from({ length: DIMENSION_COUNT }, (_, i) => `Dimension ${i + 1}`),
    'Actions',
  ]

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="p-4">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-neutral-900">Product Weightage</h1>
            <p className="mt-1 text-sm text-neutral-600">
              Create a weightage master, then add product lines and dimension weights.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            className="border-neutral-400 bg-neutral-100 text-neutral-800 hover:bg-neutral-200"
            onClick={() => navigate({ to: '/search/incentive' as any })}
          >
            Back to Incentive
          </Button>
        </div>

        <div className="rounded-lg border-2 border-emerald-600/80 bg-emerald-50/60 p-4 shadow-sm">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_1fr_1fr_auto] md:items-end">
            <Input
              label="Weight Name"
              value={weightName}
              onChange={(e) => setWeightName(e.target.value)}
              placeholder="Text Box"
              variant="standardone"
              className="bg-white"
            />
            <DatePicker
              label="Start Date"
              value={startDate}
              onChange={setStartDate}
              placeholder="mm/dd/yyyy"
            />
            <DatePicker
              label="End Date"
              value={endDate}
              onChange={setEndDate}
              placeholder="mm/dd/yyyy"
            />
            <div className="flex justify-end md:pb-0.5">
              <Button
                type="button"
                variant="green"
                onClick={handleCreate}
                isLoading={isCreating}
                disabled={isCreating}
                loadingText="Creating..."
                className="min-w-[120px] rounded-md"
              >
                Create
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <Button
            type="button"
            variant="outline"
            className="border-neutral-400 bg-neutral-200 text-neutral-800 hover:bg-neutral-300"
            onClick={addProductRow}
            disabled={!hasMaster}
            icon={<FiPlus className="h-4 w-4" />}
          >
            Add Product
          </Button>
        </div>

        <div className="mt-4 overflow-x-auto rounded-md border border-neutral-200 bg-white shadow-sm">
          <table className="w-full min-w-[1200px] border-collapse text-sm">
            <thead>
              <tr className="bg-[#1e3a5f] text-left text-white">
                {tableHeaders.map((h) => (
                  <th key={h} className="whitespace-nowrap px-3 py-3 font-semibold">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {!hasMaster ? (
                <tr>
                  <td
                    colSpan={tableHeaders.length}
                    className="px-4 py-16 text-center text-neutral-400"
                  >
                    Create a Weightage Master first.
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td
                    colSpan={tableHeaders.length}
                    className="px-4 py-10 text-center text-neutral-500"
                  >
                    No products yet. Use &quot;Add Product&quot; to add a row.
                  </td>
                </tr>
              ) : (
                products.map((row) => (
                  <tr key={row.id} className="border-t border-neutral-200">
                    <td className="p-2">
                      <Input
                        label=""
                        value={row.productCode}
                        onChange={(e) => updateProduct(row.id, { productCode: e.target.value })}
                        placeholder="—"
                        variant="standardone"
                        className="min-w-[100px] bg-white text-sm"
                      />
                    </td>
                    <td className="p-2">
                      <Input
                        label=""
                        value={row.version}
                        onChange={(e) => updateProduct(row.id, { version: e.target.value })}
                        placeholder="—"
                        variant="standardone"
                        className="min-w-[80px] bg-white text-sm"
                      />
                    </td>
                    <td className="p-2">
                      <Input
                        label=""
                        value={row.weightage}
                        onChange={(e) => updateProduct(row.id, { weightage: e.target.value })}
                        placeholder="—"
                        variant="standardone"
                        className="min-w-[80px] bg-white text-sm"
                      />
                    </td>
                    {row.dimensions.map((d, i) => (
                      <td key={i} className="p-2">
                        <Input
                          label=""
                          value={d}
                          onChange={(e) => updateDimension(row.id, i, e.target.value)}
                          placeholder="—"
                          variant="standardone"
                          className="min-w-[72px] bg-white text-sm"
                        />
                      </td>
                    ))}
                    <td className="p-2 text-center">
                      <button
                        type="button"
                        className="inline-flex rounded-md p-2 text-red-600 hover:bg-red-50"
                        onClick={() => removeProduct(row.id)}
                        aria-label="Remove row"
                      >
                        <FiTrash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
