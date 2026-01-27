export type LoadoutMetadata = {
  raw: string
  kind: string
  scope: string
  storage: string
  guid?: string
  timestampRaw?: string
  timestamp?: Date
  name?: string
  version?: string
}

const LOADOUT_REGEX = /\[loa=([^\]]+)\]/

export function parseLoadoutCode(input: string): LoadoutMetadata | null {
  const match = input.match(LOADOUT_REGEX)
  if (!match) return null

  const payload = match[1]
  const parts = payload.split(':')
  if (parts.length < 6) return null

  const [kind, scope, storage, guid, timestampRaw, name, version] = parts

  const timestamp = parseTimestamp(timestampRaw)

  return {
    raw: input,
    kind,
    scope,
    storage,
    guid,
    timestampRaw,
    timestamp,
    name,
    version,
  }
}

function parseTimestamp(value?: string) {
  if (!value) return undefined
  const numeric = Number(value)
  if (Number.isNaN(numeric) || numeric <= 0) return undefined

  // Heuristic: large numbers look like .NET ticks.
  if (numeric > 1e12) {
    const ticks = BigInt(value)
    const epochTicks = BigInt('621355968000000000') // 1970-01-01
    if (ticks <= epochTicks) return undefined
    const millis = Number((ticks - epochTicks) / BigInt(10000))
    return new Date(millis)
  }

  // Seconds or millis since epoch.
  if (numeric < 1e11) {
    return new Date(numeric * 1000)
  }
  return new Date(numeric)
}
