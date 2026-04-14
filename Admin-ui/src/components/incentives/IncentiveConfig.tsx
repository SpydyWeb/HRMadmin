import React, { useEffect, useMemo, useState } from 'react'
import { FiPlus, FiTrash2 } from 'react-icons/fi'
import Button from '@/components/ui/button'

interface IncentivesProbs {
  commissionConfigId?: number
  initialData?: any
  isEditMode?: boolean
  /** Optional; legacy hook when saving cron via commission API from this screen. */
  onSaveSuccess?: () => void
  /** Emitted whenever the schedule string changes (Quartz.NET, multiple joined with ` | `, or `@instant`). */
  onCronChange?: (cron: string) => void
}

/** Parent-facing token when no cron schedule applies. */
export const EXECUTION_INSTANT = '@instant'

export type ExecutionScheduleMode = 'INSTANT' | 'DAILY' | 'WEEKLY_MULTI' | 'MONTHLY'

const SCHEDULE_MODES: ReadonlyArray<{
  id: ExecutionScheduleMode
  label: string
  description: string
}> = [
  {
    id: 'INSTANT',
    label: 'Instant',
    description: 'No fixed schedule (on-demand / immediate execution path).',
  },
  {
    id: 'DAILY',
    label: 'Daily',
    description: 'Runs every day at each selected time.',
  },
  {
    id: 'WEEKLY_MULTI',
    label: 'Weekly — multiple times in a day',
    description: 'Selected weekdays; on each day the job runs at every listed time.',
  },
  {
    id: 'MONTHLY',
    label: 'Day of month (1–31)',
    description:
      'Runs on the chosen calendar day each month. If that day does not exist in a month, behavior follows your scheduler (typically the last day of that month, i.e. min of N and month length).',
  },
]

// Parse Quartz.NET cron expression (first segment if ` | `-joined)
const parseCronExpression = (cron: string) => {
  if (!cron || !cron.trim()) return null
  const first = cron.trim().split(/\s*\|\s*/)[0]?.trim()
  if (!first || first === EXECUTION_INSTANT) return null

  const parts = first.split(/\s+/)
  if (parts.length < 6) return null

  const [sec, min, hr, dayOfMonth, , dayOfWeek] = parts

  const parsed = {
    seconds: parseInt(sec, 10) || 0,
    minutes: parseInt(min, 10) || 0,
    hours: parseInt(hr, 10) || 0,
    frequency: 'DAILY' as 'DAILY' | 'WEEKLY' | 'MONTHLY',
    daysOfWeek: [] as string[],
    dayOfMonth: 1,
  }

  if (dayOfMonth === '?' && dayOfWeek !== '?') {
    parsed.frequency = 'WEEKLY'
    parsed.daysOfWeek = dayOfWeek.split(',').filter(Boolean)
  } else if (dayOfMonth !== '*' && dayOfMonth !== '?' && dayOfWeek === '?') {
    parsed.frequency = 'MONTHLY'
    parsed.dayOfMonth = parseInt(dayOfMonth, 10) || 1
  } else {
    parsed.frequency = 'DAILY'
  }

  return parsed
}

function parseTimeSlot(timeString: string): { h: number; m: number; sec: number } {
  const [hs, ms] = timeString.split(':')
  const h = parseInt(hs ?? '0', 10)
  const m = parseInt(ms ?? '0', 10)
  return {
    h: Number.isFinite(h) ? Math.min(23, Math.max(0, h)) : 0,
    m: Number.isFinite(m) ? Math.min(59, Math.max(0, m)) : 0,
    sec: 0,
  }
}

function quartzDaily(sec: number, min: number, hr: number) {
  return `${sec} ${min} ${hr} * * ?`
}

function quartzWeekly(sec: number, min: number, hr: number, days: string[]) {
  if (!days.length) return ''
  return `${sec} ${min} ${hr} ? * ${days.join(',')}`
}

function quartzMonthly(sec: number, min: number, hr: number, dayOfMonth: number) {
  const dom = Math.max(1, Math.min(31, dayOfMonth))
  return `${sec} ${min} ${hr} ${dom} * ?`
}

