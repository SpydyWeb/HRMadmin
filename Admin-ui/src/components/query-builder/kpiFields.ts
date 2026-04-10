import type { IKpi } from '@/models/incentive'
import type { QueryFieldConfig } from './types'
import { toVarName } from './kpiFieldsShared'

export { toVarName } from './kpiFieldsShared'

/**
 * Builds dynamic field config from a KPI (data sources, group-by dimensions).
 * Shape matches what an API could return as `fields[]`.
 */
export function buildFieldsFromKpi(kpi: IKpi): QueryFieldConfig[] {
  const out: QueryFieldConfig[] = []

  kpi.groupBy.forEach((g, i) => {
    const name = toVarName(g) || `group_${i}`
    out.push({
      name: `${name}_${i}`,
      label: g,
      type: 'string',
    })
  })

  kpi.dataSources.forEach((ds, i) => {
    const base = `${toVarName(ds.object)}_${toVarName(ds.field)}_${i}`
    out.push({
      name: base || `metric_${i}`,
      label: `${ds.object} · ${ds.field} (${ds.aggregation})`,
      type: 'number',
    })
  })

  return out
}

/**
 * Merges fields from multiple KPIs for the global “selection” expression tab.
 * Namespaced to reduce collisions.
 */
export function buildFieldsFromSelectedKpis(
  kpiIds: string[],
  library: IKpi[],
): QueryFieldConfig[] {
  const seen = new Set<string>()
  const merged: QueryFieldConfig[] = []

  for (const id of kpiIds) {
    const kpi = library.find((k) => k.id === id)
    if (!kpi) continue
    const prefix = toVarName(kpi.name)
    for (const f of buildFieldsFromKpi(kpi)) {
      const name = `${prefix}_${f.name}`
      if (seen.has(name)) continue
      seen.add(name)
      merged.push({
        ...f,
        name,
        label: `${kpi.name}: ${f.label}`,
      })
    }
  }

  return merged
}
