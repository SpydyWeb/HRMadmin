import { useMemo, useState, useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { FiEdit2 } from 'react-icons/fi'

import DataTable from '@/components/table/DataTable'
import Button from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import Loader from '@/components/Loader'
import { Pagination } from '@/components/table/Pagination'
import { incentiveService } from '@/services/incentiveService'
import { useEncryption } from '@/store/encryptionStore'
import encryptionService from '@/services/encryptionService'

export type KpiListRow = {
  id: number
  name: string
  kpiCode: string
  createdOn: string
  raw: Record<string, unknown>
}

/** Align with GetKpisList / program config extraction (kpiLibrary, kpis, …). */
function extractKpisArray(payload: unknown): unknown[] {
  if (!payload || typeof payload !== 'object') return []
  const root = payload as Record<string, unknown>
  const body = (root.responseBody ?? root) as Record<string, unknown> | unknown[]

  if (Array.isArray(body)) return body

  if (body && typeof body === 'object') {
    const o = body as Record<string, unknown>
    const keys = ['kpiLibrary', 'kpis', 'kpiList', 'items', 'data']
    for (const k of keys) {
      const a = o[k]
      if (Array.isArray(a)) return a
    }
    for (const v of Object.values(o)) {
      if (Array.isArray(v) && v.length && typeof v[0] === 'object') return v as unknown[]
    }
  }

  return []
}

function formatDate(value: unknown): string {
  if (value == null || value === '') return '—'
  const d = new Date(String(value))
  if (Number.isNaN(d.getTime())) return String(value)
  return d.toLocaleDateString()
}

function normalizeKpiRow(row: Record<string, unknown>): KpiListRow | null {
  const idRaw =
    row.kpiId ?? row.id ?? row.KpiId ?? row.Id ?? row.weightageId ?? row.weightageID
  const id = typeof idRaw === 'number' ? idRaw : Number(idRaw)
  if (!Number.isFinite(id) || id <= 0) return null

  const name = String(
    row.kpiName ?? row.name ?? row.Name ?? row.weightageName ?? '—',
  ).trim() || '—'

  const kpiCode = String(
    row.kpiCode ?? row.code ?? row.KpiCode ?? row.Code ?? '',
  ).trim()

  const createdOn = formatDate(
    row.createdAt ?? row.createdOn ?? row.createdDate ?? row.CreatedAt ?? row.CreatedOn,
  )

  return { id, name, kpiCode, createdOn, raw: row }
}

export default function IncentiveKpiList() {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [localError, setLocalError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [pageSize] = useState(10)

  const encryptionEnabled = useEncryption()
  const keyReady = !!encryptionService.getHrm_Key()
  const canFetch = !encryptionEnabled || keyReady

  function capitalizeFirstLetter(value: string): string {
    const s = value.trim()
    if (!s) return value
    return s.charAt(0).toUpperCase() + s.slice(1)
  }

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['incentive-kpis-list', page, pageSize],
    enabled: canFetch,
    queryFn: () => incentiveService.getKpisList({ pageNumber: page, pageSize }),
    staleTime: 1000 * 60 * 2,
    refetchOnWindowFocus: false,
    retry: 1,
  })

  const pagination = (data as any)?.responseBody?.pagination ?? {}
  const totalCount = Number(pagination?.totalCount ?? 0)
  const currentPage = Number(pagination?.pageNumber ?? page)
  const currentPageSize = Number(pagination?.pageSize ?? pageSize)
  const totalPages =
    currentPageSize > 0 ? Math.max(1, Math.ceil(totalCount / currentPageSize)) : 1

  const rows = useMemo(() => {
    const rawList = extractKpisArray(data)
    const out: KpiListRow[] = []
    for (const item of rawList) {
      if (!item || typeof item !== 'object') continue
      const n = normalizeKpiRow(item as Record<string, unknown>)
      if (n) out.push(n)
    }
    return out
  }, [data])

  const filteredRows = useMemo(() => {
    const q = searchTerm.trim().toLowerCase()
    if (!q) return rows
    return rows.filter((r) => r.name.toLowerCase().includes(q) || String(r.id).includes(q))
  }, [rows, searchTerm])

  const displayRows = useMemo(() => {
    const baseIndex = (currentPage - 1) * currentPageSize
    return filteredRows.map((r, idx) => ({ ...r, srNo: baseIndex + idx + 1 }))
  }, [filteredRows, currentPage, currentPageSize])

  useEffect(() => {
    if (isError) {
      setLocalError((error as Error)?.message || 'Failed to load KPIs')
    } else {
      setLocalError(null)
    }
  }, [isError, error])

  const columns = [
    {
      header: 'Sr No',
      width: '10%',
      accessor: (row: any) => (
        <span className="font-mono text-sm text-neutral-700">{row.srNo}</span>
      ),
    },
    {
      header: 'Name',
      width: '48%',
      accessor: (row: KpiListRow) => (
        <span className="font-medium text-neutral-900">{capitalizeFirstLetter(row.name)}</span>
      ),
    },
    {
      header: 'Kpi Code',
      width: '20%',
      accessor: (row: KpiListRow) => (
        <span className="font-mono text-sm text-neutral-700">{row.kpiCode || '—'}</span>
      ),
    },

    {
      header: 'Created On',
      width: '10%',
      accessor: (row: KpiListRow) => (
        <span className="text-neutral-700">{row.createdOn}</span>
      ),
    },
    {
      header: 'Actions',
      width: '12%',
      // align: 'right' as const,
      accessor: (row: KpiListRow) => (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-1.5"
          onClick={() =>
            navigate({
              to: '/search/incentive/kpi-builder',
              search: { kpiId: row.id, kpiName: row.name },
            })
          }
        >
          <FiEdit2 className="h-3.5 w-3.5" />
          Edit
        </Button>
      ),
    },
  ]

  if (isLoading) return <Loader />
  if (localError) {
    return (
      <div className="w-full p-6">
        <p className="text-red-600">{localError}</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen w-full py-4">
      <div className="w-full max-w-none px-4">
        <Card className="w-full rounded-lg border border-neutral-200 shadow-sm">
          <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-4 space-y-0 pb-4">
            <CardTitle className="text-xl font-semibold text-neutral-900">KPIs</CardTitle>
            <div className="flex flex-wrap items-center gap-2">
              <Input
                label=""
                variant="searchVariant"
                placeholder="Search by name or ID…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="min-w-[200px]"
              />
              <Button
                type="button"
                variant="blue"
                onClick={() =>
                  navigate({
                    to: '/search/incentive/kpi-builder',
                  })
                }
              >
                New KPI
              </Button>
            </div>
          </CardHeader>
          <CardContent className="w-full">
            <DataTable
              columns={columns}
              data={displayRows}
              noDataMessage="No KPIs found"
            />
            <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
              <span className="text-sm font-medium text-neutral-600">
                Page {currentPage} of {totalPages} ({totalCount} total)
              </span>
              <Pagination
                totalPages={totalPages}
                currentPage={currentPage}
                onPageChange={(p) => setPage(p)}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
