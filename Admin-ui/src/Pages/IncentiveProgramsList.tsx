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

export type ProgramsListRow = {
  id: number
  name: string
  description: string
  category: string
  effectiveFrom: string
  effectiveTo: string
  programType: string
  raw: Record<string, unknown>
}

/** Capitalize only the first character; leave the rest unchanged. */
function capitalizeFirstLetter(value: string): string {
  const s = value.trim()
  if (!s) return value
  return s.charAt(0).toUpperCase() + s.slice(1)
}

function extractProgramsArray(payload: unknown): unknown[] {
  if (!payload || typeof payload !== 'object') return []
  const root = payload as Record<string, unknown>
  const body = (root.responseBody ?? root) as Record<string, unknown> | unknown[]

  if (Array.isArray(body)) return body

  if (body && typeof body === 'object') {
    const o = body as Record<string, unknown>
    const keys = ['programs', 'items', 'incentivePrograms', 'programList', 'data']
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

function normalizeProgramRow(row: Record<string, unknown>): ProgramsListRow | null {
  const idRaw =
    row.programId ?? row.programID ?? row.id ?? row.Id ?? row.ProgramId ?? row.incentiveProgramId
  const id = typeof idRaw === 'number' ? idRaw : Number(idRaw)
  if (!Number.isFinite(id) || id <= 0) return null

  const name = String(
    row.programName ?? row.name ?? row.Name ?? row.programTitle ?? '—',
  ).trim() || '—'

  const description = String(row.description ?? row.Description ?? '').trim()

  const category = String(
    row.programCategory ?? row.category ?? row.Category ?? '',
  ).trim()

  const effectiveFrom = formatDate(
    row.effectiveFrom ?? row.startDate ?? row.StartDate ?? row.fromDate,
  )
  const effectiveTo = formatDate(
    row.effectiveTo ?? row.endDate ?? row.EndDate ?? row.toDate,
  )

  const programType = String(
    row.programType ?? row.ProgramType ?? '',
  ).trim()

  return {
    id,
    name,
    description,
    category,
    effectiveFrom,
    effectiveTo,
    programType,
    raw: row,
  }
}

export default function IncentiveProgramsList() {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [localError, setLocalError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [pageSize] = useState(10)

  const encryptionEnabled = useEncryption()
  const keyReady = !!encryptionService.getHrm_Key()
  const canFetch = !encryptionEnabled || keyReady

  const {
    data,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['incentive-programs-list', page, pageSize],
    enabled: canFetch,
    queryFn: () => incentiveService.getPrograms({ pageNumber: page, pageSize }),
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
    const rawList = extractProgramsArray(data)
    const normalized: ProgramsListRow[] = []
    for (const item of rawList) {
      if (!item || typeof item !== 'object') continue
      const n = normalizeProgramRow(item as Record<string, unknown>)
      if (n) normalized.push(n)
    }
    return normalized
  }, [data])

  const filteredRows = useMemo(() => {
    const q = searchTerm.trim().toLowerCase()
    if (!q) return rows
    return rows.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.category.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q),
    )
  }, [rows, searchTerm])

  useEffect(() => {
    if (isError) {
      const msg =
        (error as Error)?.message || 'Failed to load programs'
      setLocalError(msg)
    } else {
      setLocalError(null)
    }
  }, [isError, error])

  const rowsWithSrNo = useMemo(() => {
    const offset = (currentPage - 1) * currentPageSize
    return filteredRows.map((r, idx) => ({ ...r, srNo: offset + idx + 1 }))
  }, [filteredRows, currentPage, currentPageSize])

  const columns = [
    {
      header: 'Sr No',
      width: '8%',
      accessor: 'srNo',
      align: 'center' as const,
    },
    {
      header: 'Program name',
      width: '22%',
      accessor: (row: ProgramsListRow) => (
        <span className="font-medium text-neutral-900">{capitalizeFirstLetter(row.name)}</span>
      ),
    },
    // {
    //   header: 'Description',
    //   width: '14%',
    //   accessor: (row: ProgramsListRow) => (
    //     <span className="text-neutral-700">{row.description || '—'}</span>
    //   ),
    // },
    {
      header: 'From',
      width: '11%',
      accessor: (row: ProgramsListRow) => (
        <span className="text-neutral-700">{row.effectiveFrom}</span>
      ),
    },
    {
      header: 'To',
      width: '11%',
      accessor: (row: ProgramsListRow) => (
        <span className="text-neutral-700">{row.effectiveTo}</span>
      ),
    },
    // {
    //   header: 'Type',
    //   width: '12%',
    //   accessor: (row: ProgramsListRow) => (
    //     <span className="text-neutral-700">{row.programType || '—'}</span>
    //   ),
    // },

    {
      header: 'Actions',
      width: '12%',
      accessor: (row: ProgramsListRow) => (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-1.5"
          onClick={() =>
            navigate({
              to: '/search/incentive/program-config',
              search: { programId: row.id },
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
      <div className="p-6">
        <p className="text-red-600">{localError}</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen w-full py-4">
      <div className="w-full max-w-none px-4">
        <Card className="rounded-lg border border-neutral-200 shadow-sm">
          <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-4 space-y-0 pb-4">
            <CardTitle className="text-xl font-semibold text-neutral-900">
              Incentive programs
            </CardTitle>
            <div className="flex flex-wrap items-center gap-2">
              <Input
                label=""
                variant="searchVariant"
                placeholder="Search programs…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="min-w-[200px]"
              />
              <Button
                type="button"
                variant="blue"
                onClick={() =>
                  navigate({ to: '/search/incentive/program-config' })
                }
              >
                Create new program
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={columns}
              data={rowsWithSrNo}
              noDataMessage="No programs found"
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
