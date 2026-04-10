export function toVarName(input: string): string {
  const base = (input ?? '')
    .toLowerCase()
    .trim()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')

  if (!base) return 'kpi'
  if (/^[a-z_]/.test(base)) return base
  return `kpi_${base}`
}
