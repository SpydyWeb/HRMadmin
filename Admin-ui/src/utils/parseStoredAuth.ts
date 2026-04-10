/**
 * Session is usually stored as JSON: `{"token":"...","refreshToken":"..."}`.
 * Some paths or legacy values store a raw JWT (`eyJ...`), which is not valid JSON.
 */
export function parseStoredAuth(raw: string | null): {
  token: string
  refreshToken?: string
} | null {
  if (raw == null) return null
  const s = String(raw).trim()
  if (!s) return null

  if (s.startsWith('{')) {
    try {
      const o = JSON.parse(s) as Record<string, unknown>
      if (o && typeof o === 'object' && typeof o.token === 'string') {
        return {
          token: o.token,
          refreshToken:
            typeof o.refreshToken === 'string' ? o.refreshToken : undefined,
        }
      }
    } catch {
      return null
    }
    return null
  }

  const parts = s.split('.')
  if (parts.length === 3 && parts.every((p) => p.length > 0)) {
    return { token: s }
  }

  return null
}
