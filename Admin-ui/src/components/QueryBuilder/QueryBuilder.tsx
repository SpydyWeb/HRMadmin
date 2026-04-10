import React, { useState } from 'react'
import { FiCode, FiFilter } from 'react-icons/fi'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import type { QueryGroup as QueryGroupType, FieldDef } from './types'
import { DEFAULT_FIELDS, createGroup } from './types'
import QueryGroup from './QueryGroup'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface QueryBuilderProps {
  /** Current query value (JSON tree). If undefined a default empty group is used. */
  query?: QueryGroupType
  /** Called on every change with the updated query tree. */
  onChange: (query: QueryGroupType) => void
  /** Extra field definitions (e.g. KPI fields) to merge with the default fields. */
  extraFields?: FieldDef[]
}

// ─── Component ────────────────────────────────────────────────────────────────

const QueryBuilder: React.FC<QueryBuilderProps> = ({
  query,
  onChange,
  extraFields = [],
}) => {
  const [showJson, setShowJson] = useState(false)

  // Merge default example fields with any extra fields (KPI fields, etc.)
  const allFields: FieldDef[] = React.useMemo(() => {
    const seen = new Set<string>()
    const merged: FieldDef[] = []
    for (const f of [...DEFAULT_FIELDS, ...extraFields]) {
      if (!seen.has(f.name)) {
        seen.add(f.name)
        merged.push(f)
      }
    }
    return merged
  }, [extraFields])

  // Initialise with a single empty group if nothing has been passed
  const rootGroup: QueryGroupType = query ?? createGroup('AND')

  return (
    <Card className="rounded-lg border border-neutral-200">
      <CardHeader className="px-4 pb-2 pt-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <FiFilter className="h-4 w-4 text-blue-500" />
            <CardTitle className="text-base">Query Builder</CardTitle>
          </div>
          <button
            type="button"
            onClick={() => setShowJson((v) => !v)}
            className="flex items-center gap-1 rounded border border-neutral-300 bg-white px-2.5 py-1 text-xs font-medium text-neutral-600 transition hover:bg-neutral-50"
            title={showJson ? 'Hide JSON' : 'View JSON'}
          >
            <FiCode className="h-3 w-3" />
            {showJson ? 'Hide JSON' : 'View JSON'}
          </button>
        </div>
        <p className="mt-0.5 text-xs text-neutral-500">
          Visually build a filter expression using AND/OR combinators and nested groups. The
          resulting JSON query is used to identify qualifying sales personnel.
        </p>
      </CardHeader>

      <CardContent className="space-y-4 px-4 pb-4">
        {/* Available fields reference */}
        {allFields.length > 0 && (
          <div>
            <Label className="mb-1.5 block text-xs font-semibold text-neutral-600">
              Available Fields
            </Label>
            <div className="flex flex-wrap gap-1.5">
              {allFields.map((f) => (
                <span
                  key={f.name}
                  title={f.description ?? f.label}
                  className="cursor-default rounded border border-teal-200 bg-teal-50 px-2 py-0.5 font-mono text-xs text-teal-800"
                >
                  {f.name}
                  {f.type ? (
                    <span className="ml-1 text-teal-500">({f.type})</span>
                  ) : null}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Root query group */}
        <QueryGroup
          group={rootGroup}
          fields={allFields}
          depth={0}
          onChange={onChange}
        />

        {/* JSON preview panel */}
        {showJson && (
          <div className="rounded-lg border border-blue-100 bg-blue-50 p-3">
            <p className="mb-2 text-xs font-semibold text-blue-700">Query JSON:</p>
            <pre className="overflow-x-auto whitespace-pre-wrap break-all font-mono text-xs text-neutral-700">
              {JSON.stringify(rootGroup, null, 2)}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default QueryBuilder
