import { FiTrash2 } from 'react-icons/fi'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Button from '@/components/ui/button'
import type { QueryFieldConfig, QueryRuleNode } from './types'
import { operatorsForField } from './defaults'

const NULLISH_OPS = new Set(['IS NULL', 'IS NOT NULL'])

interface RuleProps {
  rule: QueryRuleNode
  fields: QueryFieldConfig[]
  onChange: (patch: Partial<QueryRuleNode>) => void
  onRemove: () => void
  canRemove: boolean
}

function fieldByName(fields: QueryFieldConfig[], name: string): QueryFieldConfig | undefined {
  return fields.find((f) => f.name === name)
}

export function Rule({ rule, fields, onChange, onRemove, canRemove }: RuleProps) {
  const cfg = fieldByName(fields, rule.field)
  const ops = operatorsForField(cfg)
  const hideValues = NULLISH_OPS.has(rule.operator)
  const isBetween = rule.operator.toUpperCase() === 'BETWEEN'
  const isInFamily = rule.operator.toUpperCase() === 'IN' || rule.operator.toUpperCase() === 'NOT IN'
  const isLikeFamily =
    rule.operator.toUpperCase() === 'LIKE' || rule.operator.toUpperCase() === 'NOT LIKE'

  const handleFieldChange = (name: string) => {
    const next = fieldByName(fields, name)
    const nextOps = operatorsForField(next)
    onChange({
      field: name,
      operator: nextOps[0] ?? '=',
      value: '',
      value2: undefined,
    })
  }

  const renderValue = () => {
    if (hideValues) return null

    if (isBetween) {
      if (cfg?.type === 'date') {
        return (
          <div className="flex flex-wrap items-end gap-2">
            <div className="min-w-[140px] flex-1">
              <Label className="text-[10px] text-neutral-500">From</Label>
              <Input
                label=""
                variant="outlined"
                type="date"
                className="text-sm"
                value={rule.value != null ? String(rule.value).slice(0, 10) : ''}
                onChange={(e) => onChange({ value: e.target.value })}
              />
            </div>
            <div className="min-w-[140px] flex-1">
              <Label className="text-[10px] text-neutral-500">To</Label>
              <Input
                label=""
                variant="outlined"
                type="date"
                className="text-sm"
                value={rule.value2 != null ? String(rule.value2).slice(0, 10) : ''}
                onChange={(e) => onChange({ value2: e.target.value })}
              />
            </div>
          </div>
        )
      }
      return (
        <div className="flex flex-wrap gap-2">
          <Input
            label=""
            variant="outlined"
            className="min-w-[100px] flex-1 text-sm"
            placeholder={cfg?.type === 'number' ? 'Min' : 'Start'}
            type={cfg?.type === 'number' ? 'number' : 'text'}
            value={rule.value ?? ''}
            onChange={(e) =>
              onChange({
                value: cfg?.type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value,
              })
            }
          />
          <Input
            label=""
            variant="outlined"
            className="min-w-[100px] flex-1 text-sm"
            placeholder={cfg?.type === 'number' ? 'Max' : 'End'}
            type={cfg?.type === 'number' ? 'number' : 'text'}
            value={rule.value2 ?? ''}
            onChange={(e) =>
              onChange({
                value2: cfg?.type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value,
              })
            }
          />
        </div>
      )
    }

    if (isInFamily) {
      return (
        <div className="min-w-[180px] flex-1">
          <Input
            label=""
            variant="outlined"
            className="font-mono text-sm"
            placeholder="a, b, c"
            value={rule.value ?? ''}
            onChange={(e) => onChange({ value: e.target.value })}
          />
          <p className="mt-0.5 text-[10px] text-neutral-400">Comma-separated values</p>
        </div>
      )
    }

    if (cfg?.type === 'select' && cfg.options?.length) {
      const v = String(rule.value ?? '')
      return (
        <div className="min-w-[160px] flex-1">
          <Select value={v} onValueChange={(val) => onChange({ value: val })}>
            <SelectTrigger className="h-9 text-sm">
              <SelectValue placeholder="Value" />
            </SelectTrigger>
            <SelectContent>
              {cfg.options.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )
    }

    if (cfg?.type === 'date' && !isLikeFamily) {
      return (
        <div className="min-w-[160px] flex-1">
          <Input
            label=""
            variant="outlined"
            type="date"
            className="text-sm"
            value={rule.value != null ? String(rule.value).slice(0, 10) : ''}
            onChange={(e) => onChange({ value: e.target.value })}
          />
        </div>
      )
    }

    return (
      <Input
        label=""
        variant="outlined"
        className="min-w-[120px] flex-1 text-sm"
        type={cfg?.type === 'number' ? 'number' : 'text'}
        placeholder="Value"
        value={rule.value ?? ''}
        onChange={(e) =>
          onChange({
            value: cfg?.type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value,
          })
        }
      />
    )
  }

  if (!fields.length) {
    return (
      <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
        No fields available. Load field config from the API or select KPIs that define metrics.
      </div>
    )
  }

  return (
    <div className="flex flex-wrap items-start gap-2 rounded-lg border border-neutral-200 bg-white p-2.5 shadow-sm">
      <div className="min-w-[140px] flex-1">
        <Label className="sr-only">Field</Label>
        <Select value={rule.field} onValueChange={handleFieldChange}>
          <SelectTrigger className="h-9 text-sm">
            <SelectValue placeholder="Field" />
          </SelectTrigger>
          <SelectContent>
            {fields.map((f) => (
              <SelectItem key={f.name} value={f.name}>
                {f.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="min-w-[120px]">
        <Label className="sr-only">Operator</Label>
        <Select
          value={rule.operator}
          onValueChange={(op) =>
            onChange({
              operator: op,
              value: NULLISH_OPS.has(op) ? null : rule.value,
              value2: op.toUpperCase() === 'BETWEEN' ? rule.value2 : undefined,
            })
          }
        >
          <SelectTrigger className="h-9 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ops.map((op) => (
              <SelectItem key={op} value={op}>
                {op}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {!hideValues && <div className="min-w-[120px] flex-[2]">{renderValue()}</div>}

      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-9 shrink-0 text-neutral-400 hover:text-red-600"
        disabled={!canRemove}
        onClick={onRemove}
        aria-label="Remove rule"
      >
        <FiTrash2 className="h-4 w-4" />
      </Button>
    </div>
  )
}