function generateScheduleCron(
  mode: ExecutionScheduleMode,
  timeSlots: string[],
  daysOfWeek: string[],
  dayOfMonth: number,
): string {
  if (mode === 'INSTANT') return EXECUTION_INSTANT

  const slots = timeSlots.length ? timeSlots : ['09:00']
  const crons: string[] = []

  for (const slot of slots) {
    const { h, m, sec } = parseTimeSlot(slot)
    if (mode === 'DAILY') {
      crons.push(quartzDaily(sec, m, h))
    } else if (mode === 'WEEKLY_MULTI') {
      const c = quartzWeekly(sec, m, h, daysOfWeek)
      if (c) crons.push(c)
    } else if (mode === 'MONTHLY') {
      crons.push(quartzMonthly(sec, m, h, dayOfMonth))
    }
  }

  return crons.filter(Boolean).join(' | ')
}

const IncentiveConfig: React.FC<IncentivesProbs> = ({
  initialData,
  isEditMode = false,
  onCronChange,
}) => {
  const parsedCron = initialData?.cronExpression ? parseCronExpression(initialData.cronExpression) : null

  const initialMode: ExecutionScheduleMode =
    initialData?.cronExpression === EXECUTION_INSTANT
      ? 'INSTANT'
      : parsedCron?.frequency === 'WEEKLY'
        ? 'WEEKLY_MULTI'
        : parsedCron?.frequency === 'MONTHLY'
          ? 'MONTHLY'
          : 'DAILY'

  const initialTime =
    parsedCron != null
      ? `${String(parsedCron.hours).padStart(2, '0')}:${String(parsedCron.minutes).padStart(2, '0')}`
      : '09:00'

  const [scheduleMode, setScheduleMode] = useState<ExecutionScheduleMode>(initialMode)
  const [timeSlots, setTimeSlots] = useState<string[]>([initialTime])
  const [daysOfWeek, setDaysOfWeek] = useState<string[]>(parsedCron?.daysOfWeek?.length ? parsedCron.daysOfWeek : ['MON'])
  const [dayOfMonth, setDayOfMonth] = useState<number>(parsedCron?.dayOfMonth ?? 1)

  const generatedCron = useMemo(
    () => generateScheduleCron(scheduleMode, timeSlots, daysOfWeek, dayOfMonth),
    [scheduleMode, timeSlots, daysOfWeek, dayOfMonth],
  )

  useEffect(() => {
    onCronChange?.(generatedCron)
  }, [generatedCron, onCronChange])

  useEffect(() => {
    if (isEditMode && initialData) {
      const parsed = initialData.cronExpression ? parseCronExpression(initialData.cronExpression) : null
      if (initialData.cronExpression === EXECUTION_INSTANT) {
        setScheduleMode('INSTANT')
      } else if (parsed) {
        const mode: ExecutionScheduleMode =
          parsed.frequency === 'WEEKLY'
            ? 'WEEKLY_MULTI'
            : parsed.frequency === 'MONTHLY'
              ? 'MONTHLY'
              : 'DAILY'
        setScheduleMode(mode)
        const t = `${String(parsed.hours).padStart(2, '0')}:${String(parsed.minutes).padStart(2, '0')}`
        setTimeSlots([t])
        setDaysOfWeek(parsed.daysOfWeek?.length ? parsed.daysOfWeek : ['MON'])
        setDayOfMonth(parsed.dayOfMonth)
      }
    }
  }, [isEditMode, initialData])

  const addTimeSlot = () => {
    setTimeSlots((prev) => [...prev, '12:00'])
  }

  const removeTimeSlot = (index: number) => {
    setTimeSlots((prev) => (prev.length <= 1 ? prev : prev.filter((_, i) => i !== index)))
  }

  const updateTimeSlot = (index: number, value: string) => {
    setTimeSlots((prev) => prev.map((t, i) => (i === index ? value : t)))
  }

  const getReadableSchedule = () => {
    if (scheduleMode === 'INSTANT') return 'Instant — no recurring cron.'
    if (!generatedCron || generatedCron === EXECUTION_INSTANT) return 'No recurring schedule'

    const timesLabel = timeSlots.join(', ')
    switch (scheduleMode) {
      case 'DAILY':
        return `Daily at ${timesLabel}`
      case 'WEEKLY_MULTI':
        return `Weekly on ${daysOfWeek.join(', ')} at ${timesLabel} (each day runs all times)`
      case 'MONTHLY':
        return `Monthly on day ${dayOfMonth} at ${timesLabel}`
      default:
        return 'Custom schedule'
    }
  }

  return (
    <div className="space-y-6 bg-white">
      <div className="space-y-3">
        <label className="block text-sm font-medium text-neutral-800">Execution pattern</label>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {SCHEDULE_MODES.map((m) => (
            <label
              key={m.id}
              className={`flex cursor-pointer flex-col rounded-lg border p-3 transition-colors ${
                scheduleMode === m.id
                  ? 'border-teal-500 bg-teal-50/80 ring-1 ring-teal-500'
                  : 'border-neutral-200 hover:bg-neutral-50'
              }`}
            >
              <div className="flex items-start gap-2">
                <input
                  type="radio"
                  name="exec-schedule-mode"
                  checked={scheduleMode === m.id}
                  onChange={() => setScheduleMode(m.id)}
                  className="mt-1 h-4 w-4 border-neutral-300 text-teal-600"
                />
                <div>
                  <span className="text-sm font-medium text-neutral-900">{m.label}</span>
                  <p className="mt-0.5 text-xs text-neutral-500">{m.description}</p>
                </div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {scheduleMode !== 'INSTANT' ? (
        <div className="space-y-4 rounded-lg border border-neutral-200 bg-neutral-50/50 p-4">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div>
              <label className="block text-sm font-medium text-neutral-800">Run times</label>
              <p className="text-xs text-neutral-500">
                Add multiple clocks for the same pattern (e.g. several runs per day or per month).
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {timeSlots.map((slot, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  type="time"
                  className="w-[7.5rem] shrink-0 rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                  value={slot}
                  onChange={(e) => updateTimeSlot(index, e.target.value)}
                />
                {index === timeSlots.length - 1 ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="shrink-0 gap-1"
                    onClick={addTimeSlot}
                  >
                    <FiPlus className="h-4 w-4" />
                    Next time slot
                  </Button>
                ) : null}
                <Button
                  type="button"
                  // variant="ghost"
                  size="sm"
                  className="shrink-0 text-neutral-400 text-red-600"
                  disabled={timeSlots.length <= 1}
                  onClick={() => removeTimeSlot(index)}
                  aria-label="Remove time"
                >
                  <FiTrash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          {scheduleMode === 'WEEKLY_MULTI' ? (
            <div>
              <label className="mb-2 block text-sm font-medium text-neutral-800">Weekdays</label>
              <div className="flex flex-wrap gap-3">
                {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map((day) => (
                  <label key={day} className="flex cursor-pointer items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={daysOfWeek.includes(day)}
                      onChange={() =>
                        setDaysOfWeek((prev) =>
                          prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day],
                        )
                      }
                      className="h-4 w-4 rounded border-neutral-300 text-teal-600"
                    />
                    {day}
                  </label>
                ))}
              </div>
              {daysOfWeek.length === 0 ? (
                <p className="mt-1 text-xs text-red-600">Select at least one day.</p>
              ) : null}
            </div>
          ) : null}

          {scheduleMode === 'MONTHLY' ? (
            <div>
              <label className="mb-1 block text-sm font-medium text-neutral-800">
                Day of month (1–31)
              </label>
              <input
                type="number"
                min={1}
                max={31}
                className="w-full max-w-[12rem] rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                value={dayOfMonth}
                onChange={(e) =>
                  setDayOfMonth(Math.max(1, Math.min(31, Number(e.target.value) || 1)))
                }
              />
              <p className="mt-1 text-xs text-neutral-500">
                For months with fewer days, schedulers typically use the last day of the month when N exceeds it.
              </p>
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="rounded-md border border-neutral-200 bg-neutral-50 p-4">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-sm font-medium text-neutral-800">Generated schedule value</h3>
          <span className="text-xs text-neutral-500">Quartz.NET · multiple joined with &quot; | &quot;</span>
        </div>
        <div className="mb-2 rounded-md bg-neutral-900 p-3 font-mono text-sm text-green-400">
          {generatedCron || '—'}
        </div>
        <p className="text-sm text-neutral-600">{getReadableSchedule()}</p>
      </div>
    </div>
  )
}

export { IncentiveConfig }
